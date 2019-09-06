import { Application } from 'egg';

export default (_app: Application) => {
  return {
    INCORRECT_TOKEN_FORMAT_ERROR: {
      code: 201,
      msg: '错误的Token格式',
    },
    UNAUTHORIED_ERROR: {
      code: 202,
      msg: '权限效验不通过',
    },
    NOTFOUND_USER_ERROR: {
      code: 203,
      msg: '用户不存在',
    },
    PASSWORD_VALIDATE_ERROR: {
      code: 204,
      msg: '用户密码错误',
    },
    USER_DISABLED_ERROR: {
      code: 205,
      msg: '用户已停用',
    },
    OVERDUE_LANDING_ERROR: {
      code: 207,
      msg: '登陆已过期，请重新登陆',
    },
    LANDING_ELSEWHERE_ERROR: {
      code: 208,
      msg: '账号已在其他地方登陆',
    },
    NO_ACCESS_RIGHTS_ERROR: {
      code: 209,
      msg: '此用户无权限登陆',
    },
    UNKNOWN_EXCEPTION_ERROR: {
      code: 210,
      msg: '未知登陆异常，请联系管理员',
    },
  };
};
