import { Eureka } from 'eureka-js-client';
import { IForgedEureka } from './lib/init';

declare module 'egg' {
  interface Agent {
    eureka: Eureka;
  }
  interface Application {
    eureka: IForgedEureka;
  }
}
