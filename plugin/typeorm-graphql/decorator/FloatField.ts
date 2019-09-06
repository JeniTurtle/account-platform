import { Field, Float } from 'type-graphql';
import { Column } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';
import { defaultColumnType } from '../lib/type';

interface FloatFieldOptions {
  nullable?: boolean;
  comment?: string;
}

export function FloatField(args: FloatFieldOptions = {}): any {
  const nullableOption = args.nullable === true ? { nullable: true } : {};
  const commentOption = args.comment ? { comment: args.comment } : {};
  const descOption = args.comment ? { description: args.comment } : {};
  const databaseConnection: string = process.env.WARTHOG_DB_CONNECTION || '';
  const type = defaultColumnType(databaseConnection, 'float');

  // These are the 2 required decorators to get type-graphql and typeorm working
  const factories = [
    Field(() => Float, {
      ...nullableOption,
      ...descOption,
    }),
    Column({
      // This type will be different per database driver
      type,
      ...nullableOption,
      ...commentOption,
    }) as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
