
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const Block = require('../lib/blockchain/block');
const BlockChain = require('../lib/blockchain/blockchain');


describe('BlockChain', () => {

  it('BlockChain Block', () => {
    let blockchain = new BlockChain();
    expect(blockchain.Block).to.equal(Block);
  });

  it('Dissable Prepend', () => {
    let blockchain = new BlockChain();
    expect(blockchain.prepend).to.throw(Error);
  });

  describe('Append', () => {

    const Transaction = require('../lib/transaction/transaction');


    it('With Block', () => {
      let block = Block.fromJSON('{ "transaction": [] }');
      let blockchain = new BlockChain();

      let updateSpy = sinon.spy();

      blockchain.blocks.on('pushed', updateSpy);

      blockchain.append(block);

      assert(!updateSpy.called, 'Appender was called');
      expect(blockchain.head).to.equal(block, 'Is not appended to head');
      expect(blockchain.toArray().length).to.equal(1, 'length isnt equal to 1');
    });

    it('With Transaction', () => {

      let transaction = new Transaction({});
      let blockchain = new BlockChain();

      let updateSpy = sinon.spy();
      blockchain.blocks.on('pushed', updateSpy);

      blockchain.append(transaction);

      assert(updateSpy.called, 'Appender wasn\'t called');
      expect(blockchain.head.transaction).to.equal(transaction, 'head');
      expect(blockchain.toArray().length).to.equal(1);
    });

    it('From Ctor', () => {
      let blockchain = new BlockChain();

      expect(blockchain.append).to.throw(Error);
    });

    it('From Ctor', () => {

      let block1 = Block.fromJSON('{ "transaction": [] }');
      let block2 = Block.fromJSON('{ "transaction": [] }');

      let blockchain = new BlockChain(block1, block2);

      expect(blockchain.head).to.equal(block1);
      expect(blockchain.tail).to.equal(block2);
      expect(blockchain.toArray().length).to.equal(2);
    });

  });

  describe('Apply', () => {

    const TransactionExecuter = require('../lib/transaction/transaction.executer');

    before(() => sinon.stub(TransactionExecuter, 'execute'));
    after(() => TransactionExecuter.execute.restore());

    it('Calls the TransactionExecuter', () => {
      let headBlock = Block.fromJSON('{ "transaction": [] }');
      let state_container = {};

      let blockchain = new BlockChain();
      Object.defineProperty(blockchain, 'head', { get: () => headBlock });

      blockchain.apply(state_container);

      assert(TransactionExecuter.execute.calledOnce, 'Was invoked');
      assert(TransactionExecuter.execute.calledWith(state_container, headBlock.transaction), 'Was invoked with correct params');
    });

  });

});
