
const Redis = require('ioredis');
const LinkedList = require('linked-list');

const Block = require('./block');

class BlockChain extends LinkedList{

  constructor() {
    super(...arguments);
  }

  init(options){

    this.redis_client = new Redis(options);

    return new Promise((resolve, reject) => {
      this.redis_client.on('ready', () => resolve());
      this.redis_client.on('error', (err) => reject(err));
    });
  }

}

module.exprts = BlockChain;