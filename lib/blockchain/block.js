
const uuid4 = require('uuid/v4');
const LinkedList = require('linked-list');

class Block extends LinkedList.Item {
  constructor(transaction) {
    super();
    this.id = uuid4();
    this.timestamp = Date.now();
    this.transaction = transaction;
  }
}

Block.fromJSON = json =>{
  let block = new Block();
  let value = JSON.parse(json);

  block.id = value.id;
  block.timestamp = value.timestamp;

  // For not deep serialised objects
  if(typeof value.transaction === 'string'){
    block.transaction = JSON.parse(value.transaction);
  } else {
    block.transaction = value.transaction;
  }

  return block;
};

module.exports = Block;