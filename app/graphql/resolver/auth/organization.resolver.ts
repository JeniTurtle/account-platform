import { Args, Query, Resolver, Mutation, Arg, Ctx, ObjectType } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { PaginatedResponse } from '@graphql/type';
import { OrganizationWhereArgs, OrganizationWhereInput, OrganizationCreateInput } from '@graphql/generated';
import { Organization } from '@entity/auth/organization';
import OrganizationService from '@service/auth/organization';
import { PermissionWithAction } from '@decorator/permission';

@ObjectType({ description: '机构列表视图' })
export class OrganizationList extends PaginatedResponse(Organization) {
  // 可以扩展其他字段
}

@Resolver(Organization)
export class OrganizationResolver {
  constructor(@Inject('OrganizationService') readonly organizationService: OrganizationService) {}

  @Query(() => OrganizationList)
  @PermissionWithAction('read_organization')
  async organizations(
    @Ctx() _ctx: Context,
    @Args() { where, orderBy, limit, offset }: OrganizationWhereArgs,
  ): Promise<OrganizationList> {
    return await this.organizationService.findAndCount<OrganizationWhereInput>({
      where,
      orderBy,
      limit,
      offset,
    });
  }

  @Mutation(() => Organization)
  @PermissionWithAction('write_organization')
  async createOrganization(@Arg('data') data: OrganizationCreateInput, @Ctx() ctx: Context): Promise<Organization> {
    return await this.organizationService.create(data, ctx.userData.userinfo.id);
  }
}
