import { Resolver, Mutation, Arg, Ctx, FieldResolver, Root, InputType, Field } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { BindServiceCtx } from '@plugin/typeorm-graphql';
import { User } from '@entity/auth/user';
import { Menu } from '@entity/auth/menu';
import { MenuUser } from '@entity/auth/menuUser';
import MenuService from '@service/auth/menu';
import { PermissionWithAction } from '@decorator/permission';

@InputType()
export class BindUserMenuInput {
  @Field()
  userId!: string;

  @Field(_type => [String])
  menuIds!: string[];
}

@Resolver(MenuUser)
export class MenuUserResolver {
  @Inject('MenuService')
  protected readonly menuService: MenuService;

  @FieldResolver(() => User, {
    complexity: 20, // 20个字段长度的复杂度
  })
  @PermissionWithAction('read_user')
  async user(@Root() menuUser: MenuUser, @Ctx() ctx: Context): Promise<User> {
    return ctx.dataLoader.loaders.MenuUser.user.load(menuUser);
  }

  @FieldResolver(() => Menu)
  @PermissionWithAction('read_menu')
  async menu(@Root() menuUser: MenuUser, @Ctx() ctx: Context): Promise<Menu> {
    return ctx.dataLoader.loaders.MenuUser.menu.load(menuUser);
  }

  @BindServiceCtx
  @Mutation(() => [MenuUser])
  @PermissionWithAction(['write_menu', 'write_user'])
  async addUserMenu(@Ctx() _ctx: Context, @Arg('data') data: BindUserMenuInput): Promise<MenuUser[]> {
    const { userId, menuIds } = data;
    return await this.menuService.addUserMenu({ userId, menuIds });
  }
}
