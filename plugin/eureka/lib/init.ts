import { Eureka } from 'eureka-js-client';

export default async (config, agent) => {
  const logger = (...args: any[]) => {
    const used = typeof args[1] === 'number' ? `(${args[1]}ms)` : '';
    agent.logger.info('[egg-eureka]%s %s', used, args[0]);
  };

  const eureka = new Eureka(config);

  // @ts-ignore
  eureka.on('started', () => {
    logger('eureka启动成功');
  });

  // @ts-ignore
  eureka.on('registered	', () => {
    logger('eureka注册成功');
  });

  // @ts-ignore
  eureka.on('deregistered	', () => {
    logger('eureka已注销');
  });

  // @ts-ignore
  eureka.on('registryUpdated	', () => {
    logger('eureka更新注册成功');
  });

  await new Promise((resolve, reject) => {
    eureka.start((err, data) => {
      if (!err) {
        resolve(data);
      } else {
        logger('eureka启动失败');
        reject(err);
      }
    });
  });

  return eureka;
};
