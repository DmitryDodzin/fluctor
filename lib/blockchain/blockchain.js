
const inherits = require('util').inherits;
const Redis = require('ioredis');
const LinkedList = require('linked-list');
const EventEmmiter = require('events');

const Block = require('./block');
const Transaction = require('../transaction/transaction');
const TransactionExecuter = require('../transaction/transaction.executer');

class BlockChain extends LinkedList{

  constructor() {
    super(...arguments);
    this.blocks = new EventEmmiter();
  }

  append(value){
    if(value instanceof Block){
      super.append(value);
    } else if(value instanceof Transaction) {
      var block = new Block(value);
      super.append(block);
      this.blocks.emit('pushed', { block });
    } else {
      throw new Error('Value must be instance of Block or Transaction');
    }
  }

  prepend(){
    throw new Error('prepend is not yet avialbe');
  }

  apply(state_container){
    var block = this.head;
    while(block){
      TransactionExecuter.execute(state_container, block.transaction);
      block = block.next;
    }
  }

  compact(from){
    let blocksToDetach = [];
    let startDetaching = false;

    var block = this.tail;
    while(block){
      if(startDetaching)
        blocksToDetach.push(block);
      if(block.timestamp < from)
        startDetaching = true;
      block = block.prev;
    }

    blocksToDetach.forEach(block => block.detach());

    return blocksToDetach.length > 0;
  }

  get Block(){
    return Block;
  }
  
}

BlockChain.Block = Block;

module.exports = BlockChain;