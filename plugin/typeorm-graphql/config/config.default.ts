import { EggAppConfig, PowerPartial } from 'egg';
import { DataLoaderMiddleware } from 'warthog';
import { Container } from 'typedi';
import { ErrorInterceptor } from '../middleware/error_handler';

export default () => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.graphql = {
    path: 'app/graphql',
    resolverSuffix: 'resolver', // 例：test/resolver.ts，或者 test/test.resolver.ts
    router: '/graphql',
    graphiql: true,
    schema: {
      dateScalarMode: 'timestamp',
      emitSchemaFile: true,
      globalMiddlewares: [ErrorInterceptor, DataLoaderMiddleware],
      container: Container,
    },
    apolloServer: {
      tracing: false,
      introspection: true,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
      } as any,
    },
  };

  return config;
};
