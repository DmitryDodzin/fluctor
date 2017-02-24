
const EventEmitter = require('events');

const StateContainer = require('./state/state.container');
const SyncClient = require('./comm/sync.client');
const Transaction = require('./transaction/transaction');

class Fluctor extends EventEmitter {

  constructor(options) {
    super();
    options = options || {};
    this.state_container = new StateContainer(options.initial);
    this.sync_client = new SyncClient(this.state_container);
    this.setup();
  }

  setup(){
    this._bindEventHandlers();
    this.sync_client.on('ready', () => this.emit('ready', this));
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