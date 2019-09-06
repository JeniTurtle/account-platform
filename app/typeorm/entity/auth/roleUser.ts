import { PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { BaseModel, Model, ManyToOne, EnumField } from '@plugin/typeorm-graphql';
import { User } from './user';
import { Role } from './role';

export enum RoleUserIsActive {
  NO = 0,
  YES = 1,
}

@Model()
export class RoleUser extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @ManyToOne(_type => User, user => user.roleUsers, { comment: '用户ID', primary: true })
  user: User;
  userId: string;

  @ManyToOne(_type => Role, role => role.roleUsers, { comment: '角色ID', primary: true })
  role: Role;
  roleId: string;
}
