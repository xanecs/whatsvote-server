'use strict';
let Voting = require('./voting');

module.exports = class SingleChoiceVorting extends Voting {
  castVote(body) {
    return new Promise((resolve, reject) => {
      let optionId = body.optionId;

      this.r.table('polls').get(this.poll.id).update(poll => {
        let changes = {
          tokens: poll('tokens').filter(chtoken => {
            return chtoken('token').ne(this.token);
          }),
          votes: {}
        };
        changes.votes[optionId.toString()] = poll('votes')(optionId.toString()).append(this.voterPhone);
        return changes;
      }, {
        returnChanges: true
      }).then(result => {
        if (result.skipped + result.unchanged + result.errors > 0) {
          return reject(result);
        }
        resolve(result.changes[0].new_val);
      });
    });
  }
}
