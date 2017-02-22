
const Redis = require('ioredis');
const Transaction = require('../transaction/transaction');
const TransactionExecuter = require('../transaction/transaction.executer');

class SyncClient {

  constructor(state_container, failover, options={}) {
    Object.assign(this, { state_container, failover });

    this.redis_sub = Redis(options);
    this.redis_pub = this.redis_sub.duplicate();
    this.redis_sub.on('ready', () => this.setupSubscriber());
  }

  setupSubscriber(){
    this.redis_sub.on('message', (channel, message) => {
      var transaction = JSON.parse(message);
      TransactionExecuter.execute(this.state_container, transaction);
    });

    this.redis_sub.subscribe('state:update');
  }

  createTransaction(){
    return new Transaction(this.state_container.state);
  }

  publish(transaction){
    if(transaction instanceof Transaction){
      TransactionExecuter.execute(this.state_container, transaction.modifications);
      this.redis_pub.publish("state:update", transaction.toJSON());
      this.failover.setState(this.failover.getTime(), this.state_container.state);
    } else {
      throw new Error('Cannot publis a non transaction');
    }
  }

}

module.exports = SyncClient;