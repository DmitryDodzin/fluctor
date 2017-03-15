const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const TransactionExecuter = require('../lib/transaction/transaction.executer');

describe('Transaction Executer', () => {

  describe('Execute', () => {

    before(() => sinon.stub(TransactionExecuter, 'modificationRedcuer'));
    after(() => TransactionExecuter.modificationRedcuer.restore());

    it('Modification Queue', () => {
      let state_container = { state: {}, rewrite: sinon.spy() };
      let modification1 = { stuff: '1' };
      let modification2 = { stuff: '2' };

      TransactionExecuter.execute(state_container, [modification1, modification2]);

      assert(TransactionExecuter.modificationRedcuer.calledTwice);
      assert(TransactionExecuter.modificationRedcuer.calledWith(state_container, modification1));
      assert(TransactionExecuter.modificationRedcuer.calledWith(state_container, modification2));
    });

    it('Modification Error', () => {
      let state_container = { state: {}, rewrite: sinon.spy() };

      expect(() => TransactionExecuter.execute(state_container, undefined)).to.throw();

      assert(state_container.rewrite.calledOnce);
      assert(state_container.rewrite.calledWith(state_container.state));
    });

  });

  describe('Modification Reducer', () => {

    it('SET', () => {

      let state_container = { set: sinon.spy() };
      let modification = { type: 'SET', path: 'foo', value: 'bar' };

      TransactionExecuter.modificationRedcuer(state_container, modification);

      assert(state_container.set.calledOnce);

      expect(state_container.set.getCall(0).args[0]).to.equal(modification.path);
      expect(state_container.set.getCall(0).args[1].call()).to.equal(modification.value);

    });

    it('REMOVE', () => {

      let state_container = { remove: sinon.spy() };
      let modification = { type: 'REMOVE', path: 'foo' };

      TransactionExecuter.modificationRedcuer(state_container, modification);

      assert(state_container.remove.calledOnce);

      expect(state_container.remove.getCall(0).args[0]).to.equal(modification.path);
    });

    it('LIST_APPEND', () => {

      let state_container = { set: sinon.spy() };
      let modification = { type: 'LIST_APPEND', path: 'foo', value: 'bar' };

      TransactionExecuter.modificationRedcuer(state_container, modification);

      assert(state_container.set.calledOnce);

      expect(state_container.set.getCall(0).args[0]).to.equal(modification.path);

      let base_array = [];
      let result_array = [modification.value];

      state_container.set.getCall(0).args[1](base_array);

      expect(base_array).to.deep.equal(result_array);

    });

    it('INCREMENT', () => {

      let state_container = { set: sinon.spy(), get: () => 1 };
      let modification1 = { type: 'INCREMENT', path: 'foo' };
      let modification2 = { type: 'INCREMENT', path: 'foo', value: 1.1 };

      TransactionExecuter.modificationRedcuer(state_container, modification1);
      TransactionExecuter.modificationRedcuer(state_container, modification2);

      assert(state_container.set.calledTwice, 'Incorrect call count');

      expect(state_container.set.getCall(0).args[0]).to.equal(modification1.path);
      expect(state_container.set.getCall(0).args[1].call()).to.equal(state_container.get() + 1);

      expect(state_container.set.getCall(1).args[0]).to.equal(modification2.path);
      expect(state_container.set.getCall(1).args[1].call()).to.equal(state_container.get() + modification2.value);

    });

    it('DECREMENT', () => {

      let state_container = { set: sinon.spy(), get: () => 1 };
      let modification1 = { type: 'DECREMENT', path: 'foo' };
      let modification2 = { type: 'DECREMENT', path: 'foo', value: 1.1 };

      TransactionExecuter.modificationRedcuer(state_container, modification1);
      TransactionExecuter.modificationRedcuer(state_container, modification2);

      assert(state_container.set.calledTwice, 'Incorrect call count');

      expect(state_container.set.getCall(0).args[0]).to.equal(modification1.path);
      expect(state_container.set.getCall(0).args[1].call()).to.equal(state_container.get() - 1);

      expect(state_container.set.getCall(1).args[0]).to.equal(modification2.path);
      expect(state_container.set.getCall(1).args[1].call()).to.equal(state_container.get() - modification2.value);

    });

  });

});