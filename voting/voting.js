'use strict';
let config = require('../config.json');

class Voting {
  static get(pollId, checkToken, r) {
    return new Promise((resolve, reject) => {
      r.table('polls').get(pollId).then(poll => {
          switch (poll.method) {
            case 'single-choice':
              resolve(new (require('./single'))(poll, checkToken, r));
              break;
            case 'multiple-choice':
              resolve(new (require('./multiple'))(poll, checkToken, r));
              break;
          }
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
    });
  }

  constructor(poll, checkToken, r) {
    this.r = r;
    this.token = checkToken;
    this.poll = poll;
  }

  verifyToken() {
    let tokenValid = false;
    for (let checkToken of this.poll.tokens) {
      if (checkToken.token === this.token) {
        tokenValid = true;
        this.voterPhone = checkToken.phone;
      }
    }

    if (!tokenValid) {
      return false;
    }

    return true;
  }

  checkDone(upPoll, whatsapp) {
    if (upPoll.tokens.length == 0) {
      this.r.table('users').get(upPoll.userId)('groups').filter({id: upPoll.groupId}).then(group => {
        whatsapp.sendMessage(group[0].jid, `The results are in. Look at them at ${config.frontend}results/${upPoll.id}`);
      });
    }
  }

}

module.exports = Voting;
