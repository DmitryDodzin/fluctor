const uuid = require('uuid');

class Snapshot {

  constructor(state, block, appender) {
    this.id = uuid.v4();
    this.timestamp = new Date();

    Object.assign(this, { state, block, appender });
  }

  push(){
    return this.appender.pushSnapshot(this);
  }

}

module.exports = Snapshot;