import { Agent } from 'egg';
import { saveRemoteConfig, initConfig } from './lib/configHandler';

export default class AgentBootHook {
  constructor(private readonly agent: Agent) {}

  async didReady() {
    // 把springCloud远程配置保存到临时文件，供appWorker调用。
    await saveRemoteConfig(this.agent);
    // 从临时文件中读取agentWorker保存的远程配置文件，并修改当前项目中的config文件。
    initConfig(this.agent);
  }
}
