import { Field } from 'type-graphql';
import { OneToMany as TypeORMOneToMany, JoinColumn } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

export function OneToMany(parentType: any, joinFunc: any, options: any = {}): any {
  const descOption = options.comment ? { description: options.comment } : {};
  const factories = [
    Field(parentType, { nullable: true, ...options, ...descOption }) as MethodDecoratorFactory,
    TypeORMOneToMany(parentType, joinFunc) as MethodDecoratorFactory,
    JoinColumn() as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
