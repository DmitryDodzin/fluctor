# fluctor
Flux-like + Actor Model

[![Npm Package](https://nodei.co/npm/fluctor.png?downloads=true&stars=true)](https://www.npmjs.com/package/fluctor)

[![Build Status](https://travis-ci.org/DmitryDodzin/fluctor.svg?branch=master)](https://travis-ci.org/DmitryDodzin/fluctor) [![Dependencies](http://david-dm.org/DmitryDodzin/fluctor.svg)](http://david-dm.org/DmitryDodzin/fluctor) [![Coverage Status](https://coveralls.io/repos/github/DmitryDodzin/fluctor/badge.svg?branch=master)](https://coveralls.io/github/DmitryDodzin/fluctor?branch=master)

Well, this is a library for making shared state across machines.

## Installation

npm:


```bash
npm install fluctor
```


## What is it?

Well once you create an ```fluctor``` object you have a state and you can change it with transactions

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
  .commit(); // commit the changes (you can rollback too)

fluctor.state // => { "foo": "bar" } is the value here and every other server

```


## License

[MIT][license] © [Dmitry Dodzin][author]


[license]: LICENSE

[author]: https://github.com/DmitryDodzin
