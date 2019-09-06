import { Resolver, Mutation, Arg, Ctx, FieldResolver, Root, InputType, Field } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { BindServiceCtx } from '@plugin/typeorm-graphql';
import { Role } from '@entity/auth/role';
import { Permission } from '@entity/auth/permission';
import { PermissionRole } from '@entity/auth/permissionRole';
import PermissionService from '@service/auth/permission';
import { PermissionWithAction } from '@decorator/permission';

@InputType()
export class BindRolePermissionInput {
  @Field()
  roleId!: string;

  @Field(_type => [String])
  permissionIds!: string[];
}

@Resolver(PermissionRole)
export class PermissionRoleResolver {
  @Inject('PermissionService')
  protected readonly permissionService: PermissionService;

  @FieldResolver(() => Role, {
    complexity: 20, // 20个字段长度的复杂度
  })
  @PermissionWithAction('read_role')
  async role(@Root() permissionRole: PermissionRole, @Ctx() ctx: Context): Promise<Role> {
    return ctx.dataLoader.loaders.PermissionRole.role.load(permissionRole);
  }

  @FieldResolver(() => Permission)
  @PermissionWithAction('read_permission')
  async permission(@Root() permissionRole: PermissionRole, @Ctx() ctx: Context): Promise<Permission> {
    return ctx.dataLoader.loaders.PermissionRole.permission.load(permissionRole);
  }

  @BindServiceCtx
  @Mutation(() => [PermissionRole])
  @PermissionWithAction(['write_permission', 'write_role'])
  async addRolePermission(@Ctx() _ctx: Context, @Arg('data') data: BindRolePermissionInput): Promise<PermissionRole[]> {
    const { roleId, permissionIds } = data;
    return await this.permissionService.addRolePermission({ roleId, permissionIds });
  }
}
