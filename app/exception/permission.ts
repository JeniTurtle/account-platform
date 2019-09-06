import { Application } from 'egg';

export default (_app: Application) => {
  return {
    ROLE_WIHTOUT_PERMISSION_ERROR: {
      code: 301,
      msg: '当前角色无访问权限',
    },
    USER_WIHTOUT_PERMISSION_ERROR: {
      code: 302,
      msg: '当前用户无访问权限',
    },
    USER_LACK_PERMISSION_ERROR: {
      code: 304,
      msg: '当前用户缺少权限',
    },
    PRIVILEGES_NOT_EXIST_ERROR: {
      code: 305,
      msg: '该权限不存在',
    },
    NO_ALLOW_TO_UPDATE_OTHER_PLATFORM_PERMISSION_ERROR: {
      code: 306,
      msg: '不允许修改其他平台的权限',
    },
  };
};
