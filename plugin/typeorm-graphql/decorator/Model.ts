const caller = require('caller'); // eslint-disable-line @typescript-eslint/no-var-requires
import * as path from 'path';
import { ObjectType } from 'type-graphql';
import { Entity } from 'typeorm';

import { ClassType } from '../lib/type';
import { getMetadataStorage } from '../lib/metadata_storage';
import { ClassDecoratorFactory, composeClassDecorators, generatedFolderPath } from '../utils/';

export function Model(options: any = {}) {
  // In order to use the enums in the generated classes file, we need to
  // save their locations and import them in the generated file
  const modelFileName = caller();

  // Use relative paths when linking source files so that we can check the generated code in
  // and it will work in any directory structure
  const relativeFilePath = path.relative(generatedFolderPath(), modelFileName);

  const registerModelWithWarthog = (target: ClassType): void => {
    // Save off where the model is located so that we can import it in the generated classes
    getMetadataStorage().addModel(target.name, target, relativeFilePath);
  };

  const factories = [
    Entity({ ...options }) as ClassDecoratorFactory,
    ObjectType({ ...options }) as ClassDecoratorFactory,
    registerModelWithWarthog as ClassDecoratorFactory,
  ];

  return composeClassDecorators(...factories);
}
