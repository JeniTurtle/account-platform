/**
 * 授权认证中间件
 * 对权限进行获取和认证
 */
import { Context } from 'egg';

export default (): any => {
  return async (ctx: Context, next: () => Promise<any>) => {
    let token: string = ctx.headers.authorization;
    const {
      UNAUTHORIED_ERROR,
      INCORRECT_TOKEN_FORMAT_ERROR,
      OVERDUE_LANDING_ERROR,
      LANDING_ELSEWHERE_ERROR,
    } = ctx.app.exception.authentication;
    // 效验token格式
    if (!token || !/JWT [\dA-Za-z=]+/.test(token)) {
      return ctx.error(INCORRECT_TOKEN_FORMAT_ERROR, 401);
    }
    token = token.replace('JWT ', '');
    try {
      // token验证，失败会抛出错误
      ctx.app.jwt.verify(token);
      // jwt数据解码，并读取redis缓存的登陆信息
      const jwtData = ctx.app.jwt.decode(token);
      const loginRedsKey = `${jwtData.userId}_${jwtData.password}_${jwtData.isActive}`;
      const loginData: any = await ctx.app.redis.get(loginRedsKey);
      // 如果redis中不存在登陆信息，提示登陆过期
      if (!loginData) {
        return ctx.error(OVERDUE_LANDING_ERROR, 401);
      }
      // 判断redis存储的token跟用户传来的token是否一致，
      ctx.userData = JSON.parse(loginData);
      if (ctx.userData.token !== token) {
        return ctx.error(LANDING_ELSEWHERE_ERROR, 401);
      }
      // 登陆过期时间如果还差2个小时到期，自动续签
      const currentTime = new Date().getTime();
      if (ctx.userData.expireTime - currentTime < 7200 * 1000) {
        const { expireTime } = ctx.config.authorize.login;
        loginData.expireTime = currentTime + expireTime * 1000;
        ctx.app.redis.set(loginRedsKey, JSON.stringify(loginData), 'EX', expireTime);
      }
    } catch (e) {
      ctx.logger.error(e.stack);
      return ctx.error(UNAUTHORIED_ERROR, 401);
    }
    await next();
  };
};
