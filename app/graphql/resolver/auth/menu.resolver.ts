import { Args, Query, Resolver, Mutation, Arg, Ctx, ObjectType } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { PaginatedResponse } from '@graphql/type';
import { MenuWhereInput, MenuWhereArgs, MenuCreateInput } from '@graphql/generated';
import { Menu } from '@entity/auth/menu';
import MenuService from '@service/auth/menu';
import { PermissionWithAction } from '@decorator/permission';

@ObjectType({ description: '菜单列表视图' })
export class MenuList extends PaginatedResponse(Menu) {
  // 可以扩展其他字段
}

@Resolver(Menu)
export class MenuResolver {
  @Inject('MenuService')
  protected readonly menuService: MenuService;

  @Query(() => MenuList)
  @PermissionWithAction('read_menu')
  async menus(@Ctx() _ctx: Context, @Args() { where, orderBy, limit, offset }: MenuWhereArgs): Promise<MenuList> {
    return await this.menuService.findAndCount<MenuWhereInput>({
      where,
      orderBy,
      limit,
      offset,
    });
  }

  @Mutation(() => Menu)
  @PermissionWithAction('write_menu')
  async createMenu(@Arg('data') data: MenuCreateInput, @Ctx() ctx: Context): Promise<Menu> {
    return await this.menuService.create(data, ctx.userData.userinfo.id);
  }
}
