
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const assert = chai.assert;
const expect = chai.expect;

const Fluctor = require('../lib/fluctor');
const AppenderFactory = require('../lib/blockchain/appender.factory');
const Snapshot = require('../lib/blockchain/snapshot');


describe('Snapshot', () => {

  let mock_appender;

  beforeEach(() => {
    mock_appender = {
      load: sinon.spy(),
      pushSnapshot: sinon.spy()
    };
  });

  it('Snapshot added to appender', () => {

    let state = {};

    let snapshot = new Snapshot(state, mock_appender);

    let push_promise = snapshot.push();

    assert(mock_appender.pushSnapshot.calledWith(snapshot));
  });

  it('Snapshot Creation API', () => {

    let fluctor = new Fluctor();

    let snapshot = fluctor.snapshot.create();

    expect(snapshot).to.be.instanceOf(Snapshot);
  });

  it('Snapshot Save API', () => {

    let fluctor = new Fluctor();

    let mock_snapshot = {
      push: sinon.spy()
    };

    let snapshot_api = fluctor.snapshot;

    sinon.stub(snapshot_api, 'create').returns(mock_snapshot);

    snapshot_api.save();

    assert(snapshot_api.create.calledOnce);
    assert(mock_snapshot.push.calledOnce);
  });  

});
