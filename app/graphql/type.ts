import { ClassType, Field, ObjectType, Int } from 'type-graphql';

/**
 * 泛型类型
 * @param TItemClass
 */
export const PaginatedResponse = <TItem>(TItemClass: ClassType<TItem>) => {
  @ObjectType({ isAbstract: true })
  abstract class PaginateClass {
    @Field(_type => [TItemClass], {
      description: '列表信息',
    })
    rows: TItem[];

    @Field(_type => Int, {
      description: '记录总数，用来做分页',
    })
    count: number;
  }
  return PaginateClass;
};
