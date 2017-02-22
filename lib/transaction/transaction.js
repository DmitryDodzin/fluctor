
const Immutable = require('immutable');

const ModificationTypes = require('../comm/modification.types');
const StateContainer = require('../state/state.container');

class Transaction {

  constructor(updateState) {
    this.modificationQueue = Immutable.List([]);
  }

  get modifications(){
    return this.modificationQueue.toJS();
  }

  set(path, value){
    let modification = {
      type: ModificationTypes.SET,
      path,
      value
    };
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  remove(path){
    let modification = {
      type: ModificationTypes.REMOVE,
      path
    };
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  push(path, value){
    let modification = {
      type: ModificationTypes.LIST_APPEND,
      path,
      value
    };
    this.modificationQueue = this.modificationQueue.push(modification);
    return this;
  }

  toJSON(){
    return JSON.stringify(this.modificationQueue);
  }
}

module.exports = Transaction;