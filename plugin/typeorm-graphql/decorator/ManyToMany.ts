import { Field } from 'type-graphql';
import { ManyToMany as TypeORMManyToMany } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

export function ManyToMany(parentType: any, joinFunc?: any, options: any = {}): any {
  const descOption = options.comment ? { description: options.comment } : {};
  const factories = [
    Field(() => [parentType()], { nullable: true, ...options, ...descOption }) as MethodDecoratorFactory,
    TypeORMManyToMany(parentType, joinFunc, options) as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
