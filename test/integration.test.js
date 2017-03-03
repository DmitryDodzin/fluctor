
const chai = require('chai');
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
        fluctor.on('error', err => console.log(err));
      });
    });
  });

  it('State Loaded', () => {
    expect(fluctor.state).to.deep.equal(initial_state);
  });

});