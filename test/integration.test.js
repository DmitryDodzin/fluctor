
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const assert = chai.assert;
const expect = chai.expect;


const Redis = require('ioredis');

const Fluctor = require('../index').Fluctor;

describe('Fluctor', () => {

  var fluctor;
  let initial_state = {};

  before(done => {
    let client = new Redis();

    client.on('ready', () => {
      client.flushall(() => {
        console.log('    Database flushed');
        client.quit();

        fluctor = new Fluctor({ initial: initial_state });
        fluctor.on('ready', () => done()); 
      });
    });
  });

  it('State Loaded', () => {
    expect(fluctor.state).to.deep.equal(initial_state);
  });

  it('Throw Err on error', ()=>{

    let callback = sinon.spy();

    fluctor.on('error', callback);
    fluctor.sync_client.emit('error');

    assert(callback.calledOnce);
  });

  describe('Transaction', () => {

    beforeEach(() => sinon.stub(fluctor.sync_client, 'publish'));

    afterEach(() => fluctor.sync_client.publish.restore());

    it('Basic Commit', done => {
      let transaction = fluctor.tran.begin();

      let tran_prommise = transaction.commit();

      fluctor.sync_client.emit('stateChange', transaction);

      assert(fluctor.sync_client.publish.calledWith(transaction));

      expect(tran_prommise).be.fulfilled.and.notify(done);
    });

    it('Multipe Commits', done => {

      let transactions = [];

      for(var i = 0; i < 5; i++){
        transactions.push(fluctor.tran.begin());
      }

      let transaction_promises = 
        transactions.map(tran => tran.commit());

      transactions.forEach(tran => fluctor.sync_client.publish.calledWith(tran));

      fluctor.sync_client.emit('stateChange', { type: 'multiple', ids: transactions.map(tran => tran.id) });

      Promise.all(transaction_promises.map(tran_promise => expect(tran_promise).be.fulfilled))
        .then(() => done())
        .catch(err => done(err));
    });

    it('Commit Timeout', done => {

      fluctor.options.timeout = 0;

      let transaction = fluctor.tran.begin();

      let tran_prommise = transaction.commit();

      delete fluctor.options.timeout;

      fluctor.sync_client.emit('stateChange', { type: 'multiple', ids: [] }); // Also check if no ids

      expect(tran_prommise).be.rejected.and.notify(done);
    });

  });

  

});