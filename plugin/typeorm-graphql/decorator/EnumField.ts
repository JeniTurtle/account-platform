const caller = require('caller'); // eslint-disable-line @typescript-eslint/no-var-requires
import * as path from 'path';
import { Field, registerEnumType } from 'type-graphql';
import { Column } from 'typeorm';

import { getMetadataStorage } from '../lib/metadata_storage';
import { composeMethodDecorators, generatedFolderPath, MethodDecoratorFactory } from '../utils';

interface EnumFieldOptions {
  nullable?: boolean;
  default?: boolean;
  comment?: string;
  defaultValue?: string | number | boolean;
}

export function EnumField(name: string, enumeration: object, options: EnumFieldOptions = {}): any {
  const commentOption = options.comment ? { comment: options.comment } : {};
  const descOption = options.comment ? { description: options.comment } : {};
  const defaultValueOptions = options.defaultValue !== undefined ? { defaultValue: options.defaultValue } : {};
  const defaultOptions = options.defaultValue !== undefined ? { default: options.defaultValue } : {};
  const factories: any = [];

  // Register enum with TypeGraphQL so that it lands in generated schema
  registerEnumType(enumeration, { name });

  // In order to use the enums in the generated classes file, we need to
  // save their locations and import them in the generated file
  const decoratorSourceFile = caller();

  // Use relative paths in the source files so that they can be used on different machines
  const relativeFilePath = path.relative(generatedFolderPath(), decoratorSourceFile);

  const registerEnumWithWarthog = (target: any, propertyKey: string): any => {
    getMetadataStorage().addEnum(target.constructor.name, propertyKey, name, enumeration, relativeFilePath);
  };

  factories.push(
    registerEnumWithWarthog,
    Field(() => enumeration, { ...options, ...descOption, ...defaultValueOptions }),
    Column({ enum: enumeration, ...options, ...commentOption, ...defaultOptions }) as MethodDecoratorFactory,
  );

  return composeMethodDecorators(...factories);
}
