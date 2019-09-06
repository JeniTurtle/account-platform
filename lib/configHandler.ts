import { Agent, EggApplication } from 'egg';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import * as YAML from 'yamljs';
import * as is from 'is-type-of';

// 临时写入的远程配置文件
export const runtimeFile = './run/eureka-remote-config.json';

/**
 * 使用字符串深度获取对象属性
 * @param object
 * @param path
 * @param defaultValue
 */
export const deepGet = (object, path, defaultValue?) => {
  return (
    (!Array.isArray(path)
      ? path
          .replace(/\[/g, '.')
          .replace(/\]/g, '')
          .split('.')
      : path
    ).reduce((o, k) => (o || {})[k], object) || defaultValue
  );
};

/**
 * 深度遍历配置文件，检查模板字段，并替换。
 * @param obj
 * @param cb
 */
export const depthSearch = (obj, config) => {
  const regular = /^\$\{(.*)+\}$/;
  for (const index in obj) {
    const item = obj[index];
    if (is.object(item)) {
      depthSearch(item, config);
    } else if (is.string(item) && regular.test(item)) {
      // console.log(item,  deepGet(config, temp[1], ''));
      const temp = item.match(regular);
      obj[index] = deepGet(config, temp[1], '');
    }
  }
};

/**
 * agentWorker获取springCloud配置数据，
 * 写入到运行时文件中，供appWorker调用。
 * @param agent
 */
export const saveRemoteConfig = async (agent: Agent) => {
  const { eureka, config } = agent;
  const {
    configServer: { name, basicAuth, configFile },
  } = config.eureka.apps;
  const instances = eureka.getInstancesByAppId(name);
  assert(instances.length > 0, `springCloud配置中心${name}实例获取失败！`);
  try {
    const resp = await agent.curl(`${instances[0].homePageUrl}/${configFile}`, {
      auth: `${basicAuth.username}:${basicAuth.password}`,
    });
    const configData = YAML.parse(resp.data.toString());
    const tempConfigFile = path.join(agent.baseDir, runtimeFile);
    fs.writeFileSync(tempConfigFile, JSON.stringify(configData));
  } catch (err) {
    agent.logger.error('springCloud配置文件获取失败！');
    throw err;
  }
};

/**
 * 从临时文件中读取agentWorker保存的远程配置文件，
 * 并修改当前项目中的config文件。
 * @param app
 */
export const initConfig = (app: EggApplication) => {
  const tempConfigFile = path.join(app.baseDir, runtimeFile);
  try {
    const content = fs.readFileSync(tempConfigFile);
    const remoteConfig = JSON.parse(content.toString());
    depthSearch(app.config, remoteConfig);
  } catch (err) {
    app.logger.error('springCloud配置文件读取失败！');
    throw err;
  }
};
