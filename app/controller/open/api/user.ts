import { Post, TagsAll, Summary, Parameters, Joi, Get, Put, Delete } from 'egg-shell-plus';
import { Inject } from 'typedi';
import { UserWhereInput } from '@graphql/generated';
import UserService from '@service/auth/user';
import RoleService from '@service/auth/role';
import AuthService from '@service/auth/authorize';
import { UserGender, UserIsActive } from '@entity/auth/user';
import { PermissionWithAction } from '@decorator/permission';

const updateUserParams = {
  username: Joi.string()
    .min(2)
    .max(50)
    .description('用户名'),
  password: Joi.string()
    .min(6)
    .max(50)
    .description('密码'),
  gender: Joi.string()
    .allow(UserGender.MAN, UserGender.WOMAN, UserGender.UNKNOWN)
    .default(UserGender.UNKNOWN)
    .description('性别'),
  isActive: Joi.string()
    .allow(UserIsActive.YES, UserIsActive.NO)
    .default(UserIsActive.YES)
    .description('是否启用'),
  email: Joi.string()
    .email()
    .description('电子邮箱'),
  mobile: Joi.string()
    .regex(/^1[3456789]\d{9}$/)
    .description('手机号码'),
  departmentId: Joi.string().description('所属部门'),
  realname: Joi.string()
    .max(50)
    .description('真实姓名'),
  nickname: Joi.string()
    .max(50)
    .description('用户昵称'),
};

const createUserParams = {
  ...updateUserParams,
  username: Joi.string()
    .min(2)
    .max(50)
    .required()
    .description('用户名'),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .description('密码'),
  email: Joi.string()
    .email()
    .required()
    .description('电子邮箱'),
  mobile: Joi.string()
    .required()
    .regex(/^1[3456789]\d{9}$/)
    .description('手机号码'),
};

@TagsAll('对外开放的用户接口')
export default class UserController {
  @Inject('UserService')
  readonly userService: UserService;

  @Inject('RoleService')
  readonly roleService: RoleService;

  @Inject('AuthService')
  readonly authService: AuthService;

  /**
   * 获取用户列表
   * @param ctx
   */
  @Get()
  @Summary('用户列表接口')
  @Parameters({
    query: Joi.object().keys({
      pageIndex: Joi.number()
        .integer()
        .min(1)
        .required()
        .description('当前页码'),
      pageSize: Joi.number()
        .integer()
        .min(1)
        .required()
        .description('每页记录数'),
      mobileContains: Joi.string().description('手机号，模糊匹配'),
      emailContains: Joi.string().description('电子邮箱，模糊匹配'),
      realnameContains: Joi.string().description('真实姓名，模糊匹配'),
      nicknameContains: Joi.string().description('用户昵称，模糊匹配'),
      usernameContains: Joi.string().description('用户名，模糊匹配'),
    }),
  })
  @PermissionWithAction('read_user')
  public async list(ctx) {
    const {
      request: { query },
      userData: { userinfo },
    } = ctx;
    const where: UserWhereInput = {
      platformId_eq: userinfo.platformId, // 只能查看自己平台的用户
      mobile_contains: query.mobileContains,
      email_contains: query.emailContains,
      realname_contains: query.realnameContains,
      nickname_contains: query.nicknameContains,
      username_contains: query.usernameContains,
    };
    // 获取所有用户信息
    const users = await this.userService.findAndCount({
      where,
      offset: (query.pageIndex - 1) * query.pageSize,
      limit: query.pageSize,
      orderBy: 'createdAt_DESC',
    });
    const userList = users.rows;
    // 获取所有用户对应角色映射关系
    const rolesMapping = await this.roleService.getRolesMappingByUsers(userList.map(user => user.id));
    userList.map(user => {
      user.roles = [];
      rolesMapping.forEach(roleUser => {
        roleUser.userId === user.id && user.roles.push(roleUser.role);
      });
    });
    return users;
  }

  /**
   * 添加用户
   * @param ctx
   */
  @Post()
  @Summary('添加用户接口')
  @Parameters({
    body: Joi.object().keys({
      ...createUserParams,
    }),
  })
  @PermissionWithAction('write_user')
  public async create(ctx) {
    const {
      request: { body },
      userData: { userinfo },
    } = ctx;
    // 只能添加自己平台的用户
    body.platformId = userinfo.platformId;
    return await this.userService.createUser(body, userinfo.id);
  }

  @Get('/detail/:userId')
  @Summary('查看用户详情')
  @PermissionWithAction('read_user')
  @Parameters({
    pathParams: Joi.object().keys({
      userId: Joi.string().description('用户id'),
    }),
  })
  public async detail(ctx) {
    const { userId } = ctx.request.params;
    return await this.userService.findOne({
      id: userId,
    });
  }

  /**
   * 修改用户
   * @param ctx
   */
  @Put('/update/:userId')
  @Summary('修改用户接口')
  @Parameters({
    body: Joi.object().keys({
      ...updateUserParams,
    }),
    pathParams: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('用户id'),
    }),
  })
  @PermissionWithAction('write_user')
  public async update(ctx) {
    const {
      request: { body },
      params: { userId },
      userData: { userinfo },
    } = ctx;
    // 判断用户是否存在
    const user = await this.userService.checkUser(userId);
    if (!user) {
      return;
    }
    // 如果修改了用户名和邮箱，判断新增的用户名和邮箱是否重复
    const checkUserAndEmailRet = await this.userService.checkRepeatedUsernameAndEmail(body, user);
    if (!checkUserAndEmailRet) {
      return;
    }
    const ret = await this.userService.updateUser(
      body,
      {
        id: userId,
      },
      userinfo.id,
    );
    // 修改redis用户信息
    ret &&
      (await this.authService.updateRedisUserinfo({
        oldUserinfo: user,
        userinfo: ret,
      }));
    return ret;
  }

  /**
   * 删除用户
   * @param ctx
   */
  @Delete('/delete/:userId')
  @Summary('删除用户接口')
  @Parameters({
    pathParams: Joi.object().keys({
      userId: Joi.string().description('用户id'),
    }),
  })
  @PermissionWithAction('write_user')
  public async delete(ctx) {
    const {
      params: { userId },
      userData: { userinfo },
    } = ctx;
    const user = await this.userService.checkUser(userId);
    if (!user) {
      return;
    }
    const ret = await this.userService.delete(
      {
        id: userId,
      },
      userinfo.id,
    );
    // 删除redis用户信息
    await this.authService.deleteRedisUserinfo(user);
    return ret;
  }

  /**
   * 修改本人信息，无需效验权限
   * @param ctx
   */
  @Put('/update_self')
  @Summary('修改本人信息接口')
  @Parameters({
    body: Joi.object().keys({
      ...updateUserParams,
    }),
  })
  public async updateSelf(ctx) {
    const {
      request: { body },
      userData: { userinfo },
    } = ctx;
    return await this.userService.updateUser(
      body,
      {
        id: userinfo.id,
      },
      userinfo.id,
    );
  }

  /**
   * 查看本人信息，无需效验权限
   * @param ctx
   */
  @Get('/self_detail')
  @Summary('查看本人信息接口')
  public async selfDetail(ctx) {
    const { id } = ctx.userData.userinfo;
    return await this.userService.findOne({
      id,
    });
  }
}
