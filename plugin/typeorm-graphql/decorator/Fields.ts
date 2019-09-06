import * as graphqlFields from 'graphql-fields';
import { createParamDecorator } from 'type-graphql';

export function Fields(): ParameterDecorator {
  return createParamDecorator(({ info }) => {
    // This object will be of the form:
    //   rawFields {
    //     baseField: {},
    //     association: { subField: "foo"}
    //   }
    // We need to pull out items with subFields
    const rawFields = graphqlFields(info);

    const scalars = Object.keys(rawFields).filter(item => {
      return Object.keys(rawFields[item]).length === 0;
    });

    return scalars;
  });
}
