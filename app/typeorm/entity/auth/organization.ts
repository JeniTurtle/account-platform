import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel, Model, StringField } from '@plugin/typeorm-graphql';
import { Field, ID } from 'type-graphql';

@Model()
export class Organization extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @StringField({ maxLength: 64, comment: '机构名称' })
  organizeName: string;

  @StringField({ maxLength: 64, comment: '所在地区', nullable: true })
  location?: string;
}
