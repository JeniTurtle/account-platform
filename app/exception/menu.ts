import { Application } from 'egg';

export default (_app: Application) => {
  return {
    MENU_NOT_EXIST_ERROR: {
      code: 501,
      msg: '该菜单不存在',
    },
    NO_ALLOW_TO_UPDATE_OTHER_PLATFORM_MENU_ERROR: {
      code: 502,
      msg: '不允许修改其他平台的菜单',
    },
  };
};
