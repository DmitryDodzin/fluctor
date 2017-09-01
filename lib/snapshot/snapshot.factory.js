
const Snapshot = require('./snapshot');

const DEFAULTS = {
  interval: 1000 * 60 * 60,
  random: 1000
};

class SnapshotFactory {

  constructor(state_container, blockchain, appender, sync_client, options=DEFAULTS) {
    Object.assign(this, { state_container, blockchain, appender, sync_client, options });

    sync_client.on('snapshot', () => this.next());
  }

  create(state) {
    return new Snapshot(this.state_container.state, this.blockchain.tail, this.appender);
  }

  save(snapshot) {
    snapshot = snapshot || this.create();
    this.sync_client.publish.snapshot(snapshot);
    return snapshot.push();
  }

  next() {
    if(this.nextSnapshot)
      clearTimeout(this.nextSnapshot);
    let time = this.options.interval + Math.random() * this.options.random;
    this.nextSnapshot = setTimeout(() => this.save(), time);
  }
}

module.exports = SnapshotFactory;