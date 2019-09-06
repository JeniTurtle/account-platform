import { Application, IBoot } from 'egg';
import * as path from 'path';
import { initConfig } from './lib/configHandler';

export default class AppBoot implements IBoot {
  constructor(private app: Application) {}

  // 此时 config 文件已经被读取并合并，但是还并未生效
  // 这是应用层修改配置的最后时机
  // 注意：此函数只支持同步调用
  configWillLoad() {
    // 从临时文件中读取agentWorker保存的远程配置文件，并修改当前项目中的config文件。
    initConfig(this.app);
  }

  // 所有的配置已经加载完毕
  // 可以用来加载应用自定义的文件，启动自定义的服务
  async didLoad() {
    const constantDir = path.join(this.app.config.baseDir, 'app/exception');
    this.app.loader.loadToApp(constantDir, 'exception');
  }

  // 所有的插件都已启动完毕，但是应用整体还未 ready
  // 可以做一些数据初始化等操作，这些操作成功才会启动应用
  async willReady() {}

  async didReady() {}

  async serverDidReady() {}

  async beforeClose() {}
}
