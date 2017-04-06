const uuid = require('uuid');

const AppenderFactory = require('./appenders/appender.factory');

class Snapshot {

  constructor(state, appender_options = {}) {
    this.id = uuid.v4();
    this.timestamp = new Date();

    Object.assign(this, { state, appender_options });
  }

  push(){
    return AppenderFactory.appender('redis', this.appender_options)
      .then(appender => appender.push_snapshot(this));
  }

}

module.exports = Snapshot;