
const uuid4 = require('uuid/v4');
const LinkedList = require('linked-list');
const Transaction = require('../transaction/transaction');

class Block extends LinkedList.Item {
  constructor(transaction) {
    super();
    this.id = uuid4();
    this.timestamp = Date.now();
    this.transaction = transaction;
  }
}

Block.fronJSON = json =>{
  let block = new Block();
  let value = JSON.parse(json);

  block.id = value.id;
  block.timestamp = value.timestamp;
  block.transaction = JSON.parse(value.transaction);

  return block;
};

module.exports = Block;