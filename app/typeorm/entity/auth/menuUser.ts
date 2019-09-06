import { PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { Menu } from './menu';
import { BaseModel, Model, ManyToOne } from '@plugin/typeorm-graphql';
import { User } from './user';

@Model()
export class MenuUser extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @ManyToOne(_type => User, user => user.menuUsers, { comment: '用户ID', primary: true })
  user: User;
  userId: string;

  @ManyToOne(_type => Menu, menu => menu.menuUsers, { comment: '菜单ID', primary: true })
  menu: Menu;
  menuId: string;
}
