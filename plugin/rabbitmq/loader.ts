import * as path from 'path';
import { Application } from 'egg';
import * as assert from 'assert';
import is = require('is-type-of');

export default app => {
  const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app/consumer'));
  dirs.push(...app.config.rabbitmq.consumer.directory);

  const Loader = getConsumerLoader(app);
  const consumers = (app.consumers = {});
  new Loader({
    directory: dirs,
    target: consumers,
    inject: app,
  }).load();
  return consumers;
};

function getConsumerLoader(app: Application) {
  return class ConsumerLoader extends app.loader.FileLoader {
    load() {
      // @ts-ignore
      const target = this.options.target;
      const items = this.parse();
      for (const item of items) {
        const consumer = item.exports;
        const fullpath = item.fullpath;
        const config = consumer.config;
        assert(config, `consumer(${fullpath}): must have config and subscribe properties`);
        assert(
          config.queue && config.routingKey,
          `consumer(${fullpath}): consumer.config must have queue and routingKey properties`,
        );
        assert(
          is.class(consumer) || is.function(consumer.subscribe),
          `consumer(${fullpath}: consumer.subscribe should be function or consumer should be class`,
        );

        let subscribe;
        if (is.class(consumer)) {
          subscribe = ctx => async data => {
            const s = new consumer(ctx);
            s.subscribe = app.toAsyncFunction(s.subscribe);
            return s.subscribe(data);
          };
        } else {
          subscribe = () => app.toAsyncFunction(consumer.subscribe);
        }

        const env = app.config.env;
        const envList = config.env;
        if (is.array(envList) && !envList.includes(env)) {
          app.coreLogger.info(`[egg-rabbitmq]: ignore consumer ${fullpath} due to \`consumer.env\` not match`);
          continue;
        }

        target[fullpath] = {
          consumer: config,
          subscribe,
          key: fullpath,
        };
      }
      return target;
    }
  };
}
