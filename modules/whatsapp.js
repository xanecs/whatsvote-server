'use strict';
let mqtt = require('mqtt');

let client = mqtt.connect('mqtt://192.168.99.100:32768');

client.on('connect', function () {
  client.subscribe('whatsapp/incoming');
  client.subscribe('whatsapp/iq');
  /*client.publish('whatsapp/outgoing', JSON.stringify({
    phone: '491629381521-1404226069',
    message: 'Hallo Menschen'
  }));*/
  client.publish('whatsapp/cmd', JSON.stringify({
    cmd: 'group_info',
    phone: '491629381521-1404226069'
  }));
});

client.on('message', function (topic, payload) {
  if (topic === 'whatsapp/incoming') {
    let message = JSON.parse(payload);
    console.log('[' + message.phone + '] ' + message.message);
  } else if (topic === 'whatsapp/iq') {
    console.log(JSON.parse(payload));
  }
});
