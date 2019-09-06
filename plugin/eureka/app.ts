import { EurekaClient } from 'eureka-js-client';
import uuidV1 = require('uuid/v1');

interface IForgedEureka {
  getServiceByAppId(appId: string): Promise<string>;

  getServiceByVipAddress(vipAddress: string): Promise<string>;

  getInstancesByAppId(
    appId: string,
    cb: (error: Error | null, config: EurekaClient.EurekaInstanceConfig[]) => void,
  ): void;

  getInstancesByVipAddress(
    vidAddress: string,
    cb: (error: Error | null, config: EurekaClient.EurekaInstanceConfig[]) => void,
  ): void;
}

export default app => {
  if (app.config.eureka) {
    app.eureka = new ForgedEureka(app);
  }
};

/**
 * 只有在egg-ready之后才能跟agent才能跟app通信，
 * 所以这里的api只能在serverDidReady之后调用
 */
class ForgedEureka implements IForgedEureka {
  constructor(private _app) {}

  getInstancesByAppId(appId: string, cb) {
    const uuid = uuidV1();
    this._app.messenger.sendToAgent('eurekaGetInstancesByAppId', {
      appId,
      eventId: uuid,
    });
    this._app.messenger.once(uuid, ({ instance, error }) => {
      cb(error, instance);
    });
  }

  getInstancesByVipAddress(vidAddress: string, cb) {
    const uuid = uuidV1();
    this._app.messenger.sendToAgent('eurekaGetInstancesByVipAddress', {
      vidAddress,
      eventId: uuid,
    });
    this._app.messenger.once(uuid, ({ instance, error }) => {
      cb(error, instance);
    });
  }

  async getServiceByAppId(appId: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      this.getInstancesByAppId(appId, (error: Error | null, clients: EurekaClient.EurekaInstanceConfig[]) => {
        if (error) {
          this._app.logger.error(error);
          reject(error);
        } else {
          if (!clients || clients.length === 0) {
            const err = new Error(`服务[${appId}]未找到，请重试`);
            this._app.logger.error(err);
            reject(err);
          }
          const serviceIndex = Math.floor(Math.random() * clients.length);
          // @ts-ignore
          resolve(`http://${clients[serviceIndex].ipAddr}:${clients[serviceIndex].port.$}`);
        }
      });
    });
  }

  async getServiceByVipAddress(vipAddress: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      this.getInstancesByVipAddress(vipAddress, (error: Error | null, clients: EurekaClient.EurekaInstanceConfig[]) => {
        if (error) {
          this._app.logger.error(error);
          reject(error);
        } else {
          if (!clients || clients.length === 0) {
            const err = new Error(`服务[${vipAddress}]未找到，请重试`);
            this._app.logger.error(err);
            reject(err);
          }
          const serviceIndex = Math.floor(Math.random() * clients.length);
          resolve(`http://${clients[serviceIndex].instanceId}`);
        }
      });
    });
  }
}
