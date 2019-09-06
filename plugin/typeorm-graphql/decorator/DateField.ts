import { Field, GraphQLISODateTime } from 'type-graphql';
import { Column } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';
import { defaultColumnType } from '../lib/type';

interface DateFieldOptions {
  nullable?: boolean;
  default?: Date;
  comment?: string;
}

export function DateField(args: DateFieldOptions = {}): any {
  const nullableOption = args.nullable === true ? { nullable: true } : {};
  const defaultOption = args.default ? { default: args.default } : {};
  const commentOption = args.comment ? { comment: args.comment } : {};
  const descOption = args.comment ? { description: args.comment } : {};
  const databaseConnection: string = process.env.WARTHOG_DB_CONNECTION || '';
  const type = defaultColumnType(databaseConnection, 'date');

  // These are the 2 required decorators to get type-graphql and typeorm working
  const factories = [
    Field(() => GraphQLISODateTime, {
      ...nullableOption,
      ...descOption,
    }),
    Column({
      type,
      ...nullableOption,
      ...defaultOption,
      ...commentOption,
    }) as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
