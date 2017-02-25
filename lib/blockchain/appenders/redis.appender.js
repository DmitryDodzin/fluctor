
const _ = require('lodash');
const Redis = require('ioredis');
const Block = require('../block');
const EventEmitter = require('events');

const DEFAILTS = {
  connection: null,
  prefix: 'blocks:block:'
};

class RedisAppender extends EventEmitter {

  constructor(options) {
    super();
    this.options = _.merge(DEFAILTS, options);
    this.redis_client = new Redis(this.options.connection);

    this.redis_client.on('ready', () => this.emit('ready', this));
    this.redis_client.on('error', err => this.emit('error', err));
  }

  push(block){
    let store_block = {
      id: block.id,
      transaction: block.transaction,
      timestamp: block.timestamp,
    };

    return this.redis_client
      .pipeline()
      .set(this.options.prefix + block.id, JSON.stringify(store_block))
      .lpush(this.options.prefix + 'stack', block.id)
      .exec();
  }

  load_blocks(blockchain, blocks){
    blocks.reverse();
    var redis_client = this.redis_client;
    var prefix = this.options.prefix;

    return new Promise((resolve, reject) => {
      (function loadBlock(){
        let block_id = blocks.pop();
        if(block_id){
          redis_client.get(prefix + block_id)
            .then(rawBlock => Block.fronJSON(rawBlock))
            .then(block => blockchain.append(block))
            .then(loadBlock)
            .catch(reject);
        } else {
          resolve();
        }
      })();
    });
  }

  load(blockchain){
    return this.redis_client.lrange(this.options.prefix + 'stack', 0, Number.MAX_SAFE_INTEGER)
      .then(blocks => this.load_blocks(blockchain, blocks));
  }

}

module.exports = RedisAppender;