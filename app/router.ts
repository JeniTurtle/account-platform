import { Application } from 'egg';
import { EggShell } from 'egg-shell-plus';

/**
 *  swagger文档地址: http://host:port/swagger-ui/index.html
 *
 *  注: URL首字母全部会被转成小写。
 *  比如 /Demo/JsonWebToken, 会变成/demo/jsonWebToken
 */
export default (app: Application) => {
  const { eggShell } = app.config;

  EggShell(app, {
    prefix: '/', // 设置全局前缀
    autoResponse: true, // 控制器方法return结果后,自动返回JSON格式数据
    ...eggShell,
  });
};
