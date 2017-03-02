
const chai = require('chai');
const expect = chai.expect;

const Immutable = require('immutable');

const StateContainer = require('../lib/state/state.container');

describe('StateContainer', () => {

  it('IntialState', () => {
    let initialState = {
      foo: 'bar'
    };

    let state_container = new StateContainer(initialState);

    expect(state_container.state).to.deep.equal(initialState);
  });

  it('Rewrite', () => {
    let state_container = new StateContainer({ foo: 'bar' });
   
    let overrideState = {
      foo: 'bar2000'
    };

    state_container.rewrite(overrideState);

    expect(state_container.state).to.deep.equal(overrideState);
  });

  it('Get', () => {
    let state = {
      foo: 'bar2000',
      deep: { json: 'data' }
    };

    let state_container = new StateContainer(state);
   
    expect(state_container.get().toJS()).to.deep.equal(state);
    expect(state_container.get('deep').toJS()).to.deep.equal(state.deep);

    expect(state_container.get('foo')).to.equal(state.foo);
    expect(state_container.get(['foo'])).to.equal(state.foo);
    expect(state_container.get('deep.json')).to.equal(state.deep.json);
    expect(state_container.get(['deep', 'json'])).to.equal(state.deep.json);
  });

  it('Set', () => {
    let state = {
      foo: 'bar2000',
      deep: { json: 'data' },
      array: []
    };

    let nextState = {
      foo: 'bar3000',
      deep: { json: 'stuff' },
      array: [ 1 ]
    };

    let dot_state_container = new StateContainer(state);
    let array_state_container = new StateContainer(state);

    dot_state_container.set('foo', () => nextState.foo);
    array_state_container.set(['foo'], () => nextState.foo);
    dot_state_container.set('deep.json', () => nextState.deep.json);
    array_state_container.set(['deep', 'json'], () => nextState.deep.json);
    dot_state_container.set('array', (arr) => arr.push(nextState.array[0]));
    array_state_container.set(['array'], (arr) => arr.push(nextState.array[0]));
   
    expect(dot_state_container.state).to.deep.equal(nextState);
    expect(array_state_container.state).to.deep.equal(nextState);
  });

  it('Remove', () => {
    let state = {
      foo: 'bar2000',
      deep: { json: 'data' },
      array: [1]
    };

    let nextState = {
      deep: { },
      array: []
    };

    let dot_state_container = new StateContainer(state);
    let array_state_container = new StateContainer(state);

    dot_state_container.remove('foo');
    array_state_container.remove(['foo']);
    dot_state_container.remove('deep.json');
    array_state_container.remove(['deep', 'json']);
    dot_state_container.remove('array.0');
    array_state_container.remove(['array', '0']);

    expect(dot_state_container.state).to.deep.equal(nextState);
    expect(array_state_container.state).to.deep.equal(nextState);

    expect(dot_state_container.remove).to.throw(Error);
    expect(array_state_container.remove).to.throw(Error);
    expect(() => dot_state_container.remove('')).to.throw(Error);
    expect(() => array_state_container.remove([])).to.throw(Error);
  });

});