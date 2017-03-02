
const chai = require('chai');
const expect = chai.expect;

const BlockChain = require('../lib/blockchain/blockchain');

describe('BlockChain', () => {

  it('Dissable Prepend', () => {
    let blockchain = new BlockChain();
    expect(blockchain.prepend).to.throw(Error);
  });

});
