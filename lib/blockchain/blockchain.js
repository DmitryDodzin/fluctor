
const Redis = require('ioredis');
const LinkedList = require('linked-list');

const Block = require('./block');

class BlockChain extends LinkedList{

  constructor() {
    super(...arguments);
  }
  
}

module.exprts = BlockChain;