import { IsEmail } from 'class-validator';
import { Field } from 'type-graphql';
import { Column } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

interface EmailFieldOptions {
  nullable?: boolean;
  unique?: boolean;
  comment?: string;
}

export function EmailField(args: EmailFieldOptions = {}): any {
  const uniqueOption = args.unique === false ? {} : { unique: true }; // Default to unique
  const nullableOption = args.nullable === true ? { nullable: true } : {};
  const commentOption = args.comment ? { comment: args.comment } : {};
  const descOption = args.comment ? { description: args.comment } : {};

  // These are the 2 required decorators to get type-graphql and typeorm working
  const factories = [
    IsEmail(),
    Field(() => String, {
      ...descOption,
    }),
    Column({ ...uniqueOption, ...nullableOption, ...commentOption }) as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
