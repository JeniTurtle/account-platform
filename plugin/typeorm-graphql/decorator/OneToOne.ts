import { Field } from 'type-graphql';
import { OneToOne as TypeORMOneToOne, JoinColumn } from 'typeorm';

import { composeMethodDecorators, MethodDecoratorFactory } from '../utils';

export function OneToOne(parentType: any, joinFunc: any, options: any = {}): any {
  const descOption = options.comment ? { description: options.comment } : {};
  const factories = [
    Field(parentType, { nullable: true, ...options, ...descOption }) as MethodDecoratorFactory,
    TypeORMOneToOne(parentType, joinFunc) as MethodDecoratorFactory,
    JoinColumn() as MethodDecoratorFactory,
  ];

  return composeMethodDecorators(...factories);
}
