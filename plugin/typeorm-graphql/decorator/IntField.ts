import { Field, Int } from 'type-graphql';
import { Column } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

interface IntFieldOptions {
  nullable?: boolean;
  comment?: string;
}

export function IntField(args: IntFieldOptions = {}): any {
  const nullableOption = args.nullable === true ? { nullable: true } : {};
  const commentOption = args.comment ? { comment: args.comment } : {};
  const descOption = args.comment ? { description: args.comment } : {};

  // These are the 2 required decorators to get type-graphql and typeorm working
  const factories = [
    // We explicitly say string here because when we're metaprogramming without
    // TS types, Field does not know that this should be a String
    Field(() => Int, {
      ...nullableOption,
      ...descOption,
    }),
    Column({
      type: 'int',
      ...nullableOption,
      ...commentOption,
    }) as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
