import { Context } from 'egg';

export interface IResponseJsonFormat {
  code?: number;
  data: any;
  msg?: string;
}

export interface IResponseErrorFormat {
  code?: number;
  error?: string;
  msg?: string;
}

export default {
  /**
   * 输出json格式数据
   * @param resp
   */
  success(this: Context, resp: IResponseJsonFormat) {
    const { code = 100, data, msg = '请求成功' } = resp;
    this.status = 200;
    return (this.response.body = {
      code,
      msg,
      data,
    });
  },

  /**
   * 输出错误格式数据
   * @param resp
   * @param status
   */
  error(this: Context, resp: IResponseErrorFormat, status: number = 200) {
    const { DEFAULT_ERROR } = this.app.exception.usually;
    const { code = DEFAULT_ERROR.code, msg = DEFAULT_ERROR.msg, error } = resp;
    this.status = status;
    return (this.response.body = {
      code,
      msg,
      error,
    });
  },
};
