import { Get, TagsAll, IgnoreJwtAll, Summary, Responses } from 'egg-shell-plus';

@TagsAll('Eureka服务接口')
@IgnoreJwtAll // 整个控制器忽略JWT效验
export default class EurekaController {
  @Get()
  @Summary('eureka客户端信息接口')
  @Responses({ status: 200, definition: 'EurekaInfoResp' })
  async info(ctx) {
    ctx.body = { name: 'account-platform', status: 'UP' };
  }

  @Get()
  @Summary('eureka心跳监听接口')
  @Responses({ status: 200, definition: 'EurekaHealthResp' })
  async health(ctx) {
    ctx.body = {
      description: 'Spring Cloud Eureka Discovery Client',
      status: 'UP',
      hystrix: {
        status: 'UP',
      },
    };
  }
}
