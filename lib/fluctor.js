
const EventEmitter = require('events');

const StateContainer = require('./state/state.container');
const SyncClient = require('./comm/sync.client');
const Transaction = require('./transaction/transaction');
const TransactionTransport = require('./transaction/transaction.transport');
const BlockChain = require('./blockchain/blockchain');
const Snapshot = require('./blockchain/snapshot');
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
      .then(() => this.blockchain.blocks.on('pushed', ({ block }) => this.appender.pushBlock(block)))
      .then(() => this.appender.load())
      .then(({ state, blockchain }) => {

        if(state)
          this.state_container.rewrite(state);

        blockchain
          .map(block => BlockChain.Block.load(block))
          .forEach(block => this.blockchain.append(block));
        
        this.blockchain.apply(this.state_container);
      })
      .then(() => this.sync_client.wait.end())
      .then(() => this.emit('ready', this))
      .then(() => this.snapshot.next())
      .catch(err => this.emit('error', err));
  }

  _bindEventHandlers(){
    this.sync_client.on('stateChange', () => this.emit('stateChange'));

    this.sync_client.client.on('snapshot', () => this.snapshot.next());

    this.sync_client.on('error', err => this.emit('error', err));
  }

  get snapshot() {
    let _this = this;
    return {
      create() {
        let snapshot = new Snapshot(_this.state, _this.blockchain.tail, _this.appender);
        return snapshot;
      },
      save(snapshot) {
        snapshot = snapshot || this.create();
        _this.sync_client.publish.snapshot(snapshot);
        return snapshot.push();
      },
      next() {
        if(_this.nextSnapshot)
          clearTimeout(_this.nextSnapshot);
        let time = ( _this.options.snapshotInterval || 1000 * 60 * 60 ) + Math.random() * ( _this.options.snapshotRandom || 10000 );
        _this.nextSnapshot = setTimeout(() => this.save(), time);
      }
    };
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