import { Service, Inject } from 'typedi';
import * as md5 from 'js-md5';
import { EggBaseService } from '@plugin/typeorm-graphql';
import { UserIsActive, UserIsSuperuser, UserIsStaff, User } from '@entity/auth/user';
import UserService from '@service/auth/user';
import RoleService from '@service/auth/role';
import MenuService from '@service/auth/menu';
import PermissionService from '@service/auth/permission';

interface ILoginParams {
  username: string;
  password: string;
  checkStaff: boolean;
}

@Service('AuthService')
export default class AuthService extends EggBaseService {
  @Inject('UserService')
  protected readonly userService: UserService;

  @Inject('RoleService')
  protected readonly roleService: RoleService;

  @Inject('MenuService')
  protected readonly menuService: MenuService;

  @Inject('PermissionService')
  protected readonly premService: PermissionService;

  /**
   * 用户登陆
   * @param param0
   */
  async login({ username, password, checkStaff }: ILoginParams) {
    const { bcrypt } = this.ctx.helper;
    const {
      NOTFOUND_USER_ERROR,
      PASSWORD_VALIDATE_ERROR,
      USER_DISABLED_ERROR,
      UNKNOWN_EXCEPTION_ERROR,
      NO_ACCESS_RIGHTS_ERROR,
    } = this.ctx.app.exception.authentication;
    try {
      const userinfo = await this.userService.findOne({ username });
      // 判断用户是否存在
      if (!userinfo) {
        this.ctx.error(NOTFOUND_USER_ERROR);
        return;
      }
      // 判断密码是否正确
      if (!bcrypt.compare(password, userinfo.password)) {
        this.ctx.error(PASSWORD_VALIDATE_ERROR);
        return;
      }
      const isSuperuser = userinfo.isSuperuser === UserIsSuperuser.YES;
      const isStaff = userinfo.isStaff === UserIsStaff.YES;
      // 判断用户是否是员工和管理员
      if (checkStaff && !isStaff && !isSuperuser) {
        this.ctx.error(NO_ACCESS_RIGHTS_ERROR);
        return;
      }
      // 判断用户是否停用
      if (userinfo.isActive !== UserIsActive.YES) {
        this.ctx.error(USER_DISABLED_ERROR);
        return;
      }
      const [roles, permissions, menus] = await Promise.all([
        // 获取当前用户所有角色
        this.roleService.getRolesByUser(userinfo.id),
        // 获取用户所有权限
        this.premService.getAllPermissionByUser(userinfo.id, isSuperuser),
        // 获取用户所有菜单
        this.menuService.getAllMenuByUser(userinfo.id, isSuperuser),
      ]);

      // 生成json web token
      const md5Password = md5(userinfo.password);
      const token = this.app.jwt.sign({
        userId: userinfo.id,
        password: md5Password,
        isActive: userinfo.isActive,
        platformId: userinfo.platformId,
      });
      const currentTime: Date = new Date();
      const updateInfo: any = {};
      if (!userinfo.firstLoginTime) {
        userinfo.firstLoginTime = updateInfo.firstLoginTime = currentTime;
      }
      userinfo.lastLoginTime = updateInfo.lastLoginTime = currentTime;
      // 保存用户数据到redis，过期时间为1天
      const redisKey = `${userinfo.id}_${md5Password}_${userinfo.isActive}`;
      const { expireTime } = this.config.authorize.login;
      const loginData = {
        token,
        userinfo,
        roles,
        expireTime: currentTime.getTime() + expireTime * 1000,
        permissions: permissions.map(perm => perm.code),
        menus: menus.map(({ path, icon, code, name, order }) => ({
          path,
          icon,
          code,
          name,
          order,
        })),
      };
      this.app.redis.set(redisKey, JSON.stringify(loginData), 'EX', expireTime);
      // 更新用户首次登陆和最后一次登陆时间
      this.ctx.userData = loginData;
      await this.userService.updateUser(updateInfo, { id: userinfo.id }, userinfo.id);
      // 删除密码字段
      delete loginData.userinfo.password;
      return loginData;
    } catch (err) {
      this.ctx.logger.error(err);
      this.ctx.error(UNKNOWN_EXCEPTION_ERROR);
    }
  }

  /**
   * 退出登录
   */
  async logout() {
    const {
      userData,
      app: { jwt, redis },
    } = this.ctx;
    const { userId, password, isActive } = jwt.decode(userData.token);
    const loginKey = `${userId}_${password}_${isActive}`;
    return await redis.del(loginKey);
  }

  /**
   *  更新redis用户信息
   * @param param0
   */
  async updateRedisUserinfo({
    oldUserinfo,
    userinfo,
    permissions,
    menus,
  }: {
    oldUserinfo: User;
    userinfo: User;
    permissions?: string[];
    menus?: any[];
  }) {
    const { redis } = this.ctx.app;
    const { expireTime } = this.config.authorize.login;
    const oldRedisKey = `${oldUserinfo.id}_${md5(oldUserinfo.password)}_${oldUserinfo.isActive}`;
    const redisKey = `${userinfo.id}_${md5(userinfo.password)}_${userinfo.isActive}`;
    const redisValue = await redis.get(oldRedisKey);
    // 如果当前用户没有登录，则不作操作
    if (!redisValue) {
      return;
    }
    const userData = JSON.parse(redisValue);
    // 修改权限信息
    if (permissions) {
      userData.permissions = permissions;
    }
    // 修改菜单信息
    if (menus) {
      userData.menus = menus;
    }
    if (redisKey !== oldRedisKey) {
      await redis.del(oldRedisKey);
    }
    await redis.set(redisKey, JSON.stringify(userData), 'EX', expireTime);
  }

  /**
   * 删除redis用户信息
   */
  async deleteRedisUserinfo(userinfo: User) {
    const { redis } = this.ctx.app;
    const redisKey = `${userinfo.id}_${md5(userinfo.password)}_${userinfo.isActive}`;
    await redis.del(redisKey);
  }
}
