import { Args, Query, Resolver, Mutation, Arg, Ctx, FieldResolver, Root, ObjectType } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { BindServiceCtx } from '@plugin/typeorm-graphql';
import { UserWhereInput, UserWhereArgs, UserCreateInput } from '@graphql/generated';
import { PaginatedResponse } from '@graphql/type';
import { User } from '@entity/auth/user';
import { Department } from '@entity/auth/department';
import { Platform } from '@entity/auth/platform';
import { PermissionUser } from '@entity/auth/permissionUser';
import UserService from '@service/auth/user';
import { PermissionWithAction } from '@decorator/permission';

@ObjectType({ description: '用户列表列表视图' })
export class UserList extends PaginatedResponse(User) {
  // 可以扩展其他字段
}

@Resolver(User)
export class UserResolver {
  @Inject('UserService')
  readonly userService: UserService;

  @FieldResolver(() => User, {
    complexity: 15, // 15个字段长度的复杂度
    nullable: true,
  })
  @PermissionWithAction('read_permission')
  async permissionUsers(@Root() user: User, @Ctx() ctx: Context): Promise<PermissionUser> {
    return ctx.dataLoader.loaders.User.permissionUsers.load(user);
  }

  @FieldResolver(() => User, {
    complexity: 15,
    nullable: true,
  })
  @PermissionWithAction('read_department')
  async department(@Root() user: User, @Ctx() ctx: Context): Promise<Department> {
    return ctx.dataLoader.loaders.User.department.load(user);
  }

  @FieldResolver(() => User, {
    complexity: 15,
    nullable: true,
  })
  @PermissionWithAction('read_platform')
  async platform(@Root() user: User, @Ctx() ctx: Context): Promise<Platform> {
    return ctx.dataLoader.loaders.User.platform.load(user);
  }

  @Query(() => UserList)
  @PermissionWithAction('read_user')
  async users(@Args() { where, orderBy, limit, offset }: UserWhereArgs, @Ctx() _ctx: Context): Promise<UserList> {
    return await this.userService.findAndCount<UserWhereInput>({
      where,
      orderBy,
      limit,
      offset,
    });
  }

  @BindServiceCtx
  @Mutation(() => User)
  @PermissionWithAction('write_user')
  async createUser(@Arg('data') data: UserCreateInput, @Ctx() ctx: Context): Promise<User | undefined> {
    return await this.userService.createUser(data, ctx.userData.userinfo.id);
  }
}
