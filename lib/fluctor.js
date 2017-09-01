
const EventEmitter = require('events');

const StateContainer = require('./state/state.container');
const SyncClient = require('./comm/sync.client');
const Transaction = require('./transaction/transaction');
const TransactionTransport = require('./transaction/transaction.transport');
const BlockChain = require('./blockchain/blockchain');
const Snapshot = require('./snapshot/snapshot');
const SnapshotFactory = require('./snapshot/snapshot.factory');
const AppenderFactory = require('./blockchain/appender.factory');

class Fluctor extends EventEmitter {

  constructor(options={}) {
    super();
    this.options = options;
    this.state_container = new StateContainer(this.options.initial);
    this.blockchain = new BlockChain();
    this.sync_client = new SyncClient(this.state_container, this.blockchain, this.options.connection);
    this.transaction_transport = new TransactionTransport(this.sync_client, options.timeout);
    this.sync_client.wait.start();
    this._setup();
  }

  _setup(){
    this._bindEventHandlers();

    AppenderFactory.create('redis', this.options.connection)
      .then(appender => this.appender = appender)
      .then(() => 
        this.snapshot_factory = new SnapshotFactory(
          this.state_container, 
          this.blockchain, 
          this.appender, 
          this.sync_client, 
          this.options.snapshot
        )
      )
      .then(() => this.blockchain.blocks.on('pushed', ({ block }) => this.appender.pushBlock(block)))
      .then(() => this.appender.load())
      .then(({ state, blockchain }) => this.blockchain.load(state, blockchain, this.state_container))
      .then(() => this.sync_client.wait.end())
      .then(() => this.emit('ready', this))
      .then(() => this.snapshot.next())
      .catch(err => this.emit('initError', err));
  }

  _bindEventHandlers(){
    this.sync_client.on('stateChange', () => this.emit('stateChange'));
    this.sync_client.on('error', err => this.emit('error', err));
  }

  get snapshot() {
    return this.snapshot_factory;
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
        return _this.transaction_transport.publish(transaction);
      }
    };
  }

}


module.exports = Fluctor;