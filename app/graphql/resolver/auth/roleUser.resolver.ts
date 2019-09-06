import { Resolver, Mutation, Arg, Ctx, FieldResolver, Root, InputType, Field } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { BindServiceCtx } from '@plugin/typeorm-graphql';
import { User } from '@entity/auth/user';
import { Role } from '@entity/auth/role';
import { RoleUser } from '@entity/auth/roleUser';
import RoleService from '@service/auth/role';
import { PermissionWithAction } from '@decorator/permission';

@InputType()
export class BindUserRoleInput {
  @Field()
  userId!: string;

  @Field(_type => [String])
  roleIds!: string[];
}

@Resolver(RoleUser)
export class RoleUserResolver {
  @Inject('RoleService')
  protected readonly roleService: RoleService;

  @FieldResolver(() => User, {
    complexity: 20, // 20个字段长度的复杂度
  })
  @PermissionWithAction('read_user')
  async user(@Root() roleUser: RoleUser, @Ctx() ctx: Context): Promise<User> {
    return ctx.dataLoader.loaders.RoleUser.user.load(roleUser);
  }

  @FieldResolver(() => Role)
  @PermissionWithAction('read_role')
  async role(@Root() roleUser: RoleUser, @Ctx() ctx: Context): Promise<Role> {
    return ctx.dataLoader.loaders.RoleUser.role.load(roleUser);
  }

  @BindServiceCtx
  @Mutation(() => [RoleUser])
  @PermissionWithAction(['write_role', 'write_user'])
  async addUserRole(@Ctx() _ctx: Context, @Arg('data') data: BindUserRoleInput): Promise<RoleUser[]> {
    const { userId, roleIds } = data;
    return await this.roleService.addUserRole({ userId, roleIds });
  }
}
