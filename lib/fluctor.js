
const EventEmitter = require('events');

const StateContainer = require('./state/state.container');
const SyncClient = require('./comm/sync.client');
const Transaction = require('./transaction/transaction');
const BlockChain = require('./blockchain/blockchain');
const RedisAppender = require('./blockchain/appenders/redis.appender');

class Fluctor extends EventEmitter {

  constructor(options) {
    super();
    options = options || {};
    this.state_container = new StateContainer(options.initial);
    this.blockchain = new BlockChain();
    this.sync_client = new SyncClient(this.state_container, this.blockchain);
    this.setup();
  }

  setup(){
    this._bindEventHandlers();

    var sync_client_ready = new Promise(resolve => this.sync_client.on('ready', resolve));
    var blockchain_ready = this.blockchain
      .init()
      .then(() => this.blockchain.apply(this.state_container));

    Promise.all([sync_client_ready, blockchain_ready])
      .then(() => this.emit('ready', this))
      .catch(err => this.emit('error', err)); 
  }

  _bindEventHandlers(){
    this.sync_client.on('stateChange', () => this.emit('stateChange'));
  }

  get state(){
    return this.state_container.state;
  }

  get tran(){
    return this.transaction;
  }

  get transaction(){
    var _this = this;
    return {
      begin() {
        var transaction = new Transaction(_this.state_container);
        transaction.commit = transaction.commit.bind(transaction, this.commit);
        return transaction;
      },
      commit(transaction) {
        _this.sync_client.publish(transaction);
      }
    };
  }

}


module.exports = Fluctor;