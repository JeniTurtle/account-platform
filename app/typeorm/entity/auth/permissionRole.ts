import { PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { Permission } from './permission';
import { BaseModel, Model, ManyToOne } from '@plugin/typeorm-graphql';
import { Role } from './role';

@Model()
export class PermissionRole extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @ManyToOne(_type => Role, role => role.permissionRoles, { comment: '角色ID', primary: true })
  role: Role;
  roleId: string;

  @ManyToOne(_type => Permission, permission => permission.permissionRoles, { comment: '权限ID', primary: true })
  permission: Permission;
  permissionId: string;
}
