import { PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { BaseModel, Model, StringField, OneToMany, ManyToOne } from '@plugin/typeorm-graphql';
import { RoleUser } from '@entity/auth/roleUser';
import { Platform } from '@entity/auth/platform';
import { PermissionRole } from '@entity/auth/permissionRole';

@Model()
export class Role extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @StringField({ maxLength: 64, comment: '角色名称' })
  roleName: string;

  @StringField({ maxLength: 64, comment: '角色编号' })
  roleCode: string;

  @StringField({ maxLength: 1024, comment: '备注', nullable: true })
  remark?: string;

  @ManyToOne(_type => Platform, platform => platform.user, {
    nullable: true,
    comment: '所属平台',
  })
  platform?: Platform;
  platformId?: string;

  @OneToMany(_type => PermissionRole, permissionRoles => permissionRoles.role)
  permissionRoles: PermissionRole[];

  @OneToMany(_type => RoleUser, roleUsers => roleUsers.role)
  roleUsers: RoleUser[];
}
