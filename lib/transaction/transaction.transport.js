

class TransactionTransport {

  constructor(sync_client, timeoutDuration = 30000) {
    Object.assign(this, { sync_client, timeoutDuration });

    this.sentTransactions = {};
    this._subscribeToCommits();
  }

  _subscribeToCommits(){
    this.sync_client.on('stateChange', tran => {
      switch(tran.type) {
        case 'multiple':
          return this.handleIncomingTransactions(tran.transactions, tran.changes);
        case 'single':
          return this.handleIncomingTransaction(tran.transaction, tran.changes);
      }
    });
  }

  handleIncomingTransaction(transaction, changes){
    if(transaction.id in this.sentTransactions){
      let { timeout, defered } = this.sentTransactions[transaction.id];
      clearTimeout(timeout);
      defered.resolve(changes);
    }
  }

  handleIncomingTransactions(transactions, changes){
    for(let i = 0; i < transactions.length; i++){
      this.handleIncomingTransaction(transactions[i], changes[i]);
    }
  }


  publish(transaction){
    let { timeoutDuration } = this;
    return new Promise((resolve, reject) => {
      this.sync_client.publish(transaction);
      
      let timeout = setTimeout(() => 
        reject(new Error('Timeout, Execution Exceeded ' + timeoutDuration)), 
        timeoutDuration
      );
      this.sentTransactions[transaction.id] = { timeout, defered: { resolve, reject } };
    });
  }

}


module.exports = TransactionTransport;