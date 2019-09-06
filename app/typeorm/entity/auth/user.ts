import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { Department } from './department';
import { PermissionUser } from '@entity/auth/permissionUser';
import { Platform } from '@entity/auth/platform';
import { RoleUser } from '@entity/auth/roleUser';
import { Organization } from '@entity/auth/organization';

import {
  BaseModel,
  DateField,
  EmailField,
  EnumField,
  Model,
  StringField,
  ManyToOne,
  OneToMany,
} from '@plugin/typeorm-graphql';

export enum UserIsSuperuser {
  NO = 0,
  YES = 1,
}

export enum UserIsActive {
  NO = 0,
  YES = 1,
}

export enum UserIsStaff {
  NO = 0,
  YES = 1,
}

export enum UserGender {
  UNKNOWN = 0,
  MAN = 1,
  WOMAN = 2,
}

@Model()
export class User extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @StringField({ maxLength: 128, comment: '用户名' })
  @Column({ length: 128, comment: '用户名', unique: true })
  username: string;

  @Column({ comment: '密码', length: 128 })
  password: string;

  @StringField({ maxLength: 128, comment: '真实姓名', nullable: true })
  realname?: string;

  @StringField({ maxLength: 128, nullable: true, comment: '用户昵称' })
  nickname?: string;

  @EnumField('UserGender', UserGender, { defaultValue: UserGender.UNKNOWN, comment: '性别' })
  gender: UserGender;

  @EnumField('UserIsSuperuser', UserIsSuperuser, { defaultValue: UserIsSuperuser.NO, comment: '是否是超级管理员' })
  isSuperuser: UserIsSuperuser;

  @EnumField('UserIsStaff', UserIsStaff, { defaultValue: UserIsStaff.NO, comment: '是否是员工' })
  isStaff: UserIsStaff;

  @EnumField('UserIsActive', UserIsActive, { defaultValue: UserIsActive.YES, comment: '是否启用' })
  isActive: UserIsActive;

  @EmailField({ nullable: true, comment: '电子邮箱', unique: true })
  email?: string;

  @StringField({ maxLength: 32, comment: '手机号码', nullable: true })
  mobile?: string;

  @DateField({ comment: '首次登陆时间', nullable: true })
  firstLoginTime?: Date;

  @DateField({ comment: '最后一次登陆时间', nullable: true })
  lastLoginTime?: Date;

  @ManyToOne(_type => Department, department => department.user, {
    nullable: true,
    comment: '所属部门',
  })
  department?: Department;
  departmentId?: string;

  @ManyToOne(_type => Organization, organization => organization.user, {
    nullable: true,
    comment: '所属机构',
  })
  organization?: Organization;
  organizationId?: string;

  @ManyToOne(_type => Platform, platform => platform.user, {
    nullable: true,
    comment: '所属平台',
  })
  platform?: Platform;
  platformId?: string;

  @OneToMany(_type => PermissionUser, permissionUsers => permissionUsers.user)
  permissionUsers: PermissionUser[];

  @OneToMany(_type => RoleUser, roleUsers => roleUsers.user)
  roleUsers: RoleUser[];
}
