# fluctor
Flux-like + Actor Model

[![Npm Package](https://nodei.co/npm/fluctor.png?downloads=true&stars=true)](https://www.npmjs.com/package/fluctor)

[![Build Status](https://travis-ci.org/DmitryDodzin/fluctor.svg?branch=master)](https://travis-ci.org/DmitryDodzin/fluctor) [![Dependencies](http://david-dm.org/DmitryDodzin/fluctor.svg)](http://david-dm.org/DmitryDodzin/fluctor) [![Coverage Status](https://coveralls.io/repos/github/DmitryDodzin/fluctor/badge.svg?branch=master)](https://coveralls.io/github/DmitryDodzin/fluctor?branch=master)

Well, this is a library for creating a shared state across multiple instances;

## Installation

npm:



```bash
npm install fluctor
```


## What is it?

Well once you create a ```fluctor``` object you have an immutalbe state that you can change with transactions

```javascript
const Fluctor = require('fluctor').Fluctor;


var fluctor = new Fluctor({
  initial: {}, // initial state
  connection: {} // connection settings
});

fluctor.state // => the state

fluctor
  .tran // can be acessed as fluctor.transactions too
  .begin() // begin the transactions
  .set('foo', 'bar') // Do the change
  .commit() // commit the changes (you can rollback too)
  .then(() => 
    console.log('Transaction Commited'));

fluctor.state // => { "foo": "bar" } is the value here and every other server
```

## Transaction

```javascript
let tran = fluctor.tran.begin();

tran.set(path, value); // Set value

tran.remove(path); // Delete value

tran.push(path, value); // Appends value to an array

tran.increment(path, value=1); // Increment Numeric value

tran.decrement(path, value=1); // Decrement Numeric value

tran.commit();

```


## Roadmap
This project started as a personal need and i figured out that it should be a fully fledged library. That means there are a lot of tasks to be completed befor the library is production ready =]

- [ ] Make the thing production ready
- [ ] Make the Appenders be plugginable
- [ ] Figure out a custom p2p comunication
- [ ] Settle on a more strict role splitting among nodes
- [ ] Maybe transfer some of the core code to native code


## License

[MIT][license] © [Dmitry Dodzin][author]


[license]: LICENSE

[author]: https://github.com/DmitryDodzin
