import { Context } from 'egg';

/**
 * 捕获控制器抛出的错误。
 */
export default function(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (err) {
      const error = err.message;
      ctx.logger.error(err);
      if (err.name === 'RequestValidationError') {
        const { PARAM_VALIDATE_ERROR } = ctx.app.exception.usually;
        return ctx.error({ ...PARAM_VALIDATE_ERROR, error });
      }
      // ctx.ctrlInfo是在egg-shell-plus中传入的
      if (ctx.ctrlInfo) {
        const { responseErrorCode: code, responseErrorMessage: msg } = ctx.ctrlInfo;
        ctx.error({ code, msg, error });
      } else {
        ctx.error({ error, msg: error });
      }
    }
  };
}
