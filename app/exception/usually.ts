import { Application } from 'egg';

export default (_app: Application) => {
  return {
    DEFAULT_ERROR: {
      code: 101,
      msg: '系统异常',
    },
    PARAM_VALIDATE_ERROR: {
      code: 102,
      msg: '参数格式效验失败',
    },
  };
};
