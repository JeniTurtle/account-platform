# account-platform

## Description

基于eggjs、typeorm、type-graphql、postgreSQL开发的一套支持多平台的用户权限管理系统。

管理自身系统的接口使用graphql，开放给接入平台的接口使用的restful，详情参考swagger文档。

另外带有eureka服务注册插件，可以获取远程配置文件，以及rabbitmq插件。

注：该项目使用场景基于eureka服务，如果不使用eureka，先修改config/plugin.ts，把eureka插件关闭。

再修改app.ts和agent.ts，把configHandler.ts相关的方法注释掉，最后改下数据库、redis相关的配置项即可。

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7021/graphql
$ open http://127.0.0.1:7021/swagger-ui/index.html
```

Don't tsc compile at development mode, if you had run `tsc` then you need to `npm run clean` before `npm run dev`.

### Deploy

```bash
$ npm run tsc
$ npm start
```

### Npm Scripts

- 使用 `graphql:codegen` 生成graphql类型代码，该命令需要先启动项目。

- 使用 `db:migrate:generate` 生成数据库变更记录，注意！该命令需要先启动项目，因为数据库相关信息是动态获取的。

- 使用 `db:migrate` 把变更记录同步到数据库


### Requirement

- Node.js 8.x
- Typescript 2.8+


## swagger文档
-- 启动server后, 打开网址: http://127.0.0.1:7021/swagger-ui/index.html

