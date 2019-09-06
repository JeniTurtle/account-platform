import { Field } from 'type-graphql';
import { Column } from 'typeorm';

import { GraphQLBoolean } from 'graphql';
import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

interface BooleanFieldOptions {
  nullable?: boolean;
  default?: boolean;
  comment?: string;
}

export function BooleanField(args: BooleanFieldOptions = {}): any {
  const nullableOption = args.nullable === true ? { nullable: true } : {};
  const defaultOption = args.default ? { default: args.default } : {};
  const commentOption = args.comment ? { comment: args.comment } : {};
  const descOption = args.comment ? { description: args.comment } : {};

  // These are the 2 required decorators to get type-graphql and typeorm working
  const factories = [
    // We explicitly say string here because when we're metaprogramming without
    // TS types, Field does not know that this should be a String
    Field(() => GraphQLBoolean, {
      ...nullableOption,
      ...defaultOption,
      ...descOption,
    }),
    Column({
      type: 'boolean',
      ...nullableOption,
      ...defaultOption,
      ...commentOption,
    }) as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
