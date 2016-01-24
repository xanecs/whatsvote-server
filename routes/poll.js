'use strict';
let validatePoll = require('../validations/poll');
let crypto = require('crypto');
let config = require('../config.json');

module.exports = function(router) {
  router.post('/polls', validatePoll(), function *(next) {
    let userId = this.state.user.email;
    let poll = this.request.body;

    poll.userId = userId;

    let groupResult = yield this.r.table('users').get(userId)('groups').filter({id: poll.groupId});

    if (!groupResult.length) {
      this.status = 401;
      this.body = {ok: false, message: 'The specified group was not found'};
      return;
    }

    let group = groupResult[0];
    let groupInfo = yield this.whatsapp.getGroupInfo(userId, group.jid);

    let tokens = [];

    for (let participant of groupInfo.participants) {
      tokens.push({
        phone: participant,
        token: crypto.randomBytes(8).toString('hex')
      });
    }

    poll.tokens = tokens;

    poll.votes = {};

    for (let option of poll.options) {
      poll.votes[option.id.toString()] = [];
    }

    let result = yield this.r.table('polls').insert(poll, {
      returnChanges: true
    });

    if (result.errors > 0) {
      this.status = 500;
      this.body = result.first_error.split(':')[0];
      return;
    }

    let pollResult = result.changes[0].new_val;

    for (let token of pollResult.tokens) {
      this.whatsapp.sendMessage(token.phone, `In the group '${groupInfo.subject}', the question '${pollResult.question}' was asked. To vote, visit: ${config.frontend}vote/${pollResult.id}/${token.token}`);
    }

    pollResult.ok = true;
    this.status = 200;
    this.body = pollResult;

  });

  router.get('/polls/vote/:pollid/:token', function *(next) {
    let pollId = this.params.pollid;
    let token = this.params.token;

    let poll = yield this.r.table('polls').get(pollId);

    if (!poll) {
      this.status = 404;
      this.body = {ok: false, message: 'Poll not found'};
      return;
    }

    let tokenValid = false;
    for (let checkToken of poll.tokens) {
      if (checkToken.token === token) {
        tokenValid = true;
      }
    }

    if (!tokenValid) {
      this.status = 401;
      this.body = {ok: false, message: 'Invalid token'};
      return;
    }

    delete poll.tokens;
    this.body = poll;
  });

  router.post('/polls/vote/:pollid/:token', function *(next) {
    let pollId = this.params.pollid;
    let token = this.params.token;
    let optionId = this.request.body.optionId;

    let poll = yield this.r.table('polls').get(pollId);

    if (!poll) {
      this.status = 404;
      this.body = {ok: false, message: 'Poll not found'};
      return;
    }

    let tokenValid = false;
    let voterPhone = '';
    for (let checkToken of poll.tokens) {
      if (checkToken.token === token) {
        tokenValid = true;
        voterPhone = checkToken.phone;
      }
    }

    if (!tokenValid) {
      this.status = 401;
      this.body = {ok: false, message: 'Invalid token'};
      return;
    }

    let result = yield this.r.table('polls').get(pollId).update(poll => {
      let changes = {
        tokens: poll('tokens').filter(chtoken => {
          return chtoken('token').ne(token);
        }),
        votes: {}
      };
      changes.votes[optionId.toString()] = poll('votes')(optionId.toString()).append(voterPhone);
      return changes;
    }, {
      returnChanges: true
    });
    console.log(result);
    if (result.skipped + result.unchanged + result.errors > 0) {
      this.status = 500;
      this.body = {ok: false};
      return;
    }

    let upPoll = result.changes[0].new_val

    if (upPoll.tokens.length == 0) {
      let group = yield this.r.table('users').get(upPoll.userId)('groups').filter({id: upPoll.groupId});
      this.whatsapp.sendMessage(group[0].jid, `The results are in. Look at them at ${config.frontend}results/${upPoll.id}`);
    }

    this.body = {ok: true};
  });

  router.get('/polls', function *(next) {
    let userId = this.state.user.email;
    let result = yield this.r.table('polls').filter({userId: userId});
    this.body = {ok: true, polls: result};
  });

  router.get('/polls/:id', function *(next) {
    let userId = this.state.user.email;
    let pollId = this.params.id;

    let result = yield this.r.table('polls').get(pollId)

    if (!result || result.userId !== userId) {
      this.status = 404;
      this.body = {ok: false, message: 'Poll does not exist or you don\'t own it'};
      return;
    }
    result.ok = true;
    this.body = result;
  });

  router.get('/results/:id', function *(next) {
    let pollId = this.params.id;

    let result = yield this.r.table('polls').get(pollId)

    if (!result || result.tokens.length !== 0) {
      this.status = 404;
      this.body = {ok: false, message: 'Poll does not exist or it isn\'t finished yet'};
      return;
    }
    result.ok = true;
    this.body = result;
  });


  router.delete('/polls/:id', function *(next) {
    let userId = this.state.user.email;
    let pollId = this.params.id;

    let result = yield this.r.table('polls').get(pollId);

    if (!result || result.userId !== userId) {
      this.status = 404;
      this.body = {ok: false, message: 'Poll does not exist or you don\'t own it'};
      return;
    }

    let delResult = yield this.r.table('polls').get(pollId).delete();
    if (result.errors > 0) {
      this.status = 500;
      this.body = {ok: false};
      return;
    }

    this.body = {ok: true};
  })
}