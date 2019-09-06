import 'tsconfig-paths/register';
import { EggPlugin } from 'egg';
import * as path from 'path';

const plugin: EggPlugin = {
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
  typeorm_graphql: {
    enable: true,
    path: path.join(__dirname, '../plugin/typeorm-graphql'),
  },
  rabbitmq: {
    enable: true,
    path: path.join(__dirname, '../plugin/rabbitmq'),
  },
  eureka: {
    enable: true,
    path: path.join(__dirname, '../plugin/eureka'),
  },
};

export default plugin;
