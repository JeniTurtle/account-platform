import { ClassType } from '../lib/type';

export type MethodDecoratorFactory = (target: object, propertyKey: string, descriptor: PropertyDescriptor) => any;

export function composeMethodDecorators(...factories: MethodDecoratorFactory[]) {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor): any => {
    factories.forEach(factory => factory(target, propertyKey, descriptor));
  };
}

export type ClassDecoratorFactory = (target: ClassType) => any;

export function composeClassDecorators(...factories: ClassDecoratorFactory[]) {
  return (target: ClassType): any => {
    factories.forEach(factory => {
      return factory(target);
    });
  };
}
