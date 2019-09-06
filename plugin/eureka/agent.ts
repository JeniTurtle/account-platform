import eurekaInit from './lib/init';

export default agent => {
  const { eureka } = agent.config;
  if (eureka) {
    agent.addSingleton('eureka', createEureka);
    agent.beforeClose(() => {
      agent.eureka.stop();
    });
  }
};

async function createEureka(config, agent) {
  const eureka = await eurekaInit(config, agent);

  agent.messenger.on('eurekaGetInstancesByAppId', ({ appId, eventId }) => {
    let instance: any = null,
      error: any = null;
    try {
      instance = eureka.getInstancesByAppId(appId);
    } catch (err) {
      error = err;
    }
    agent.messenger.sendToApp(eventId, {
      instance,
      error,
    });
  });

  agent.messenger.on('eurekaGetInstancesByVipAddress', ({ vidAddress, eventId }) => {
    let instance: any = null,
      error: any = null;
    try {
      instance = eureka.getInstancesByVipAddress(vidAddress);
    } catch (err) {
      error = err;
    }
    agent.messenger.sendToApp(eventId, {
      instance,
      error,
    });
  });

  return eureka;
}
