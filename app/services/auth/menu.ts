import * as assert from 'assert';
import { Service } from 'typedi';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BaseService } from '@plugin/typeorm-graphql';
import { Menu } from '@entity/auth/menu';
import { RoleUser } from '@entity/auth/roleUser';
import { MenuRole } from '@entity/auth/menuRole';
import { MenuUser } from '@entity/auth/menuUser';

@Service('MenuService')
export default class MenuService extends BaseService<Menu> {
  @InjectRepository(RoleUser)
  protected readonly roleUserRepository: Repository<RoleUser>;

  @InjectRepository(MenuUser)
  protected readonly menuUserRepository: Repository<MenuUser>;

  @InjectRepository(MenuRole)
  protected readonly menuRoleRepository: Repository<MenuRole>;

  constructor(@InjectRepository(Menu) readonly repository: Repository<Menu>) {
    super(Menu, repository);
  }

  /**
   * 获取该用户所有菜单
   * @param userId
   */
  async getAllMenuByUser(userId: string, isSuperuser: boolean = false): Promise<Menu[]> {
    // 如果是超级管理员，无需返回菜单列表
    if (isSuperuser) {
      return [];
    }
    const roleUserService = this.getService<RoleUser>(RoleUser, this.roleUserRepository);
    // 获取用户所属角色，和用户下的菜单
    const [roles, userMenus] = await Promise.all([
      roleUserService.find({
        where: { userId },
      }),
      this.getMenusByUser(userId),
    ]);
    // 获取角色下的所有菜单
    const roleMenus = await this.getMenusByRole(roles.map(role => role.roleId));

    // 合并菜单，并去重
    const allMenus: Menu[] = userMenus.concat(roleMenus);
    const map = new Map<string, boolean>();

    return allMenus.reduce((prev: Menu[], next: Menu) => {
      if (!map.has(next.id)) {
        map.set(next.id, true);
        prev.push(next);
      }
      return prev;
    }, []);
  }

  /**
   * 获取用户的菜单
   * @param userId
   */
  async getMenusByUser(userId: string) {
    const ret = await this.repository
      .createQueryBuilder('menu')
      .where('menu.deletedAt is null')
      .andWhere('menu.is_category = :isCategory', { isCategory: 0 })
      .innerJoin('menu.menuUsers', 'menuUser')
      .andWhere('menuUser.deletedAt is null')
      .innerJoin('menuUser.user', 'user', 'user.id = :userId')
      .setParameters({ userId })
      .getMany();
    return ret;
  }

  /**
   * 获取角色的菜单
   * @param userId
   */
  async getMenusByRole(roleId: string | string[]) {
    const condition: any = [];
    if (Array.isArray(roleId)) {
      if (roleId.length < 1) {
        return [];
      }
      condition.push('role.id in (:...ids)', { ids: roleId });
    } else {
      condition.push('role.id = :id', { id: roleId });
    }
    const ret = await this.repository
      .createQueryBuilder('menu')
      .where('menu.deletedAt is null')
      .andWhere('menu.is_category = :isCategory', { isCategory: 0 })
      .innerJoin('menu.menuRoles', 'menuRole')
      .andWhere('menuRole.deletedAt is null')
      .innerJoin('menuRole.role', 'role', ...condition)
      .getMany();
    return ret;
  }

  /**
   * 添加用户菜单
   * @param param0
   */
  async addUserMenu({ userId, menuIds }: { userId: string; menuIds: string[] }, menuUserRepo?: Repository<MenuUser>) {
    const menuUserService = this.getService<MenuUser>(MenuUser, menuUserRepo || this.menuUserRepository);
    const { id: ctUserId } = this.ctx.userData.userinfo;
    // 从新增的菜单中，获取用户已经绑定的菜单列表
    const existingData: MenuUser[] = await menuUserService.find({
      where: {
        userId,
        menuId_in: menuIds,
      },
    });
    // 如果该用户已经有菜单了，那么不再新增
    const data = menuIds
      .filter(menuId => !existingData.find(entity => entity.userId === userId && entity.menuId === menuId))
      .map(id => ({
        userId,
        menuId: id,
      }));
    // 新增用户没有的菜单
    const results = await menuUserService.createMany(data, ctUserId);
    return existingData.concat(results);
  }

  /**
   * 添加角色菜单
   * @param param0
   */
  async addRoleMenu({ roleId, menuIds }: { roleId: string; menuIds: string[] }, menuRoleRepo?: Repository<MenuRole>) {
    const menuRoleService = this.getService<MenuRole>(MenuRole, menuRoleRepo || this.menuRoleRepository);
    const { id: ctUserId } = this.ctx.userData.userinfo;
    // 从新增的菜单中，获取用户已经绑定的菜单列表
    const existingData: MenuRole[] = await menuRoleService.find({
      where: {
        roleId,
        menuId_in: menuIds,
      },
    });
    // 如果该用户已经有菜单了，那么不再新增
    const data = menuIds
      .filter(
        menuId =>
          !existingData.find(entity => {
            return entity.roleId === roleId && entity.menuId === menuId;
          }),
      )
      .map(id => ({
        roleId,
        menuId: id,
      }));
    // 新增用户没有的菜单
    const results = await menuRoleService.createMany(data, ctUserId);
    return existingData.concat(results);
  }

