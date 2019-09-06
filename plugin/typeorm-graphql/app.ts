import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'warthog';

import { CodeGenerator } from 'warthog/dist/core/code-generator';
import createConnection from './lib/create_connection';
import GraphQLServer from './lib/graphql_server';
// import loadService from './lib/load_service';

export default app => {
  const envConf = getEnvConfig(app);
  const { typeorm, graphql } = app.config;
  assert(typeorm, 'typeorm配置不能为空！');
  warthogConfigInit(app, typeorm, graphql, envConf);
  app.beforeStart(async () => {
    await createConnection(app);
    if (graphql.warthogAutoGenerateFiles) {
      await new CodeGenerator(app.context.connection, path.join(app.baseDir, typeorm.warthogGenerateFolder), {
        resolversPath: [path.join(app.baseDir, envConf.WARTHOG_RESOLVERS_PATH)],
        warthogImportPath: 'warthog',
      }).generate();
    }
    writeOrmconfig(app, typeorm);
    await new GraphQLServer(app).start();
    // loadService(app);
  });
};

function getEnvConfig(app): any {
  const { error, parsed } = dotenv.config({ path: path.join(app.baseDir, '.env_warthog') });
  if (error) {
    throw error;
  }
  if (app.config.env !== 'local') {
    for (const index in parsed) {
      parsed[index] = parsed[index].replace(/\.ts$/, '.js');
    }
  }
  return parsed;
}

function warthogConfigInit(app, ormConf, graphqlConf, envConf) {
  const envPath = path.join(app.baseDir, '.env');
  ormConf.namingStrategy = new SnakeNamingStrategy();

  (ormConf.entityWatchDir = envConf.WARTHOG_DB_ENTITIES), // 监听自动生成.d.ts文件
    fs.writeFileSync(
      envPath,
      `# 自动生成的环境变量文件，请勿修改
      ${Object.getOwnPropertyNames(envConf)
        .map(key => `${key}=${envConf[key]}`)
        .join('\n')}
      WARTHOG_INTROSPECTION = ${ormConf.introspection || true}
      WARTHOG_DB_HOST = ${ormConf.host}
      WARTHOG_DB_PORT = ${ormConf.port}
      WARTHOG_DB_USERNAME = ${ormConf.username}
      WARTHOG_DB_LOGGER = ${ormConf.logger || 'advanced-console'}
      WARTHOG_DB_PASSWORD = ${ormConf.password}
      WARTHOG_DB_SYNCHRONIZE = ${ormConf.synchronize}
      WARTHOG_DB_ENTITY_PREFIX = ${ormConf.entityPrefix}
      WARTHOG_AUTO_GENERATE_FILES = ${graphqlConf.warthogAutoGenerateFiles}
      `.replace(/( )+/g, ''),
    );
  Object.assign(ormConf, {
    entities: envConf.WARTHOG_DB_ENTITIES.split(','),
    migrations: envConf.WARTHOG_DB_MIGRATIONS.split(','),
    subscribers: envConf.WARTHOG_DB_SUBSCRIBERS.split(','),
    warthogGenerateFolder: envConf.WARTHOG_GENERATED_FOLDER,
    warthogResolversPath: envConf.WARTHOG_RESOLVERS_PATH.split(','),
    cli: {
      entitiesDir: envConf.WARTHOG_DB_ENTITIES_DIR,
      migrationsDir: envConf.WARTHOG_DB_MIGRATIONS_DIR,
      subscribersDir: envConf.WARTHOG_DB_SUBSCRIBERS_DIR,
    },
  });
}

function writeOrmconfig(app, config) {
  fs.writeFileSync(
    path.join(app.baseDir, config.warthogGenerateFolder, 'ormconfig.ts'),
    `import {${config.namingStrategy.constructor.name}} from 'warthog';
     const config = ${JSON.stringify(config)};
     config.namingStrategy = new ${config.namingStrategy.constructor.name}();
     module.exports = config;`,
  );
}
