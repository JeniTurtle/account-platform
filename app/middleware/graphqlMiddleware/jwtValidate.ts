/**
 * 授权认证中间件
 * 对权限进行获取和认证
 */
import jwtValidate from '@middleware/routerMiddleware/jwtValidate';

export default async (ctx: any, next: () => Promise<any>) => {
  try {
    const { context } = ctx;
    const { NO_ACCESS_RIGHTS_ERROR } = context.app.exception.authentication;
    const error = await jwtValidate()(context, next);
    if (error) {
      throw new Error(error.msg);
    }
    // 判断是否是员工或管理员
    const { isStaff, isSuperuser } = context.userData.userinfo;
    if (isStaff !== 1 && isSuperuser !== 1) {
      throw new Error(NO_ACCESS_RIGHTS_ERROR.msg);
    }
  } catch (e) {
    throw e;
  }
};
