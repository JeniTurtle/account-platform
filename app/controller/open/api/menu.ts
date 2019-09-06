import { Post, Get, Put, Delete, TagsAll, Summary, Parameters, Joi, Description } from 'egg-shell-plus';
import { Inject } from 'typedi';
import { MenuIsCategory } from '@entity/auth/menu';
import MenuService from '@service/auth/menu';
import UserService from '@service/auth/user';
import RoleService from '@service/auth/role';
import { PermissionWithAction } from '@decorator/permission';

const createMenuParams = Joi.object().keys({
  order: Joi.number()
    .integer()
    .description('菜单序号'),
  name: Joi.string()
    .required()
    .description('菜单名称'),
  code: Joi.string()
    .required()
    .description('菜单编号'),
  path: Joi.string()
    .required()
    .description('菜单地址'),
  icon: Joi.string().description('菜单图标'),
  remark: Joi.string().description('菜单备注'),
  isCategory: Joi.number()
    .integer()
    .allow(MenuIsCategory.YES, MenuIsCategory.NO)
    .description('是否是分类，1是，0不是'),
  supreiorId: Joi.string().description('上级ID'),
});

@TagsAll('对外开放的菜单管理接口')
export default class MenuController {
  @Inject('MenuService')
  readonly menuService: MenuService;

  @Inject('UserService')
  readonly userService: UserService;

  @Inject('RoleService')
  readonly roleService: RoleService;

