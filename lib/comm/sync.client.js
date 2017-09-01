
const uuid = require('uuid');
const Redis = require('ioredis');
const EventEmitter = require('events');

const RedisSyncClient = require('fluctor-redis-sync').Client;

const Transaction = require('../transaction/transaction');
const TransactionExecuter = require('../transaction/transaction.executer');
const BlockChain = require('../blockchain/blockchain');

class SyncClient extends EventEmitter {

  constructor(state_container, block_chain, options={}) {
    super();
    Object.assign(this, { state_container, block_chain });

    this.client = new RedisSyncClient(options);

    this.setupSubscriber();
  }

  get wait() {
    let { client } = this;
    return {
      start: client.wait.start.bind(client),
      end: client.wait.end.bind(client, waitQueue => this.executeWaitQueue(waitQueue))
    };
  }

  executeWaitQueue(waitQueue){
    let results = waitQueue
      .filter(({ type }) => type === 'transaction')
      .map(({ value }) => {
        let changes = TransactionExecuter.execute(this.state_container, value);
        return { transaction: value, changes };
      });

    this.emit('stateChange', { 
      type: 'multiple', 
      transactions: results.map(res => res.transaction), 
      changes: results.map(res => res.changes)
    });
  }

  setupSubscriber(){
    this.client.on('transaction', transaction => {
      let changes = TransactionExecuter.execute(this.state_container, transaction);
      this.emit('stateChange', { type: 'single', transaction, changes });
    });

    this.client.on('snapshot', snapshot => {
      if('timestamp' in snapshot){
        this.block_chain.compact(snapshot.timestamp);
        this.emit('snapshot', snapshot);
      }
    });
  }

  get publish() {
    let _this = this;
    return {
      transaction: transaction => {
        if(transaction instanceof Transaction){
          this.block_chain.append(transaction);
          this.client.publish_transaction(transaction);
        } else {
          throw new Error('Cannot publis a non transaction');
        }
      },
      snapshot: snapshot => {
        this.client.publish_snapshot(snapshot);
      }
    };
  }

}

module.exports = SyncClient;