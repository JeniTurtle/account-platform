import { PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { Menu } from './menu';
import { BaseModel, Model, ManyToOne } from '@plugin/typeorm-graphql';
import { Role } from './role';

@Model()
export class MenuRole extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @ManyToOne(_type => Role, role => role.menuRoles, { comment: '角色ID', primary: true })
  role: Role;
  roleId: string;

  @ManyToOne(_type => Menu, menu => menu.menuRoles, { comment: '菜单ID', primary: true })
  menu: Menu;
  menuId: string;
}
