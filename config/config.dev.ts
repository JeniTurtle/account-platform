import { EggAppConfig, PowerPartial } from 'egg';
import { address } from 'ip';

import jwtValidate from '@middleware/graphqlMiddleware/jwtValidate';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  const ip = address('public', 'ipv4');
  const port = 7021; // 这里端口要与package.json中start命令指定的port参数一致。

  config.port = port;

  config.logger = {
    dir: 'logs',
  };

  config.development = {
    watchDirs: ['app.ts', 'agent.ts', 'lib', 'plugin'], // 开发环境监听修改文件重启服务
    ignoreDirs: ['app/graphql/generated'], // 开发环境忽略监听修改文件重启服务
  };

  config.eureka = {
    apps: {
      javaK12Server: {
        name: 'JAVA-K12-SERVER',
      },
      configServer: {
        name: 'CONFIG-SERVER',
        basicAuth: {
          username: 'admin',
          password: 'adminadmin',
        },
        configFile: 'abc-dev.yml',
      },
    },
    client: {
      instance: {
        instanceId: `${ip}:${port}`,
        app: 'account-platform',
        hostName: ip,
        ipAddr: ip,
        statusPageUrl: `http://${ip}:${port}/api/eureka/info`, // spring admin 注册心跳
        healthCheckUrl: `http://${ip}:${port}/api/cç√eureka/health`, // eureka 注册心跳
        port: {
          $: port,
          '@enabled': 'true',
        },
        vipAddress: 'account-platform',
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
      },
      eureka: {
        registryFetchInterval: 3000,
        // 有多个 eureka 集群
        serviceUrls: {
          default: ['http://10.0.0.110:8899/eureka/apps/'],
        },
      },
    },
  };

  // @ts-ignore
  config.redis = {
    client: {
      port: '${redis.port}', // 从springCloud配置中取
      host: '${redis.host}',
      password: '${redis.password}',
      db: 7,
    },
  };

  config.typeorm = {
    type: 'postgres',
    host: '${database.host}',
    port: '${database.port}',
    username: '${database.username}',
    password: '${database.password}',
    database: 'message_platform',
    migrationsRun: true,
    synchronize: false,
    logging: ['query'],
    maxQueryExecutionTime: 1500, // 慢查询记录
    entityPrefix: 'mp_',
  };

  config.rabbitmq = {
    enable: true,
    clients: {
      frontserver: {
        url: {
          protocol: 'amqp',
          hostname: '${rabbitmq.host}',
          port: '${rabbitmq.port}',
          username: '${rabbitmq.username}',
          password: '${rabbitmq.password}',
          locale: 'en_US',
          frameMax: 0,
          heartbeat: 0,
          vhost: '${rabbitmq.virtual-host}',
        },
        reconnectTime: 5000, // 重连时间间隔
        options: {},
        exchanges: {
          messageExchange: {
            name: 'message_exchange', // 消息推送交换机
            type: 'direct',
            options: {
              durable: true,
            },
            deadLetterExchange: 'message_dlx_exchange', // 死信交换机
          },
        },
        queues: {
          messageQueue: {
            exchange: 'message_exchange',
            name: 'message_queue',
            keys: {
              wechatMessage: 'wechat_message',
            },
            options: {
              exclusive: false,
              durable: true,
              maxPriority: 10,
            },
            enableDLX: true, // 启用死信交换机
            autoSubscribe: true, // 启动时自动开启订阅。使用时调用registerSubscribe方法，传入回调方法，每次接收到消息都会执行该回调。
            subscribeOptions: {}, // 开启自动订阅时的消费者配置，不开启不用配置
          },
        },
      },
    },
  };

  config.graphql = {
    graphiql: true,
    middlewares: [jwtValidate],
    schema: {
      emitSchemaFile: false,
    },
    warthogAutoGenerateFiles: true,
    maxComplexity: 200, // 最大复杂度，按字段数量来，防止恶意复杂查询，用于造成DDOS攻击
    apolloServer: {
      tracing: true,
      introspection: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      } as any,
    },
  };

  return config;
};
