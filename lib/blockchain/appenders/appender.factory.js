
const APPENDERS = {
  redis: require('./redis.appender')
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
    return appender_instances[name];
  }
  return create(name, options)
    .then(appender => appender_instances[name] = appender); // Still return the appender
}

module.exports = {
  APPENDERS,
  create,
  appender
};