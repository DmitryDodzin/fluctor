const uuid = require('uuid');

class Snapshot {

  constructor(state, appender) {
    this.id = uuid.v4();
    this.timestamp = new Date();

    Object.assign(this, { state, appender });
  }

  push(){
    return this.appender.pushSnapshot(this);
  }

}

module.exports = Snapshot;