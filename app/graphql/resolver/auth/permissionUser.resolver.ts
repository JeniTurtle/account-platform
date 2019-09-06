import { Resolver, Mutation, Arg, Ctx, FieldResolver, Root, InputType, Field } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { BindServiceCtx } from '@plugin/typeorm-graphql';
import { User } from '@entity/auth/user';
import { Permission } from '@entity/auth/permission';
import { PermissionUser } from '@entity/auth/permissionUser';
import PermissionService from '@service/auth/permission';
import { PermissionWithAction } from '@decorator/permission';

@InputType()
export class BindUserPermissionInput {
  @Field()
  userId!: string;

  @Field(_type => [String])
  permissionIds!: string[];
}

@Resolver(PermissionUser)
export class PermissionUserResolver {
  @Inject('PermissionService')
  protected readonly permissionService: PermissionService;

  @FieldResolver(() => User, {
    complexity: 20, // 20个字段长度的复杂度
  })
  @PermissionWithAction('read_user')
  async user(@Root() permissionUser: PermissionUser, @Ctx() ctx: Context): Promise<User> {
    return ctx.dataLoader.loaders.PermissionUser.user.load(permissionUser);
  }

  @FieldResolver(() => Permission)
  @PermissionWithAction('read_permission')
  async permission(@Root() permissionUser: PermissionUser, @Ctx() ctx: Context): Promise<Permission> {
    return ctx.dataLoader.loaders.PermissionUser.permission.load(permissionUser);
  }

  @BindServiceCtx
  @Mutation(() => [PermissionUser])
  @PermissionWithAction(['write_permission', 'write_user'])
  async addUserPermission(@Ctx() _ctx: Context, @Arg('data') data: BindUserPermissionInput): Promise<PermissionUser[]> {
    const { userId, permissionIds } = data;
    return await this.permissionService.addUserPermission({ userId, permissionIds });
  }
}
