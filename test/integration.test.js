
const sinon = require('sinon');
const chai = require('chai');
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

  it('Tran and Transaction', () => {

    let transaction_interface = fluctor.tran;

    sinon.stub(fluctor.sync_client, 'publish');

    try{

      let transaction = transaction_interface.begin();

      transaction.commit();

      assert(fluctor.sync_client.publish.calledWith(transaction));

    } finally {
      fluctor.sync_client.publish.restore();      
    }

  });

});