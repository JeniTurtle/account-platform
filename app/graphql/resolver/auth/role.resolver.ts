import { Args, Query, Resolver, Mutation, Arg, Ctx, ObjectType } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { PaginatedResponse } from '@graphql/type';
import { RoleWhereInput, RoleWhereArgs, RoleCreateInput } from '@graphql/generated';
import { Role } from '@entity/auth/role';
import RoleService from '@service/auth/role';
import { PermissionWithAction } from '@decorator/permission';

@ObjectType({ description: '角色列表视图' })
export class RoleList extends PaginatedResponse(Role) {
  // 可以扩展其他字段
}

@Resolver(Role)
export class RoleResolver {
  constructor(@Inject('RoleService') readonly roleService: RoleService) {}

  @Query(() => RoleList)
  @PermissionWithAction('read_role')
  async roles(@Ctx() _ctx: Context, @Args() { where, orderBy, limit, offset }: RoleWhereArgs): Promise<RoleList> {
    return await this.roleService.findAndCount<RoleWhereInput>({
      where,
      orderBy,
      limit,
      offset,
    });
  }

  @Mutation(() => Role)
  @PermissionWithAction('write_role')
  async createRole(@Arg('data') data: RoleCreateInput, @Ctx() ctx: Context): Promise<Role> {
    return await this.roleService.create(data, ctx.userData.userinfo.id);
  }
}
