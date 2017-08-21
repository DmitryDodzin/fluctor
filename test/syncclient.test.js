/* 
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const SyncClient = require('../lib/comm/sync.client');
const Transaction = require('../lib/transaction/transaction');
const TransactionExecuter = require('../lib/transaction/transaction.executer');

describe('Sync Client', () => {

  it('Initialsation', done=>{
    let sync_client = new SyncClient();
    sync_client.on('ready', () => done());
  });

  it('Error propogation', () => {
    let sync_client = new SyncClient();
    sync_client._bindEventHandlers();

    let callback = sinon.spy();

    sync_client.on('error', callback);

    sync_client.redis_sub.emit('error');
    sync_client.redis_pub.emit('error');

    assert(callback.calledTwice);
  });

  it('Wating Queue', () => {
    let state_container = { state: { foo: 'bar' } };
    let sync_client = new SyncClient(state_container);

    sinon.stub(sync_client, 'setup');
    sinon.stub(TransactionExecuter, 'execute');

    let modification1 = { id: 1 };
    let modification2 = { id: 2 };

    try {
       sync_client.wait.start();

      let waitQueue = sync_client.waitQueue;

      sync_client.wait.start();

      expect(sync_client.waitQueue).to.equal(waitQueue);

      sync_client.waitQueue.push(modification1);
      sync_client.waitQueue.push(modification2);

      sync_client.wait.end();

      expect('waitQueue' in sync_client).to.be.false;
      assert(TransactionExecuter.execute.calledTwice);

      expect(TransactionExecuter.execute.getCall(0).args[1]).to.equal(modification1);
      expect(TransactionExecuter.execute.getCall(1).args[1]).to.equal(modification2);

    } finally {
      sync_client.setup.restore();
      TransactionExecuter.execute.restore();
    }

  });

  describe('Subscriber', () => {

    it('With Queue', () => {

      let sync_client = new SyncClient();

      sinon.stub(sync_client, 'setup');

      sync_client.wait.start();
      sync_client.setupSubscriber();

      let transaction = { id: 'some transaction' };

      sync_client.redis_sub.emit('message', 'state:update', JSON.stringify(transaction));

      expect(sync_client.waitQueue.length).to.equal(1);
      expect(sync_client.waitQueue[0]).to.deep.equal(transaction);
    });

    it('Without Queue', () => {

      let sync_client = new SyncClient();

      sinon.stub(sync_client, 'setup');
      sinon.stub(TransactionExecuter, 'execute');

      let callback = sinon.spy();
      sync_client.on('stateChange', callback);

      try{
        sync_client.setupSubscriber();

        let transaction = { id: 'some transaction' };

        sync_client.redis_sub.emit('message', 'state:update', JSON.stringify(transaction));

        expect('waitQueue' in sync_client).to.be.false;
        assert(TransactionExecuter.execute.calledOnce);
        expect(TransactionExecuter.execute.getCall(0).args[1]).to.deep.equal(transaction);
        assert(callback.calledOnce);
      } finally {
        TransactionExecuter.execute.restore();
      }

    });

  });

  it('Transaction publish', () => {
    let state_container = { state: { foo: 'bar' } };
    let transaction = new Transaction(state_container);
    let block_chain = { append: sinon.spy() };

    let sync_client = new SyncClient(state_container, block_chain);

    sinon.stub(sync_client.redis_pub, 'publish');

    expect(() => sync_client.publish(undefined)).to.throw(Error);
    expect(() => sync_client.publish({ Object })).to.throw(Error);

    sync_client.publish(transaction);

    assert(block_chain.append.calledOnce);
    assert(sync_client.redis_pub.publish.calledOnce);
  });

});
*/