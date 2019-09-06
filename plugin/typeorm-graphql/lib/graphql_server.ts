import { join } from 'path';
import { existsSync } from 'fs';
import { find } from 'fs-jetpack';
import { Application } from 'egg';
import { ApolloServer, Config } from 'apollo-server-koa';
import { separateOperations, GraphQLID } from 'graphql';
import { authChecker } from 'warthog';

// @ts-ignore
import { getComplexity, simpleEstimator, fieldConfigEstimator } from 'graphql-query-complexity';
import { buildSchema, BuildSchemaOptions } from 'type-graphql';

export interface GraphQLConfig {
  path: string;
  middlewares: any[];
  dataLoaderPath: string;
  resolverSuffix: string;
  router: string;
  graphiql: boolean;
  schema: BuildSchemaOptions;
  maxComplexity: number;
  apolloServer: Config;
}

export default class GraphQLServer {
  private readonly app: Application;
  private graphqlConfig: GraphQLConfig;

  constructor(app: Application) {
    this.app = app;
    this.graphqlConfig = app.config.graphql;
  }

  private loadResolvers() {
    const { baseDir } = this.app;
    const { path: graphQLPath, resolverSuffix } = this.graphqlConfig;
    const graphqlDir = join(baseDir, graphQLPath);
    const resolvers: any[] = [];

    if (!existsSync(graphqlDir)) return [];

    // TODO: handle other env
    const matching = this.app.config.env === 'local' ? `*${resolverSuffix}.ts` : `*${resolverSuffix}.js`;
    const files = find(graphqlDir, { matching });

    try {
      for (const file of files) {
        const resolverPath = join(baseDir, file);
        const resolver = require(resolverPath).default;
        resolvers.push(resolver);
      }
    } catch (e) {
      this.app.logger.error('[egg-type-graphql]', JSON.stringify(e));
    }

    return resolvers;
  }

  private async getSchema() {
    const resolvers = this.loadResolvers();
    const { schema, middlewares = [] } = this.graphqlConfig;
    if (schema && schema.globalMiddlewares && middlewares) {
      schema.globalMiddlewares = schema.globalMiddlewares.concat(middlewares);
    }

    return await buildSchema({
      ...schema,
      authChecker,
      scalarsMap: [
        {
          type: 'ID' as any,
          scalar: GraphQLID,
        },
      ],
      resolvers,
    });
  }

  async start() {
    const { apolloServer, maxComplexity } = this.graphqlConfig;
    const schema = await this.getSchema();
    const server = new ApolloServer({
      ...apolloServer,
      schema,
      context: async opts => {
        const { ctx } = opts;
        ctx.connection = ctx.app.context.connection;
        ctx.dataLoader = {
          initialized: false,
          loaders: {},
        };
        return ctx;
      },
      plugins: [
        {
          requestDidStart: () => ({
            didResolveOperation({ request, document }) {
              /**
               * This provides GraphQL query analysis to be able to react on complex queries to your GraphQL server.
               * This can be used to protect your GraphQL servers against resource exhaustion and DoS attacks.
               * More documentation can be found at https://github.com/ivome/graphql-query-complexity.
               */
              const complexity = getComplexity({
                // Our built schema
                schema,
                // To calculate query complexity properly,
                // we have to check if the document contains multiple operations
                // and eventually extract it operation from the whole query document.
                query: request.operationName ? separateOperations(document)[request.operationName] : document,
                // The variables for our GraphQL query
                variables: request.variables,
                // Add any number of estimators. The estimators are invoked in order, the first
                // numeric value that is being returned by an estimator is used as the field complexity.
                // If no estimator returns a value, an exception is raised.
                estimators: [
                  // Using fieldConfigEstimator is mandatory to make it work with type-graphql.
                  fieldConfigEstimator(),
                  // Add more estimators here...
                  // This will assign each field a complexity of 1
                  // if no other estimator returned a value.
                  simpleEstimator({ defaultComplexity: 1 }),
                ],
              });
              // Here we can react to the calculated complexity,
              // like compare it with max and throw error when the threshold is reached.
              if (complexity >= (maxComplexity || 200)) {
                throw new Error(
                  `Sorry, too complicated query! ${complexity} is over 20 that is the max allowed complexity.`,
                );
              }
              // And here we can e.g. subtract the complexity point from hourly API calls limit.
              console.log('Used query complexity points:', complexity);
            },
          }),
        },
      ],
    });
    server.applyMiddleware({
      app: this.app,
      path: this.graphqlConfig.router,
      cors: false,
    });
    this.app.logger.info('[egg-type-graphql] GraphQL server started');
  }
}
