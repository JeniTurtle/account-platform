import { MiddlewareFn } from 'type-graphql';

export const ErrorInterceptor: MiddlewareFn<any> = async ({ context: ctx }, next) => {
  try {
    return await next();
  } catch (err) {
    ctx.logger.error(err);
    throw err;
  }
};
