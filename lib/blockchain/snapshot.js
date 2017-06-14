const uuid = require('uuid');

class Snapshot {

  constructor(state, block, appender) {
    this.id = uuid.v4();
    this.timestamp = new Date();
    
    if(block)
      this.block = block.id;

    Object.assign(this, { state, appender });
  }

  push(){
    if(this.appender)
      return this.appender.pushSnapshot(this);
    else
      return Promise.reject(new Error('No Appender Was Registered to the snapshot'));
  }

}

module.exports = Snapshot;