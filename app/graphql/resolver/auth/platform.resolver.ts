import { Args, Query, Resolver, Mutation, Arg, Ctx, ObjectType } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { PaginatedResponse } from '@graphql/type';
import { PlatformWhereArgs, PlatformWhereInput, PlatformCreateInput } from '@graphql/generated';
import { Platform } from '@entity/auth/platform';
import PlatformService from '@service/auth/platform';
import { PermissionWithAction } from '@decorator/permission';

@ObjectType({ description: '平台列表视图' })
export class PlatformList extends PaginatedResponse(Platform) {
  // 可以扩展其他字段
}

@Resolver(Platform)
export class PlatformResolver {
  constructor(@Inject('PlatformService') readonly platformService: PlatformService) {}

  @Query(() => PlatformList)
  @PermissionWithAction('read_platform')
  async platforms(
    @Ctx() _ctx: Context,
    @Args() { where, orderBy, limit, offset }: PlatformWhereArgs,
  ): Promise<PlatformList> {
    return await this.platformService.findAndCount<PlatformWhereInput>({
      where,
      orderBy,
      limit,
      offset,
    });
  }

  @Mutation(() => Platform)
  @PermissionWithAction('write_platform')
  async createPlatform(@Arg('data') data: PlatformCreateInput, @Ctx() ctx: Context): Promise<Platform> {
    return await this.platformService.create(data, ctx.userData.userinfo.id);
  }
}
