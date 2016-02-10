'use strict';

let uuid = require('node-uuid');
let config = require('../config.json');

class WhatsApp {
  constructor(r, mqtt) {
    this.r = r;
    this.mqtt = mqtt;
    this.hookMqtt();
    this.callbacks = {};
  }

  hookMqtt() {
    this.mqtt.on('message', (topic, message) => {
      let payload = JSON.parse(message);
      switch (topic) {
        case 'whatsapp/incoming':
          this.handleMessage(payload);
          break;
        case 'whatsapp/iq':
          this.handleIq(payload);
          break;
      }
    });
  }

  getCallback() {
    let callbackId = uuid.v4();
    let promise = new Promise((resolve, reject) => {
      this.callbacks[callbackId] = (result) => {
        resolve(result);
        delete this.callbacks[callbackId];
      };
    });
    return {promise: promise, callbackId: callbackId};
  }

  getGroupInfo(userId, jid) {
    let callback = this.getCallback();
    this.mqtt.publish('whatsapp/cmd', JSON.stringify({
      cmd: 'group_info',
      phone: jid,
      callback: JSON.stringify({
        userId: userId,
        uuid: callback.callbackId
      })
    }));
    return callback.promise;
  }
  
  sendMessage(phones, message) {
    if (Array.isArray(phones)) {
      for (let phone of phones) {
        this.sendSingleMessage(phone, message);
      }
    } else {
      this.sendSingleMessage(phones, message);
    }
  }
  
  sendSingleMessage(phone, message) {
    this.mqtt.publish('whatsapp/outgoing', JSON.stringify({
      phone: phone,
      message: message
    }));
  }

  handleMessage(message) {
    if (!message.message.startsWith('whatsvote ')) return;
    let msgArr = message.message.split(' ');
    let email = msgArr[1];
    let registertoken = msgArr[2];
    let jid = message.phone;

    this.r.table('users').get(email).update({
      groups: this.r.row('groups').map(group => {
        return this.r.branch(
          group('registertoken').eq(registertoken),
          group.merge({linked: true, jid: jid}),
          group
        );
      })
    }).then(result => {
      if (result.skipped + result.unchanged > 0) {
        this.sendMessage(
          jid,
          'Sorry, I couldn\'t find a group with this email and token. Please check your last message for typos and try again.'
        );
        return;
      }
      this.sendMessage(
        jid,
        `This group is now registered at WhatsVote. Learn more at ${config.frontend}`
      );
      this.getGroupInfo(email, jid);
    });
  }

  handleIq(message) {
    let callback = JSON.parse(message.callback);
    if (message.cmd == 'group_info') {
      let userId = callback.userId;
      let participants = [];

      for (let participant in message.participants) {
        let phone = participant.split('@')[0];
        if (phone != config.bot) participants.push(phone);
      }

      this.r.table('users').get(userId).update({
        groups: this.r.row('groups').map(group => {
          return this.r.branch(
            group('jid').default('').eq(message.groupId),
            group.merge({participants: participants}),
            group
          );
        })
      }).then(result => {
        message.participants = participants;
        delete message.callback;
        this.callbacks[callback.uuid](message);
      });
    }
  }
}

module.exports = WhatsApp;
