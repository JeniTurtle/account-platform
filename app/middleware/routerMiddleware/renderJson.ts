import { Context } from 'egg';

/**
 * 输出控制器返回结果
 */
export default function(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    // 这里的ctrlInfo包含了控制器注解信息和方法返回的结果, 只有autoResponse为true时,
    // 并且action方法做了return之后, 才会执行。
    // 如果不做return, 需要在action方法中, 自己调用ctx.success返回响应结果。
    if (ctx.ctrlInfo) {
      if (ctx.ctrlInfo.result instanceof Error) {
        throw ctx.ctrlInfo.result;
      }
      const { responseCode: code, responseMessage: msg, result: data } = ctx.ctrlInfo;
      ctx.success({ code, msg, data });
    }
    await next();
  };
}
