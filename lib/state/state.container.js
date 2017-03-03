
const _ = require('lodash');
const Immutable = require('immutable');

class StateContainer {

  constructor(initialState={}) {
    this.rewrite(initialState);
  }

  rewrite(state){
    this._state = Immutable.fromJS(state);
  }

  get state(){
    return this._state.toJS();
  }

  get(path){
    if(!path)
      return this._state;
    if(!Array.isArray(path))
      path = path.split('.');
    return this._state.getIn(path);
  }

  set(path, modification){
    if(!Array.isArray(path))
      path = path.split('.');
    this._state =this._state.updateIn(path, modification);
  }

  remove(path){
    if(!path)
      throw new Error('Cannot remove root, path is required');
    if(!Array.isArray(path))
      path = path.split('.');

    if(path.length === 0){
      throw new Error('Cannot remove root, path is required');
    }
    this._state =this._state.removeIn(path);
  }
  
}

module.exports = StateContainer;