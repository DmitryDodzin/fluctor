
const EventEmitter = require('events');

const StateContainer = require('./state/state.container');
const SyncClient = require('./comm/sync.client');
const Transaction = require('./transaction/transaction');
const BlockChain = require('./blockchain/blockchain');
const RedisAppender = require('./blockchain/appenders/redis.appender');

class Fluctor extends EventEmitter {

  constructor(options={}) {
    super();
    this.options = options;
    this.state_container = new StateContainer(this.options.initial);
    this.blockchain = new BlockChain();
    this.sync_client = new SyncClient(this.state_container, this.blockchain, this.options.connection);
    this.sync_client.wait.start();
    this.setup();
  }

  setup(){
    this._bindEventHandlers();

    let sync_client_ready = new Promise(resolve => this.sync_client.on('ready', resolve));
    let blockchain_ready = this.blockchain
      .init(this.options.connection)
      .then(() => this.blockchain.apply(this.state_container));

    Promise.all([sync_client_ready, blockchain_ready])
      .then(() => this.sync_client.wait.end())
      .then(() => this.emit('ready', this))
      .catch(err => this.emit('error', err));
  }

  _bindEventHandlers(){
    this.sync_client.on('stateChange', () => this.emit('stateChange'));

    this.sync_client.on('error', err => this.emit('error', err));
  }

  get state(){
    return this.state_container.state;
  }

  get tran(){
    return this.transaction;
  }

  get transaction(){
    let _this = this;
    return {
      begin() {
        let transaction = new Transaction(_this.state_container);
        transaction.commit = transaction.commit.bind(transaction, this.commit);
        return transaction;
      },
      commit(transaction) {
        return new Promise((resolve, reject) => {
          _this.sync_client.publish(transaction);

          let timeoutDuration = !isNaN(_this.options.timeout) ? _this.options.timeout : 30 * 1000; // Is none instead of just default to allow 0 as timeout

          let tranTimeout = setTimeout(
            () => reject(new Error('Timeout, Execution Exceeded ' + timeoutDuration)), 
            timeoutDuration
          );

          let transactionCommited = tran => {
            if(
              tran.id == transaction.id || 
              ( tran.type === 'multiple' && 
                tran.ids.indexOf(transaction.id) !== -1) )
            {
              // Cleanup
              _this.sync_client.removeListener('stateChange', transactionCommited);
              clearTimeout(tranTimeout);

              resolve(_this.state);
            }
          };

          _this.sync_client.on('stateChange', transactionCommited);
        });
      }
    };
  }

}


module.exports = Fluctor;