// # fluctro the best way to keep state between servers

const Fluctor = require('./lib/fluctor');

module.exports = {
  Fluctor,
  create: options => new Promise((resolve, reject) => {
    let fluctor = new Fluctor(options);
    fluctor.on('ready', resolve);
    fluctor.on('initError', reject);
  })
};