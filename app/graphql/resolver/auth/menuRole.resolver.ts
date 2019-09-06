import { Resolver, Mutation, Arg, Ctx, FieldResolver, Root, InputType, Field } from 'type-graphql';
import { Inject } from 'typedi';
import { Context } from 'egg';
import { BindServiceCtx } from '@plugin/typeorm-graphql';
import { Role } from '@entity/auth/role';
import { Menu } from '@entity/auth/menu';
import { MenuRole } from '@entity/auth/menuRole';
import MenuService from '@service/auth/menu';
import { PermissionWithAction } from '@decorator/permission';

@InputType()
export class BindRoleMenuInput {
  @Field()
  roleId!: string;

  @Field(_type => [String])
  menuIds!: string[];
}

@Resolver(MenuRole)
export class MenuRoleResolver {
  @Inject('MenuService')
  protected readonly menuService: MenuService;

  @FieldResolver(() => Role, {
    complexity: 20, // 20个字段长度的复杂度
  })
  @PermissionWithAction('read_role')
  async role(@Root() menuRole: MenuRole, @Ctx() ctx: Context): Promise<Role> {
    return ctx.dataLoader.loaders.MenuRole.role.load(menuRole);
  }

  @FieldResolver(() => Menu)
  @PermissionWithAction('read_menu')
  async menu(@Root() menuRole: MenuRole, @Ctx() ctx: Context): Promise<Menu> {
    return ctx.dataLoader.loaders.MenuRole.menu.load(menuRole);
  }

  @BindServiceCtx
  @Mutation(() => [MenuRole])
  @PermissionWithAction(['write_menu', 'write_role'])
  async addRoleMenu(@Ctx() _ctx: Context, @Arg('data') data: BindRoleMenuInput): Promise<MenuRole[]> {
    const { roleId, menuIds } = data;
    return await this.menuService.addRoleMenu({ roleId, menuIds });
  }
}