  /**
   * 菜单过滤方法，只能查看自己平台的菜单
   * @param menuIds
   */
  async filterOwnMenus(menuIds: string[]) {
    const { userinfo } = this.ctx.userData;
    const where: any = {
      platformId_eq: userinfo.platformId,
      id_in: menuIds,
    };
    const menus = await this.find({
      where,
      fields: ['id'],
    });
    assert(menus.length > 0, '传入的菜单有误');
    return menus.map(item => item.id);
  }

  /**
   * 删除用户菜单
   * @param param0
   */
  async delUserMenu(
    { userId, menuIds = [] }: { userId: string; menuIds?: string[] },
    menuUserRepo?: Repository<MenuUser>,
  ) {
    const menuUserService = this.getService<MenuUser>(MenuUser, menuUserRepo || this.menuUserRepository);
    const { id: delUserId } = this.ctx.userData.userinfo;
    // 不传菜单id，默认删除所有
    const where: any = {
      userId,
    };
    // 传菜单id，只删除传入的
    if (menuIds.length > 0) {
      where.menuId_in = menuIds;
    }
    return await menuUserService.delete(where, delUserId);
  }

  /**
   * 删除角色菜单
   * @param param0
   */
  async delRoleMenu(
    { roleId, menuIds = [] }: { roleId: string; menuIds?: string[] },
    menuRoleRepo?: Repository<MenuRole>,
  ) {
    const menuRoleService = this.getService<MenuRole>(MenuRole, menuRoleRepo || this.menuRoleRepository);
    const { id: delUserId } = this.ctx.userData.userinfo;
    // 不传菜单id，默认删除所有
    const where: any = {
      roleId,
    };
    // 传菜单id，只删除传入的
    if (menuIds.length > 0) {
      where.menuId_in = menuIds;
    }
    return await menuRoleService.delete(where, delUserId);
  }

  /**
   * 先删除用户所有菜单，再添加新菜单
   * @param param0
   * @param menuUserRepo
   */
  @Transaction()
  async transferUserMenu(
    { userId, menuIds = [] }: { userId: string; menuIds?: string[] },
    @TransactionRepository(MenuUser) menuUserRepo?: Repository<MenuUser>,
  ) {
    // 删除用户所有菜单
    await this.delUserMenu({ userId }, menuUserRepo);
    // 添加新菜单
    return await this.addUserMenu({ userId, menuIds }, menuUserRepo);
  }

  /**
   * 先删除角色所有菜单，再添加新菜单
   * @param param0
   * @param menuUserRepo
   */
  @Transaction()
  async transferRoleMenu(
    { roleId, menuIds = [] }: { roleId: string; menuIds?: string[] },
    @TransactionRepository(MenuRole) menuRoleRepo?: Repository<MenuRole>,
  ) {
    // 删除角色所有菜单
    await this.delRoleMenu({ roleId }, menuRoleRepo);
    // 添加新菜单
    return await this.addRoleMenu({ roleId, menuIds }, menuRoleRepo);
  }

  /**
   * 效验菜单是否属于自己平台
   * @param ctx
   * @param menuId
   */
  async checkMenu(menuId: string) {
    const { MENU_NOT_EXIST_ERROR, NO_ALLOW_TO_UPDATE_OTHER_PLATFORM_MENU_ERROR } = this.ctx.app.exception.menu;
    const { userinfo } = this.ctx.userData;
    const menu = await this.findOne({
      id: menuId,
    });
    // 如果不存在，返回错误信息
    if (!menu) {
      this.ctx.error(MENU_NOT_EXIST_ERROR);
      return;
    }
    // 判断修改菜单是否属于自己平台
    if (userinfo.isSuperuser !== 1 && menu.platformId !== userinfo.platformId) {
      this.ctx.error(NO_ALLOW_TO_UPDATE_OTHER_PLATFORM_MENU_ERROR);
      return;
    }
    return menu;
  }

  /**
   * 获取上级菜单信息
   */
  async relaSupreior(menus: Menu[]) {
    // 获取上级菜单列表
    const parents = await this.find({
      where: {
        id_in: menus.map(menu => menu.supreiorId),
      },
    });
    // 关联上级菜单
    menus.forEach(menu => {
      for (const parent of parents) {
        if (parent.id === menu.supreiorId) {
          menu.supreior = parent;
          break;
        }
      }
    });
    return menus;
  }
}
