
const Redis = require('ioredis');
const LinkedList = require('linked-list');

const Block = require('./block');
const Transaction = require('../transaction/transaction');
const TransactionExecuter = require('../transaction/transaction.executer');
const AppenderFactory = require('./appenders/appender.factory');

class BlockChain extends LinkedList{

  constructor() {
    super(...arguments);
  }

  init(options={}){
    return AppenderFactory.appender('redis', options)
      .then(appender => this.appender = appender)
      .then(() => this.appender.load(this));
  }

  append(value){
    if(value instanceof Block){
      super.append(value);
    } else if(value instanceof Transaction) {
      var block = new Block(value);
      super.append(block);
      this.appender.push(block);
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

  get Block(){
    return Block;
  }
  
}

BlockChain.Block = Block;

module.exports = BlockChain;