  /**
   * 获取菜单列表
   * @param ctx
   */
  @Get()
  @Summary('菜单列表接口')
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
      isCategoryEq: Joi.number()
        .integer()
        .allow(MenuIsCategory.YES, MenuIsCategory.NO)
        .description('是否是分类'),
      withParent: Joi.number()
        .integer()
        .allow(1, 0)
        .default(0)
        .description('是否查询上级菜单，1查询，2不查询'),
      nameContains: Joi.string().description('菜单名称，模糊匹配'),
      codeContains: Joi.string().description('菜单编号，模糊匹配'),
    }),
  })
  @PermissionWithAction('read_menu')
  async list(ctx) {
    const {
      request: { query },
      userData: { userinfo },
    } = ctx;
    const where: any = {
      platformId_eq: userinfo.platformId, // 只能查看自己平台的菜单，和通用菜单
      code_contains: query.codeContains,
      name_contains: query.nameContains,
      isCategory_eq: query.isCategoryEq,
    };
    const menus = await this.menuService.findAndCount({
      where,
      offset: (query.pageIndex - 1) * query.pageSize,
      limit: query.pageSize,
      orderBy: 'createdAt_DESC',
    });
    // 不查询上级菜单，直接返回列表结果
    if (query.withParent !== 1) {
      return menus;
    }
    // 获取上级菜单列表
    return await this.menuService.relaSupreior(menus);
  }

  /**
   * 查询指定用户的菜单列表
   * @param ctx
   */
  @Get('/user_menus')
  @Summary('查询指定用户的菜单列表')
  @Parameters({
    query: Joi.object().keys({
      userId: Joi.string().description('用户ID'),
      withParent: Joi.number()
        .integer()
        .allow(1, 0)
        .default(0)
        .description('是否查询上级菜单，1查询，2不查询'),
    }),
  })
  @PermissionWithAction('read_menu')
  async userMenus(ctx) {
    const {
      request: { query },
      userData: { userinfo },
    } = ctx;
    const user = await this.userService.checkUser(query.userId);
    if (!user) {
      return;
    }
    const menus = await this.menuService.getAllMenuByUser(userinfo.id);
    // 不查询上级菜单，直接返回列表结果
    if (query.withParent !== 1) {
      return menus;
    }
    // 获取上级菜单列表
    return await this.menuService.relaSupreior(menus);
  }

  /**
   * 查询指定角色的菜单列表
   * @param ctx
   */
  @Get('/role_menus')
  @Summary('查询指定角色的菜单列表')
  @Parameters({
    query: Joi.object().keys({
      roleId: Joi.string().description('角色ID'),
      withParent: Joi.number()
        .integer()
        .allow(1, 0)
        .default(0)
        .description('是否查询上级菜单，1查询，2不查询'),
    }),
  })
  @PermissionWithAction('read_menu')
  async roleMenus(ctx) {
    const { roleId, withParent } = ctx.request.query;
    const role = await this.roleService.checkRole(roleId);
    if (!role) {
      return;
    }
    const menus = await this.menuService.getMenusByRole(roleId);
    // 不查询上级菜单，直接返回列表结果
    if (withParent !== 1) {
      return menus;
    }
    // 获取上级菜单列表
    return await this.menuService.relaSupreior(menus);
  }

  /**
   * 添加菜单接口
   * @param ctx
   */
  @Post()
  @Summary('添加菜单接口')
  @Parameters({
    body: createMenuParams,
  })
  @PermissionWithAction('write_menu')
  async create(ctx) {
    const {
      request: { body },
      userData: { userinfo },
    } = ctx;
    // 只能添加自己平台的用户
    body.platformId = userinfo.platformId;
    // 上级菜单检查是否存在，以及是否属于自己平台
    if (body.supreiorId) {
      const parent = await this.menuService.checkMenu(body.supreiorId);
      if (!parent) {
        return;
      }
    }
    return await this.menuService.create(body, userinfo.id);
  }

  /**
   * 修改菜单接口
   * @param ctx
   */
  @Put('/update/:menuId')
  @Summary('修改权限接口')
  @Parameters({
    body: createMenuParams,
    pathParams: Joi.object().keys({
      menuId: Joi.string()
        .required()
        .description('菜单id'),
    }),
  })
  @PermissionWithAction('write_menu')
  async update(ctx) {
    const {
      request: { body },
      params: { menuId },
      userData: { userinfo },
    } = ctx;
    const menu = await this.menuService.checkMenu(menuId);
    // 上级菜单检查是否存在，以及是否属于自己平台
    if (body.supreiorId) {
      const parent = await this.menuService.checkMenu(body.supreiorId);
      if (!parent) {
        return;
      }
    }
    if (menu) {
      return await this.menuService.update(
        body,
        {
          id: menuId,
        },
        userinfo.id,
      );
    }
  }

  /**
   * 删除权限
   * @param ctx
   */
  @Delete('/delete/:menuId')
  @Summary('删除菜单接口')
  @Parameters({
    pathParams: Joi.object().keys({
      menuId: Joi.string().description('菜单id'),
    }),
  })
  @PermissionWithAction('write_menu')
  public async delete(ctx) {
    const {
      params: { menuId },
      userData: { userinfo },
    } = ctx;
    const menu = await this.menuService.checkMenu(menuId);
    if (menu) {
      return await this.menuService.delete(
        {
          id: menuId,
        },
        userinfo.id,
      );
    }
  }

  /**
   * 添加用户权限
   * @param ctx
   */
  @Put('/add_menus_with_user')
  @Summary('添加菜单权限')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要添加的用户ID'),
      menuIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的菜单ID列表'),
    }),
  })
  @PermissionWithAction(['write_menu', 'write_user'])
  async addMenuWithUser(ctx) {
    const { userId, menuIds } = ctx.request.body;
    const [user, filteredIds] = await Promise.all([
      this.userService.checkUser(userId),
      this.menuService.filterOwnMenus(menuIds),
    ]);
    if (user && filteredIds) {
      return await this.menuService.addUserMenu({
        userId,
        menuIds: filteredIds,
      });
    }
  }

  /**
   * 删除用户菜单
   * @param ctx
   */
  @Delete('/delete_menus_with_user')
  @Summary('删除用户菜单')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要删除的用户ID'),
      menuIds: Joi.array()
        .items(Joi.string())
        .description('要删除的菜单ID列表，不传默认删除所有'),
    }),
  })
  @PermissionWithAction(['write_menus', 'write_user'])
  async deleteMenuWithUser(ctx) {
    const { userId, menuIds } = ctx.request.body;
    return await this.menuService.delUserMenu({
      userId,
      menuIds: Array.from(new Set(menuIds)),
    });
  }

  /**
   * 添加角色菜单
   * @param ctx
   */
  @Put('/add_menus_with_role')
  @Summary('添加角色菜单')
  @Parameters({
    body: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('要添加的角色ID'),
      menuIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的菜单ID列表'),
    }),
  })
  @PermissionWithAction(['write_menu', 'write_role'])
  async addMenuWithRole(ctx) {
    const { roleId, menuIds } = ctx.request.body;
    const [role, filteredIds] = await Promise.all([
      this.roleService.checkRole(roleId),
      this.menuService.filterOwnMenus(menuIds),
    ]);
    if (role && filteredIds) {
      return await this.menuService.addRoleMenu({
        roleId,
        menuIds: filteredIds,
      });
    }
  }

  /**
   * 删除角色菜单
   */
  @Delete('/delete_menus_with_role')
  @Summary('删除角色菜单')
  @Parameters({
    body: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('要删除的角色ID'),
      menuIds: Joi.array()
        .items(Joi.string())
        .description('要删除的菜单ID列表，不传默认删除所有'),
    }),
  })
  @PermissionWithAction(['write_menu', 'write_role'])
  async deleteMenuWithRole(ctx) {
    const { roleId, menuIds } = ctx.request.body;
    return await this.menuService.delRoleMenu({
      roleId,
      menuIds: Array.from(new Set(menuIds)),
    });
  }

  /**
   * 全量修改用户菜单
   * @param ctx
   */
  @Post('/transfer_menus_with_user')
  @Summary('全量修改用户菜单')
  @Description('先删除用户当前所有菜单，再添加新菜单')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要操作的用户ID'),
      menuIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的菜单ID列表'),
    }),
  })
  @PermissionWithAction(['write_user', 'write_menu'])
  async transferMenusWithUser(ctx) {
    const { userId, menuIds } = ctx.request.body;
    const [user, filteredIds] = await Promise.all([
      this.userService.checkUser(userId),
      this.menuService.filterOwnMenus(menuIds),
    ]);
    if (user && filteredIds) {
      return await this.menuService.transferUserMenu({
        userId,
        menuIds: filteredIds,
      });
    }
  }

  /**
   * 全量修改角色菜单
   * @param ctx
   */
  @Post('/transfer_menus_with_role')
  @Summary('全量修改角色菜单')
  @Description('先删除角色当前所有菜单，再添加新菜单')
  @Parameters({
    body: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('要操作的角色ID'),
      menuIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的菜单ID列表'),
    }),
  })
  @PermissionWithAction(['write_role', 'write_menu'])
  async transferMenusWithRole(ctx) {
    const { roleId, menuIds } = ctx.request.body;
    const [role, filteredIds] = await Promise.all([
      this.roleService.checkRole(roleId),
      this.menuService.filterOwnMenus(menuIds),
    ]);
    if (role && filteredIds) {
      return await this.menuService.transferRoleMenu({
        roleId,
        menuIds: filteredIds,
      });
    }
  }
}
