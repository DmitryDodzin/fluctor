
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const assert = chai.assert;
const expect = chai.expect;

const AppenderFactory = require('../lib/blockchain/appenders/appender.factory');
const Snapshot = require('../lib/blockchain/snapshot');


describe('Snapshot', () => {

  let mock_appender;

  beforeEach(() => {
    mock_appender = {
      push_snapshot: sinon.spy()
    };
    sinon.stub(AppenderFactory, 'appender').returns(Promise.resolve(mock_appender));
  });

  afterEach(() => AppenderFactory.appender.restore());

  it('Snapshot added to appender', done => {

    let state = {};

    let snapshot = new Snapshot(state);

    let push_promise = snapshot.push();

    assert(AppenderFactory.appender.calledOnce); // Test that the call count didn't change

    push_promise.then(() => {
      assert(mock_appender.push_snapshot.calledWith(snapshot));
      done();
    })
    .catch(err => done(err));

  });

});
