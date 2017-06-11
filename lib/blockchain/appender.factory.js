
const APPENDERS = {
  redis: require('fluctor-redis-appender').Appender
};

const appender_instances = {};

function create(name, options = {}){
  let appneder = new APPENDERS[name](options);
  return new Promise((resolve, reject) => {
    appneder.on('ready', resolve);
    appneder.on('error', reject);
  });
}

function appender(name, options = {}) {
  if(name in appender_instances){
    return Promise.resolve(appender_instances[name]);
  }
  return create(name, options)
    .then(appender => appender_instances[name] = appender); // Still return the appender
}

module.exports = {
  APPENDERS,
  create,
  appender
};