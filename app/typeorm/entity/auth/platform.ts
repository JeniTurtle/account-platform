import { PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel, Model, StringField } from '@plugin/typeorm-graphql';
import { Field, ID } from 'type-graphql';

@Model()
export class Platform extends BaseModel {
  @PrimaryGeneratedColumn({ comment: '唯一ID' })
  @Field(_type => ID)
  id: string;

  @StringField({ maxLength: 64, comment: '平台名称' })
  platformName: string;

  @StringField({ maxLength: 1024, comment: '平台介绍' })
  platformDesc: string;
}
