import { Application } from 'egg';
import * as path from 'path';
import * as assert from 'assert';
import is = require('is-type-of');
import { Container } from 'typedi';

const servicePath = 'app/services';

/**
 * 捕获控制器抛出的错误。
 */
export default app => {
  const serivce = (app.services = {});
  const Loader = getConsumerLoader(app);
  new Loader({
    directory: [path.join(app.baseDir, servicePath)],
    target: serivce,
    inject: app,
  }).load();
};

function getConsumerLoader(app: Application) {
  // 下划线转换驼峰
  const toHump = name => {
    return name.replace(/\_(\w)/g, (_all, letter) => letter.toUpperCase());
  };
  return class ConsumerLoader extends app.loader.FileLoader {
    load() {
      // @ts-ignore
      const target = this.options.target;
      const items = this.parse();
      for (const item of items) {
        const service = item.exports;
        const fullpath = item.fullpath;
        assert(is.class(service), `service(${fullpath} should be class`);

        let keys = fullpath.replace(/\\/g, '/').split(servicePath);
        assert(keys[1], 'service路径异常');
        keys = keys[1].split('/').filter(key => !!key);

        let tmp = target;
        for (const index in keys) {
          const key = toHump(keys[index]);
          if (Number(index) >= keys.length - 1) {
            tmp[key.substring(0, key.lastIndexOf('.'))] = Container.get(service);
          } else {
            tmp[key] = {};
            tmp = tmp[key];
          }
        }
      }
      return target;
    }
  };
}
