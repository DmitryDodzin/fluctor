
const Immutable = require('immutable');

const ModificationTypes = require('../comm/modification.types');
const StateContainer = require('../state/state.container');
const TransactionExecuter = require('./transaction.executer');

class Transaction {

  constructor(state_container) {
    this.temp_state = new StateContainer(state_container.state);
    this.modificationQueue = Immutable.List([]);
  }

  get modifications(){
    return this.modificationQueue.toJS();
  }

  _test_modification(modification){
    if(this.temp_state){
      TransactionExecuter.modificationRedcuer(this.temp_state, modification);
    }
  }

  _create_modification(modification){
    this._test_modification(modification);
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  set(path, value){
    return this._create_modification({
      type: ModificationTypes.SET,
      path,
      value
    });
  }

  remove(path){
    return this._create_modification({
      type: ModificationTypes.REMOVE,
      path
    });
  }

  push(path, value){
    return this._create_modification({
      type: ModificationTypes.LIST_APPEND,
      path,
      value
    });
  }

  increment(path, value){
    return this._create_modification({
      type: ModificationTypes.INCREMENT,
      path,
      value
    });
  }

  decrement(path, value){
    return this._create_modification({
      type: ModificationTypes.DECREMENT,
      path,
      value
    });
  }

  commit(callback){
    callback(this);
  }

  rollback (){
    return null;
  }

  toJSON(){
    return JSON.stringify(this.modificationQueue);
  }
}

module.exports = Transaction;