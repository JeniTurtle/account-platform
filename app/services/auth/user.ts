import { Service } from 'typedi';
import { Repository, DeepPartial } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseService } from '@plugin/typeorm-graphql';
import { User } from '@entity/auth/user';

@Service('UserService')
export default class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) readonly repository: Repository<User>) {
    super(User, repository);
  }

  /**
   * 判断只有超级管理员才有权限设置其他用户为超级管理员或员工
   * @param data
   */
  private checkSuperuserPerm(data: any) {
    const { NO_ADD_STAFF_PERMISSION_ERROR, NO_ADD_SUPERUSER_PERMISSION_ERROR } = this.ctx.app.exception.user;
    // 判断超级管理员权限
    const { isSuperuser } = this.ctx.userData.userinfo;
    if (!isSuperuser && data.isSuperuser === 1) {
      this.ctx.error(NO_ADD_SUPERUSER_PERMISSION_ERROR);
      return false;
    }
    if (!isSuperuser && data.isStaff === 1) {
      this.ctx.error(NO_ADD_STAFF_PERMISSION_ERROR);
      return false;
    }
    return true;
  }

  /**
   * 检查用户名密码是否存在，
   * 所有平台的用户名、邮箱都不能重复
   * @param data
   */
  async checkRepeatedUsernameAndEmail(newUser: DeepPartial<User>, oldUser?: User) {
    const { USERNAME_ALREADY_EXISTS_ERROR, EMAIL_ALREADY_EXISTS_ERROR } = this.ctx.app.exception.user;
    const promiseList: any[] = [];
    if (!oldUser || (newUser.username && oldUser.username !== newUser.username)) {
      promiseList.push(
        this.repository.count({
          where: {
            username: newUser.username,
            deletedAt: null,
          },
        }),
      );
    }
    if (!oldUser || (newUser.email && oldUser.email !== newUser.email)) {
      promiseList.push(
        this.repository.count({
          where: {
            email: newUser.email,
            deletedAt: null,
          },
        }),
      );
    }
    // 如果没有传入用户名和密码，则不检查
    if (promiseList.length < 1) {
      return true;
    }
    // 检查用户名和邮箱是否重复
    const [userNum, emailNum] = await Promise.all(promiseList);
    if (userNum > 0) {
      this.ctx.error(USERNAME_ALREADY_EXISTS_ERROR);
      return false;
    }
    if (emailNum) {
      this.ctx.error(EMAIL_ALREADY_EXISTS_ERROR);
      return false;
    }
    return true;
  }

  /**
   * 修改用户信息
   * @param data
   * @param where
   * @param userId
   * @param opts
   */
  async updateUser(data: DeepPartial<User>, where: any, userId: string) {
    this.checkSuperuserPerm(data);
    if (data.password) {
      data.password = this.ctx.helper.bcrypt.hash(data.password);
    }
    return this.update(data, where, userId);
  }

  /**
   * 添加用户
   * @param data
   * @param userId
   */
  async createUser(data: DeepPartial<User>, userId?: string) {
    // 判断超级管理员权限
    const checkSuperuserRet = this.checkSuperuserPerm(data);
    if (!checkSuperuserRet) {
      return;
    }
    // 判断用户名和邮箱是否存在
    const checkUserAndEmailRet = await this.checkRepeatedUsernameAndEmail(data);
    if (!checkUserAndEmailRet) {
      return;
    }
    // 密码加密
    data.password = this.ctx.helper.bcrypt.hash(data.password);
    return this.create(data, userId);
  }

  /**
   * 效验用户是否属于自己平台
   * @param ctx
   * @param userId
   */
  async checkUser(userId: string) {
    const { USER_DOES_NOT_EXIST_ERROR, NO_PERMISSION_UPDATE_OTHER_PLATFORM_USER_ERROR } = this.ctx.app.exception.user;
    const {
      userData: { userinfo },
    } = this.ctx;
    const user = await this.findOne({
      id: userId,
    });
    // 如果不存在，返回错误信息
    if (!user) {
      this.ctx.error(USER_DOES_NOT_EXIST_ERROR);
      return;
    }
    // 判断修改用户是否属于自己平台
    if (userinfo.isSuperuser !== 1 && user.platformId !== userinfo.platformId) {
      this.ctx.error(NO_PERMISSION_UPDATE_OTHER_PLATFORM_USER_ERROR);
      return;
    }
    return user;
  }
}
