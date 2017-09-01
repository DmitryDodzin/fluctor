const uuid = require('uuid');

class Snapshot {

  constructor(state, block, appender) {
    this.id = uuid.v4();
    this.timestamp = Date.now();
    
    if(block)
      this.block = block.id;

    Object.assign(this, { state, appender });
  }

  push() {
    if(this.appender)
      return this.appender.pushSnapshot(this);
    else
      return Promise.reject(new Error('No Appender Was Registered to the snapshot'));
  }

  toJSON() {
    return JSON.stringify({
      id: this.id, 
      timestamp: this.timestamp,
      state: this.state,
      block: this.block
    });
  }

  static creare(state, lastBlock, appender) {
    let snapshot = new Snapshot(state, lastBlock, appender);
    return snapshot;
  }

}

module.exports = Snapshot;