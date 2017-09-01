
const uuid = require('uuid');
const Immutable = require('immutable');

const ModificationTypes = require('../comm/modification.types');
const StateContainer = require('../state/state.container');
const TransactionExecuter = require('./transaction.executer');

class Transaction {

  constructor(state_container) {
    this.temp_state = new StateContainer(state_container.state);
    this.modificationQueue = Immutable.List([]);
    this.id = uuid.v4();

    // The Api Functions are created Dynamicly
    this._create_functions();
  }

  get modifications(){
    return this.modificationQueue.toJS();
  }

  _test_modification(modification) {
    if(this.temp_state){
      TransactionExecuter.modificationRedcuer(this.temp_state, modification);
    }
  }

  _create_modification(modification) {
    this._test_modification(modification);
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  _create_functions() {
    Object.keys(ModificationTypes).forEach(type => {
      this[type.toLowerCase()] = 
        (path, value) => this._create_modification({ type, path, value });
    });
  }

  commit(callback){
    return callback(this);
  }

  rollback (){
    return null;
  }

  toJSON(){
    return JSON.stringify({
      id: this.id, 
      modifications: this.modifications
    });
  }
}

module.exports = Transaction;