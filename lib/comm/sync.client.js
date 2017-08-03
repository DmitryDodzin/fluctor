
const uuid = require('uuid');
const Redis = require('ioredis');
const EventEmitter = require('events');

const Transaction = require('../transaction/transaction');
const TransactionExecuter = require('../transaction/transaction.executer');
const BlockChain = require('../blockchain/blockchain');

class SyncClient extends EventEmitter {

  constructor(state_container, block_chain, options={}) {
    super();
    Object.assign(this, { state_container, block_chain });

    this.redis_sub = Redis(options);
    this.redis_pub = this.redis_sub.duplicate();
    this.redis_sub.on('ready', () => this.setup());
  }

  get wait() {
    let _this = this;
    return {
      start() {
        if(!_this.waitQueue)
          _this.waitQueue = [];
      },
      end(){
        _this.executeWaitQueue();
      }
    };
  }

  executeWaitQueue(){
    let results = this.waitQueue.map(transaction => {
      let changes = TransactionExecuter.execute(this.state_container, transaction);
      return { transaction, changes };
    });
    delete this.waitQueue;
    this.emit('stateChange', { 
      type: 'multiple', 
      transactions: results.map(res => res.transaction), 
      changes: results.map(res => res.changes)
        });
  }

  setup(){
    this.setupSubscriber();
    this._bindEventHandlers();
    this.emit('ready', this);
  }

  _bindEventHandlers(){
    this.redis_sub.on('error', err => this.emit('error', err));
    this.redis_pub.on('error', err => this.emit('error', err));
  }

  setupSubscriber(){
    this.redis_sub.on('message', (channel, message) => {
      var transaction = JSON.parse(message);
      if(this.waitQueue){
        this.waitQueue.push(transaction);
      } else {
        let changes = TransactionExecuter.execute(this.state_container, transaction);
        this.emit('stateChange', { type: 'single', transaction, changes });
      }
    });

    this.redis_sub.subscribe('state:update');
  }

  publish(transaction){
    if(transaction instanceof Transaction){
      this.block_chain.append(transaction);
      this.redis_pub.publish("state:update", transaction.toJSON());
    } else {
      throw new Error('Cannot publis a non transaction');
    }
  }

}

module.exports = SyncClient;