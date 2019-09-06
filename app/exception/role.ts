import { Application } from 'egg';

export default (_app: Application) => {
  return {
    ROLE_NOT_EXIST_ERROR: {
      code: 601,
      msg: '该角色不存在',
    },
    NO_ALLOW_TO_UPDATE_OTHER_PLATFORM_ROLE_ERROR: {
      code: 602,
      msg: '不允许修改其他平台的角色',
    },
    ROLECODE_ALREADY_EXISTS_ERROR: {
      code: 603,
      msg: '角色编号重复',
    },
  };
};
