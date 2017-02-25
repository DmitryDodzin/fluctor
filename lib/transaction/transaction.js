
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

  set(path, value){
    let modification = {
      type: ModificationTypes.SET,
      path,
      value
    };

    this._test_modification(modification);
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  remove(path){
    let modification = {
      type: ModificationTypes.REMOVE,
      path
    };

    this._test_modification(modification);
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  push(path, value){
    let modification = {
      type: ModificationTypes.LIST_APPEND,
      path,
      value
    };
    
    this._test_modification(modification);
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
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