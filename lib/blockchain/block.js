
const LinkedList = require('linked-list');
const Transaction = require('../transaction/transaction');

class Block extends LinkedList.Item {
  constructor(value) {
    if(!(value instanceof Transaction)){
      throw new Error('Value must be Transaction');
    }
    super(value);
    this.timestamp = Date.now();
  }
}

module.exports = Block;