import { Post, Get, Put, Delete, TagsAll, Summary, Parameters, Joi, Description } from 'egg-shell-plus';
import { Inject } from 'typedi';
import { PermissionIsCategory } from '@entity/auth/permission';
import PermService from '@service/auth/permission';
import UserService from '@service/auth/user';
import RoleService from '@service/auth/role';
import { PermissionWithAction } from '@decorator/permission';

const createPermissionParams = Joi.object().keys({
  name: Joi.string()
    .required()
    .description('权限名称'),
  code: Joi.string()
    .required()
    .description('权限编号'),
  remark: Joi.string().description('权限备注'),
  isCategory: Joi.number()
    .integer()
    .allow(PermissionIsCategory.YES, PermissionIsCategory.NO)
    .description('是否是分类，1是，0不是'),
  supreiorId: Joi.string().description('上级ID'),
});

@TagsAll('对外开放的权限管理接口')
export default class PermissionController {
  @Inject('PermissionService')
  readonly permService: PermService;

  @Inject('UserService')
  readonly userService: UserService;

  @Inject('RoleService')
  readonly roleService: RoleService;

  /**
   * 获取权限列表
   * @param ctx
   */
  @Get()
  @Summary('权限列表接口')
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
        .allow(PermissionIsCategory.YES, PermissionIsCategory.NO)
        .description('是否是分类'),
      nameContains: Joi.string().description('权限名称，模糊匹配'),
      codeContains: Joi.string().description('权限编号，模糊匹配'),
    }),
  })
  @PermissionWithAction('read_permisson')
  async list(ctx) {
    const {
      request: { query },
      userData: { userinfo },
    } = ctx;
    const commonCondition = {
      code_contains: query.codeContains,
      name_contains: query.nameContains,
      isCategory_eq: query.isCategoryEq,
    };
    const where: any = [
      {
        platformId_eq: userinfo.platformId, // 只能查看自己平台的权限，和通用权限
        ...commonCondition,
      },
      {
        isGlobal_eq: 1,
        ...commonCondition,
      },
    ];
    return await this.permService.findAndCount({
      where,
      offset: (query.pageIndex - 1) * query.pageSize,
      limit: query.pageSize,
      orderBy: 'createdAt_DESC',
    });
  }

  /**
   * 添加权限接口
   * @param ctx
   */
  @Post()
  @Summary('添加权限接口')
  @Parameters({
    body: createPermissionParams,
  })
  @PermissionWithAction('write_permisson')
  async create(ctx) {
    const {
      request: { body },
      userData: { userinfo },
    } = ctx;
    // 只能添加自己平台的用户
    body.platformId = userinfo.platformId;
    return await this.permService.create(body, userinfo.id);
  }

  /**
   * 修改权限接口
   * @param ctx
   */
  @Put('/update/:permissionId')
  @Summary('修改权限接口')
  @Parameters({
    body: createPermissionParams,
    pathParams: Joi.object().keys({
      permissionId: Joi.string()
        .required()
        .description('权限id'),
    }),
  })
  @PermissionWithAction('write_permisson')
  async update(ctx) {
    const {
      request: { body },
      params: { permissionId },
      userData: { userinfo },
    } = ctx;
    const permission = await this.permService.checkPermission(permissionId);
    if (permission) {
      return await this.permService.update(
        body,
        {
          id: permissionId,
        },
        userinfo.id,
      );
    }
  }

  /**
   * 删除权限
   * @param ctx
   */
  @Delete('/delete/:permissionId')
  @Summary('删除权限接口')
  @Parameters({
    pathParams: Joi.object().keys({
      permissionId: Joi.string().description('权限id'),
    }),
  })
  @PermissionWithAction('write_permission')
  public async delete(ctx) {
    const {
      params: { permissionId },
      userData: { userinfo },
    } = ctx;
    const permission = await this.permService.checkPermission(permissionId);
    if (permission) {
      return await this.permService.delete(
        {
          id: permissionId,
        },
        userinfo.id,
      );
    }
  }

  /**
   * 添加用权限
   */
  @Put('/add_permissions_with_user')
  @Summary('添加用户权限')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要添加的用户ID'),
      permissionIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的权限ID列表'),
    }),
  })
  @PermissionWithAction(['write_permission', 'write_user'])
  async addPermissionWithUser(ctx) {
    const { userId, permissionIds } = ctx.request.body;
    const [user, permIds] = await Promise.all([
      this.userService.checkUser(userId),
      this.permService.filterOwnPermissions(permissionIds),
    ]);
    if (user && permIds) {
      return await this.permService.addUserPermission({
        userId,
        permissionIds: permIds,
      });
    }
  }

  /**
   * 删除用户权限
   * @param ctx
   */
  @Delete('/delete_permissions_with_user')
  @Summary('删除用户权限')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要删除的用户ID'),
      permissionIds: Joi.array()
        .items(Joi.string())
        .description('要删除的权限ID列表，不传默认删除所有'),
    }),
  })
  @PermissionWithAction(['write_permission', 'write_user'])
  async deletePermissionWithUser(ctx) {
    const { userId, permissionIds } = ctx.request.body;
    return await this.permService.delUserPermission({
      userId,
      permissionIds: Array.from(new Set(permissionIds)),
    });
  }

  /**
   * 添加角色权限
   * @param ctx
   */
  @Put('/add_permissions_with_role')
  @Summary('添加角色权限')
  @Parameters({
    body: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('要添加的角色ID'),
      permissionIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的权限ID列表'),
    }),
  })
  @PermissionWithAction(['write_permission', 'write_role'])
  async addPermissionWithRole(ctx) {
    const { roleId, permissionIds } = ctx.request.body;
    const [role, permIds] = await Promise.all([
      this.roleService.checkRole(roleId),
      this.permService.filterOwnPermissions(permissionIds),
    ]);
    if (role && permIds) {
      return await this.permService.addRolePermission({
        roleId,
        permissionIds: permIds,
      });
    }
  }

  /**
   * 删除角色权限
   */
  @Delete('/delete_permissions_with_role')
  @Summary('删除角色权限')
  @Parameters({
    body: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('要删除的角色ID'),
      permissionIds: Joi.array()
        .items(Joi.string())
        .description('要删除的权限ID列表，不传默认删除所有'),
    }),
  })
  @PermissionWithAction(['write_permission', 'write_role'])
  async deletePermissionWithRole(ctx) {
    const { roleId, permissionIds } = ctx.request.body;
    return await this.permService.delRolePermission({
      roleId,
      permissionIds: Array.from(new Set(permissionIds)),
    });
  }

  /**
   * 全量修改用户权限
   * @param ctx
   */
  @Post('/transfer_permissions_with_user')
  @Summary('全量修改用户权限')
  @Description('先删除用户当前所有权限，再添加新权限')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要操作的用户ID'),
      permissionIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的权限ID列表'),
    }),
  })
  @PermissionWithAction(['write_user', 'write_permission'])
  async transferPermissionWithUser(ctx) {
    const { userId, permissionIds } = ctx.request.body;
    const [user, permIds] = await Promise.all([
      this.userService.checkUser(userId),
      this.permService.filterOwnPermissions(permissionIds),
    ]);
    if (user && permIds) {
      return await this.permService.transferUserPermission({
        userId,
        permissionIds: permIds,
      });
    }
  }

  /**
   * 全量修改角色权限
   * @param ctx
   */
  @Post('/transfer_permissions_with_role')
  @Summary('全量修改角色权限')
  @Description('先删除角色当前所有权限，再添加新权限')
  @Parameters({
    body: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('要操作的角色ID'),
      permissionIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的权限ID列表'),
    }),
  })
  @PermissionWithAction(['write_role', 'write_permission'])
  async transferMenusWithRole(ctx) {
    const { roleId, permissionIds } = ctx.request.body;
    const [role, permIds] = await Promise.all([
      this.roleService.checkRole(roleId),
      this.permService.filterOwnPermissions(permissionIds),
    ]);
    if (role && permIds) {
      return await this.permService.transferRolePermission({
        roleId,
        permissionIds: permIds,
      });
    }
  }
}
