
const Immutable = require('immutable');
const ModificationTypes = require('../comm/modification.types');

module.exports = {

  execute(state_container, modification_queue){
    var before_state = state_container.state;

    try{
      modification_queue.forEach(modification => {
        this.modificationRedcuer(state_container, modification);
      });  
    } catch(e){
      state_container.rewrite(before_state);
      throw e;
    }
  },

  modificationRedcuer(state_container, modification){
    switch(modification.type){

      case ModificationTypes.SET:
        return state_container.set(modification.path, () => Immutable.fromJS(modification.value));

      case ModificationTypes.REMOVE:
        return state_container.remove(modification.path);

      case ModificationTypes.LIST_APPEND:
        return state_container.set(modification.path, (list) => list.push(Immutable.fromJS(modification.value)));

      case ModificationTypes.INCREMENT:
        let inc = modification.value || 1;
        let inc_value = state_container.get(modification.path);
        return state_container.set(modification.path, () => inc_value + inc);

      case ModificationTypes.DECREMENT:
        let dec = modification.value || 1;
        let dec_value = state_container.get(modification.path);
        return state_container.set(modification.path, () => dec_value - dec);
    }
  }
};  