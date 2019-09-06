import { Post, TagsAll, Summary, Parameters, Joi, Get, Put, Delete, Description } from 'egg-shell-plus';
import { Inject } from 'typedi';
import UserService from '@service/auth/user';
import RoleService from '@service/auth/role';
import { RoleWhereInput } from '@graphql/generated';
import { PermissionWithAction } from '@decorator/permission';

const createRoleParams = {
  roleName: Joi.string()
    .max(50)
    .required()
    .description('角色名'),
  roleCode: Joi.string()
    .max(50)
    .required()
    .description('角色编号'),
  remark: Joi.string().description('角色备注'),
};

@TagsAll('对外开放的角色接口')
export default class RoleController {
  @Inject('UserService')
  readonly userService: UserService;

  @Inject('RoleService')
  readonly roleService: RoleService;

  /**
   * 获取角色列表
   */
  @Get()
  @Summary('获取角色列表')
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
      roleNameContains: Joi.string().description('角色名，模糊匹配'),
      roleCodeContains: Joi.string().description('角色编号，模糊匹配'),
    }),
  })
  @PermissionWithAction('read_role')
  async list(ctx) {
    const {
      request: { query },
      userData: { userinfo },
    } = ctx;
    const where: RoleWhereInput = {
      platformId_eq: userinfo.platformId, // 只能查看自己平台的用户
      roleName_contains: query.roleNameContains,
      roleCode_contains: query.roleCodeContains,
    };
    return await this.roleService.findAndCount({
      where,
      offset: (query.pageIndex - 1) * query.pageSize,
      limit: query.pageSize,
      orderBy: 'createdAt_DESC',
    });
  }

  /**
   * 添加角色
   * @param ctx
   */
  @Post()
  @Summary('添加用户接口')
  @Parameters({
    body: Joi.object().keys({
      ...createRoleParams,
    }),
  })
  @PermissionWithAction('write_role')
  public async create(ctx) {
    const {
      request: { body },
      userData: { userinfo },
    } = ctx;
    // 只能添加自己平台的用户
    body.platformId = userinfo.platformId;
    return await this.roleService.createRole(body);
  }

  /**
   * 查看角色详情
   * @param ctx
   */
  @Get('/detail/:roleId')
  @Summary('查看角色详情')
  @PermissionWithAction('read_role')
  @Parameters({
    pathParams: Joi.object().keys({
      roleId: Joi.string().description('角色id'),
    }),
  })
  public async detail(ctx) {
    const { roleId } = ctx.request.params;
    return await this.roleService.findOne({
      id: roleId,
    });
  }

  /**
   * 修改角色接口
   * @param ctx
   */
  @Put('/update/:roleId')
  @Summary('修改角色接口')
  @Parameters({
    body: Joi.object().keys({
      ...createRoleParams,
    }),
    pathParams: Joi.object().keys({
      roleId: Joi.string()
        .required()
        .description('角色id'),
    }),
  })
  @PermissionWithAction('write_role')
  async update(ctx) {
    const {
      request: { body },
      params: { roleId },
      userData: { userinfo },
    } = ctx;
    // 检查角色是否存在
    const role = await this.roleService.checkRole(roleId);
    if (!role) {
      return;
    }
    // 检查修改的角色编号是否重复
    const checkRepeatedRet = await this.roleService.checkRepeatedRoleCode(body, role);
    if (!checkRepeatedRet) {
      return;
    }
    return await this.roleService.update(
      body,
      {
        id: roleId,
      },
      userinfo.id,
    );
  }

  /**
   * 删除角色
   * @param ctx
   */
  @Delete('/delete/:roleId')
  @Summary('删除角色接口')
  @Parameters({
    pathParams: Joi.object().keys({
      roleId: Joi.string().description('角色id'),
    }),
  })
  @PermissionWithAction('write_role')
  public async delete(ctx) {
    const {
      params: { roleId },
      userData: { userinfo },
    } = ctx;
    const role = await this.roleService.checkRole(roleId);
    if (role) {
      return await this.roleService.delete(
        {
          id: roleId,
        },
        userinfo.id,
      );
    }
  }

  /**
   * 添加用户角色
   * @param ctx
   */
  @Put('/add_roles_with_user')
  @Summary('添加用户角色')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要添加的用户ID'),
      roleIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的角色ID列表'),
    }),
  })
  @PermissionWithAction(['write_user', 'write_role'])
  async addRolesWithUser(ctx) {
    const { userId, roleIds } = ctx.request.body;
    const [user, filteredIds] = await Promise.all([
      this.userService.checkUser(userId),
      this.roleService.filterOwnRoles(roleIds),
    ]);
    if (user && filteredIds) {
      return await this.roleService.addUserRole({
        userId,
        roleIds: filteredIds,
      });
    }
  }

  /**
   * 删除用户角色
   */
  @Delete('/delete_roles_with_user')
  @Summary('删除用户角色')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要删除的用户ID'),
      roleIds: Joi.array()
        .items(Joi.string())
        .description('要删除的角色ID列表，不传默认删除所有'),
    }),
  })
  @PermissionWithAction(['write_user', 'write_role'])
  async deleteRolesWithUser(ctx) {
    const { userId, roleIds } = ctx.request.body;
    return await this.roleService.delUserRole({
      userId,
      roleIds: Array.from(new Set(roleIds)),
    });
  }

  /**
   * 全量修改用户角色
   * @param ctx
   */
  @Post('/transfer_roles_with_user')
  @Summary('全量修改用户角色')
  @Description('先删除用户当前所有角色，再添加新角色')
  @Parameters({
    body: Joi.object().keys({
      userId: Joi.string()
        .required()
        .description('要操作的用户ID'),
      roleIds: Joi.array()
        .items(Joi.string())
        .min(1)
        .description('要添加的角色ID列表'),
    }),
  })
  @PermissionWithAction(['write_user', 'write_role'])
  async transferRolesWithUser(ctx) {
    const { userId, roleIds } = ctx.request.body;
    const [user, filteredIds] = await Promise.all([
      this.userService.checkUser(userId),
      this.roleService.filterOwnRoles(roleIds),
    ]);
    if (user && filteredIds) {
      return await this.roleService.transferUserRole({
        userId,
        roleIds: filteredIds,
      });
    }
  }
}
