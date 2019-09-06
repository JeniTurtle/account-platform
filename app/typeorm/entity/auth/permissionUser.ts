import { PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { Permission } from './permission';
import { BaseModel, Model, ManyToOne } from '@plugin/typeorm-graphql';
import { User } from './user';

@Model()
export class PermissionUser extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @ManyToOne(_type => User, user => user.permissionUsers, { comment: '用户ID', primary: true })
  user: User;
  userId: string;

  @ManyToOne(_type => Permission, permission => permission.permissionUsers, { comment: '权限ID', primary: true })
  permission: Permission;
  permissionId: string;
}
