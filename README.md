# fluctor
Flux-like + Actor Model

Well, this is a library for making shared state across machines.

## Installation

[npm][]:

```bash
npm install linked-list
```


## What is it?

Well once you create an ```fluctor``` object you have a state and you can change it with transactions

```javascript

const Fluctor = require('fluctor').Fluctor;

var fluctor = new Fluctor()

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



[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: https://github.com/DmitryDodzin
