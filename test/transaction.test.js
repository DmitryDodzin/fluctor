const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const Transaction = require('../lib/transaction/transaction');
const TransactionExecuter = require('../lib/transaction/transaction.executer');

describe('Transaction', () => {

  beforeEach(() => sinon.stub(TransactionExecuter, 'modificationRedcuer'));
  afterEach(() => TransactionExecuter.modificationRedcuer.restore());

  it('Correct Initialisation', () => {

    expect(() => new Transaction(undefined)).to.throw(Error);

    let state_container = { state: { foo: 'bar' } };

    let transaction = new Transaction(state_container);

    expect(transaction.temp_state.state).to.deep.equal(state_container.state);
  });

  it('Modification Queue', () => {
    let state_container = { state: { foo: 'bar' } };

    let transaction = new Transaction(state_container);

    expect(transaction.modifications).to.be.instanceOf(Array);

    expect(transaction.toJSON()).to.equal('[]');
  });

  it('Modification Testing', () => {

    let state_container = { state: { foo: 'bar' } };
    let modification = { some: 'modification' };

    let transaction = new Transaction(state_container);

    transaction._test_modification(modification);

    assert(TransactionExecuter.modificationRedcuer.calledOnce);

    delete transaction.temp_state;

    expect(() => transaction._test_modification(modification)).to.not.throw();

    assert(TransactionExecuter.modificationRedcuer.calledOnce); // Test that the call count didn't change
  });

  it('Set', () => {

    let state_container = { state: { foo: 'bar' } };
    let modification = { type: 'SET', path: 'foo', value: 'bar2000' };

    let transaction = new Transaction(state_container);

    transaction.set(modification.path, modification.value);

    assert(TransactionExecuter.modificationRedcuer.calledOnce);
    expect(TransactionExecuter.modificationRedcuer.getCall(0).args[1]).to.deep.equal(modification);
    expect(transaction.modifications.pop()).to.deep.equal(modification);

    expect(transaction.toJSON()).to.equal(JSON.stringify([modification]));
  });

  it('Remove', () => {

    let state_container = { state: { foo: 'bar' } };
    let modification = { type: 'REMOVE', path: 'foo' };

    let transaction = new Transaction(state_container);

    transaction.remove(modification.path);

    assert(TransactionExecuter.modificationRedcuer.calledOnce);
    expect(transaction.modifications.pop()).to.deep.equal(modification);
    expect(transaction.toJSON()).to.equal(JSON.stringify([modification]));
  });

  it('Push', () => {

    let state_container = { state: { foo: 'bar' } };
    let modification = { type: 'LIST_APPEND', path: 'foo', value: 'bar' };

    let transaction = new Transaction(state_container);

    transaction.push(modification.path, modification.value);

    assert(TransactionExecuter.modificationRedcuer.calledOnce);
    expect(TransactionExecuter.modificationRedcuer.getCall(0).args[1]).to.deep.equal(modification);
    expect(transaction.modifications.pop()).to.deep.equal(modification);
    expect(transaction.toJSON()).to.equal(JSON.stringify([modification]));
  });

  it('Increment', () => {

    let state_container = { state: { foo: 1 } };
    let modification = { type: 'INCREMENT', path: 'foo', value: undefined };

    let transaction = new Transaction(state_container);

    transaction.increment(modification.path);

    expect(TransactionExecuter.modificationRedcuer.getCall(0).args[1]).to.deep.equal(modification);
    expect(transaction.modifications.pop()).to.deep.equal(modification);

    expect(transaction.toJSON()).to.equal(JSON.stringify([modification]));
  });

  it('Decrement', () => {

    let state_container = { state: { foo: 1 } };
    let modification = { type: 'DECREMENT', path: 'foo', value: undefined };

    let transaction = new Transaction(state_container);

    transaction.decrement(modification.path);

    expect(TransactionExecuter.modificationRedcuer.getCall(0).args[1]).to.deep.equal(modification);
    expect(transaction.modifications.pop()).to.deep.equal(modification);

    expect(transaction.toJSON()).to.equal(JSON.stringify([modification]));
  });

  it('Commit and Rollback', () => {

    let state_container = { state: { foo: 'bar' } };
    let transaction = new Transaction(state_container);
    let callback = sinon.spy();

    transaction.commit(callback);

    assert(callback.calledOnce);

    expect(transaction.rollback()).to.equal(null);

  });


});