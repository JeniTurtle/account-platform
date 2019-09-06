import { Application } from 'egg';
import { join, sep } from 'path';
import { find } from 'fs-jetpack';
import { createConnection, getRepository, useContainer } from 'typeorm';
import { watch } from 'chokidar';
import * as fs from 'fs-extra';
import * as prettier from 'prettier';
import { Container } from 'typedi';

export function formatCode(text: string) {
  return prettier.format(text, {
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    parser: 'typescript',
    trailingComma: 'all',
  });
}

function handleConfig(config: any, env: string) {
  if (env === 'local') {
    return config;
  }
  const keys = ['entities', 'migrations', 'subscribers'];
  for (const key of keys) {
    if (config[key]) {
      const newValue = config[key].map((item: string) => item.replace(/\.ts$/, '.js'));
      config[key] = newValue;
    }
  }
  return config;
}

async function connectDB(app: Application) {
  const config = handleConfig(app.config.typeorm, app.config.env);
  const connection = await createConnection(config);
  app.context.connection = connection;
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getModelName(file: string) {
  const filename = file.split(sep).pop() || '';
  const name = capitalizeFirstLetter(filename.replace(/\.ts$|\.js$/g, ''));
  return name;
}

function writeTyping(path: string, text: string) {
  fs.writeFileSync(path, formatCode(text), { encoding: 'utf8' });
}

function getTypingText(importText: string, repoText: string, entityText: string) {
  const tpl = `
    import 'egg'
    import { Repository, Connection } from 'typeorm'
    ${importText}
    declare module 'egg' {
      interface Context {
        connection: Connection
        entity: {
          ${entityText}
        }
        repo: {
          ${repoText}
        }
      }
    }
  `;
  return tpl;
}

function formatPaths(files: string[]) {
  return files.map(file => {
    const name = getModelName(file);
    file = file.split(sep).join('/');
    const importPath = `../${file}`.replace(/\.ts$|\.js$/g, '');
    return {
      name,
      importPath,
    };
  });
}

function watchEntity(app: Application) {
  const { baseDir } = app;
  const entityDir = join(baseDir, app.config.typeorm.entityWatchDir || 'app/entity');
  const typingsDir = join(baseDir, 'typings');

  if (!fs.existsSync(entityDir)) return;

  fs.ensureDirSync(typingsDir);
  watch(entityDir).on('all', (eventType: string) => {
    if (['add', 'change'].includes(eventType)) {
      createTyingFile(app);
    }

    if (['unlink'].includes(eventType)) {
      createTyingFile(app);
    }
  });
}

function createTyingFile(app: Application) {
  const { baseDir } = app;
  const entityDir = join(baseDir, app.config.typeorm.entityWatchDir || 'app/entity');
  const files = find(entityDir, { matching: '*.ts' });
  const typingPath = join(baseDir, 'typings', 'typeorm.d.ts');
  const pathArr = formatPaths(files);
  const importText = pathArr
    .map(i => {
      const index = i.name.indexOf('.');
      if (index > -1) {
        const tmpStr = i.name.substring(index, index + 2);
        const tmpUpperStr = i.name.substring(index + 1, index + 2).toUpperCase();
        i.name = i.name.replace(tmpStr, tmpUpperStr);
      }
      return `import ${i.name} from '${i.importPath}'`;
    })
    .join('\n');
  const repoText = pathArr.map(i => `${i.name}: Repository<${i.name}>`).join('\n');

  // TODO
  const entityText = pathArr.map(i => `${i.name}: any`).join('\n');
  const text = getTypingText(importText, repoText, entityText);
  writeTyping(typingPath, text);
}

async function loadEntityAndModel(app: Application) {
  const { baseDir } = app;
  const entityDir = join(baseDir, 'app', 'entity');

  if (!fs.existsSync(entityDir)) return;

  const matching = ['unittest', 'local'].includes(app.config.env) ? '*.ts' : '*.js';
  const files = find(entityDir, { matching });
  app.context.repo = {};
  app.context.entity = {};

  try {
    for (const file of files) {
      const entityPath = join(baseDir, file);
      const entity = require(entityPath).default;

      const name = getModelName(file);
      app.context.repo[name] = getRepository(entity);
      app.context.entity[name] = entity;
    }
  } catch (e) {
    app.logger.error(e);
  }
}

export default async (app: Application) => {
  if (!app.config.typeorm) {
    throw new Error('please config typeorm in config file');
  }
  const container: any = app.config.graphql.schema.container || Container;
  useContainer(container);

  try {
    await connectDB(app);
    watchEntity(app);
    await loadEntityAndModel(app);
    app.logger.info('[typeorm]', '数据链接成功');
  } catch (error) {
    app.logger.error('[typeorm]', '数据库链接失败');
    app.logger.error(error);
  }
};
