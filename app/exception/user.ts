import { Application } from 'egg';

export default (_app: Application) => {
  return {
    USERNAME_ALREADY_EXISTS_ERROR: {
      code: 401,
      msg: '用户名已存在',
    },
    EMAIL_ALREADY_EXISTS_ERROR: {
      code: 402,
      msg: '邮箱已存在',
    },
    NO_ADD_STAFF_PERMISSION_ERROR: {
      code: 403,
      msg: '无权限添加员工',
    },
    NO_ADD_SUPERUSER_PERMISSION_ERROR: {
      code: 404,
      msg: '无权限添加超级管理员',
    },
    USER_DOES_NOT_EXIST_ERROR: {
      code: 405,
      msg: '用户不存在',
    },
    NO_PERMISSION_UPDATE_OTHER_PLATFORM_USER_ERROR: {
      code: 406,
      msg: '无权限修改其他平台用户',
    },
  };
};
