
const chai = require('chai');
const expect = chai.expect;

const Block = require('../lib/blockchain/block');

describe('Block', () => {

  const transaction = [{ type: 'SET', path: 'foo', value: 'bar' }];

  it('Correct Init', () => {
    let block = new Block(transaction);

    expect(block.transaction).to.equal(transaction);
  });

  it('Deseralisation', () => {
    let block = new Block(transaction);
    let serialisedBlock = JSON.stringify(block);
    let deserialisedBlock = Block.fromJSON(serialisedBlock);

    expect(deserialisedBlock).to.be.instanceOf(Block);
    expect(deserialisedBlock).to.deep.equal(block);
  });

  it('Flat Deseralisation', () => {
    let block = new Block(transaction);

    let blockForFlat = JSON.parse(JSON.stringify(block));
    blockForFlat.transaction = JSON.stringify(blockForFlat.transaction);
    
    let serialisedBlock = JSON.stringify(blockForFlat);
    let deserialisedBlock = Block.fromJSON(serialisedBlock);

    expect(deserialisedBlock).to.be.instanceOf(Block);
    expect(deserialisedBlock).to.deep.equal(block);
  });

});
