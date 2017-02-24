
const Redis = require('ioredis');
const EventEmitter = require('events');

const Transaction = require('../transaction/transaction');
const TransactionExecuter = require('../transaction/transaction.executer');

class SyncClient extends EventEmitter {

  constructor(state_container, options={}) {
    super();
    Object.assign(this, { state_container });

    this.redis_sub = Redis(options);
    this.redis_pub = this.redis_sub.duplicate();
    this.redis_sub.on('ready', () => this.setup());
  }

  setup(){
    this.setupSubscriber();
    this.emit('ready', this);
  }

  setupSubscriber(){
    this.redis_sub.on('message', (channel, message) => {
      var transaction = JSON.parse(message);
      TransactionExecuter.execute(this.state_container, transaction);
      this.emit('stateChange');
    });

    this.redis_sub.subscribe('state:update');
  }

  publish(transaction){
    if(transaction instanceof Transaction){
      this.redis_pub.publish("state:update", transaction.toJSON());
    } else {
      throw new Error('Cannot publis a non transaction');
    }
  }

}

module.exports = SyncClient;