import { Post, TagsAll, Summary, Parameters, Joi, IgnoreJwt, Get } from 'egg-shell-plus';
import { Inject } from 'typedi';
import AuthService from '@service/auth/authorize';
import jwtValidate from '@app/middleware/routerMiddleware/jwtValidate';

@TagsAll('对外开放的用户授权接口')
export default class AuthController {
  constructor(@Inject('AuthService') readonly authService: AuthService) {}

  @IgnoreJwt
  @Post()
  @Summary('用户登陆接口')
  @Parameters({
    body: Joi.object().keys({
      username: Joi.string()
        .max(50)
        .required()
        .description('用户名'),
      password: Joi.string()
        .min(6)
        .max(50)
        .required()
        .description('密码'),
      encryption: Joi.number()
        .integer()
        .allow(0, 1)
        .default(0)
        .description('密码是否加密；0不加密，1加密'),
    }),
  })
  public async login(ctx) {
    const { username, password, encryption } = ctx.request.body;
    const decodePwd: string = encryption === 1 ? ctx.helper.crypto.decrypt(password) : password;
    return await this.authService.login({
      username,
      password: decodePwd,
      checkStaff: false,
    });
  }

  /**
   * 退出登录
   * @param ctx
   */
  @Post()
  @Summary('用户注销接口')
  public async logout(ctx) {
    const count: number = await this.authService.logout();
    if (count < 1) {
      ctx.logger.error('退出登陆异常');
    }
    return '退出登陆成功';
  }

  @IgnoreJwt
  @Get('/jwt_validate')
  @Summary('JWT效验接口')
  public async jwtValidate(ctx, next) {
    await jwtValidate()(ctx, next);
    ctx.success({
      data: ctx.userData,
    });
  }
}
