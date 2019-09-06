import { PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID } from 'type-graphql';
import { BaseModel, Model, StringField, IntField, ManyToOne } from '@plugin/typeorm-graphql';
import { Organization } from '@entity/auth/organization';

@Model()
export class Department extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @StringField({ maxLength: 64, comment: '部门名称' })
  departmentName: string;

  @StringField({ maxLength: 64, comment: '所在地区', nullable: true })
  location?: string;

  @IntField({ comment: '部门顺序', nullable: true })
  departmentOrder?: number;

  @ManyToOne(_type => Department, department => department.supreior, {
    comment: '上级部门',
    nullable: true,
  })
  supreior: Department;

  @ManyToOne(_type => Organization, origanization => origanization.user, {
    nullable: true,
    comment: '所属机构',
  })
  organization?: Organization;
  organizationId?: string;
}
