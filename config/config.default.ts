import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.keys = appInfo.name + '_15536723820306_9803';

  config.security = {
    // 关闭csrf
    csrf: {
      enable: false,
    },
  };

  // 跨域设置，允许所有域名
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  // egg全局中间件, 注: 所有中间件首字母都是小写哦
  config.middleware = ['logger', 'errorHandler'];

  // 自定义中间件层级从外到里的顺序依次是:
  // router before -> controller before -> action before -> action after -> controller after -> router after
  // 测试路径: /demo/weglogic

  // 执行在控制器之前
  config.routerBeforeMiddleware = ['routerMiddleware.jwtValidate'];
  // 执行在控制器之后
  config.routerAfterMiddleware = ['routerMiddleware.renderJson'];

  // 中间件配置方式
  // 中间件多级目录, 需要加一级文件夹名字, 注册的时候也需要带上,
  // 比如 @Before('RouterMiddleware.TestActAfter')
  // 或者 config.routerAfterMiddleware = ['routerMiddleware.testActAfter'];

  // egg-shell-plus 配置
  config.eggShell = {
    // defaultIndex: '/home', // 设置默认首页, 之所以不设置index.ts作为入口目录, 是怕index控制器下面的action会污染全局地址
    jwtValidationName: 'routerMiddleware.jwtValidate', // 配置jwt效验的中间件名, 可以设置@ignoreJwt或@ignoreJwtAll来跳过该效验
    swaggerOpt: {
      open: true,
      title: '用户权限管理接口文档',
      version: '1.0.0',
      // 注意, definition的路径跟controller的路径做了强绑定, 为了确保名字不会冲突。
      definitionPath: './app/definition',
    },
  };

  config.authorize = {
    jwt: {
      secret: 'Weds123!@#',
      sign: {
        expiresIn: 7 * 24 * 3600, // jwt过期时间
      },
      verify: {},
      decode: {},
    },
    login: {
      expireTime: 24 * 3600, // 登陆过期时间
    },
  };

  return {
    ...config,
  };
};
