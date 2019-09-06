/**
 * 给当前resolver注入的所有Service对象自动绑定egg上下文，
 * 当然，也可以不使用该注解，替代的方法是：
 * this.demoService.init(ctx).create(body)
 */

import * as assert from 'assert';
import { Container } from 'typedi';

const initCtx = (target: any, ctx: any) => {
  target.ctx = ctx;
  target.app = ctx.app;
  target.config = ctx.app.config;
  target.service = ctx.service;
};

const injectContext = (obj: object, ctx: any) => {
  Object.getOwnPropertyNames(obj).map(prop => {
    if (obj[prop] && typeof obj[prop] === 'object') {
      const type = obj[prop].constructor;
      if (Container.has(type) || Container.has(type.name)) {
        injectContext(obj[prop], ctx);
        initCtx(obj[prop], ctx);
      }
    }
  });
};

export const BindServiceCtx = (_target, _name, descriptor) => {
  let ctx: any;
  const fn = descriptor.value;
  if (typeof fn !== 'function') {
    return descriptor;
  }

  descriptor.value = function(...args) {
    for (const arg of args) {
      if (arg.app && arg.app.config) {
        ctx = arg;
        break;
      }
    }
    assert(ctx, 'resolver权限效验时，必须注入@Ctx参数');
    injectContext(this, ctx);
    return fn.apply(this, args);
  };
  return descriptor;
};
