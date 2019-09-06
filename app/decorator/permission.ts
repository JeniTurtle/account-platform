import * as is from 'is-type-of';
import * as assert from 'assert';
import * as _ from 'lodash';
import { Context } from 'egg';
import { User } from '@entity/auth/user';
import { Role } from '@entity/auth/role';

export interface IUserData {
  token: string;
  userinfo: User;
  roles: Role[];
  permissions: string[];
}

const initCtx = (ctx: Context, args: any) => {
  if (!ctx) {
    for (const arg of args) {
      if (arg.app && arg.app.config) {
        ctx = arg;
        break;
      }
    }
  }
  assert(ctx, 'resolver权限效验时，必须注入@Ctx参数');
  return ctx;
};

/**
 * 支持所属角色与/或
 * 例：限制该用户必须是老师且是管理员
 * @PermissionWithRole(['teacher', 'admin'])
 * 例：限制用户是老师，或者管理员
 * @PermissionWithRole('teacher', 'admin')
 * 例：限制用户是管理员，或者是老师，或者是家长以及学生
 * @PermissionWithRole('admin', 'teacher', ['parent', 'student'])
 */
export const PermissionWithRole = (...roles: Array<Array<string | null>>) => {
  assert(roles.length > 0, '需要至少设置一个角色');
  return (_target, _name, descriptor) => {
    const fn = descriptor.value;
    if (!is.function(fn)) {
      return descriptor;
    }
    // @ts-ignore
    descriptor.value = function(...args) {
      const ctx = initCtx(this.ctx, args);
      const userData = ctx.userData;
      // 超级管理员为所欲为
      if (userData.userinfo.isSuperuser === 1) {
        return fn.apply(this, args);
      }
      const orRoles: string[] = [];
      const andRoles = roles.filter(role => {
        if (typeof role === 'string') {
          orRoles.push(role);
        }
        return Array.isArray(role);
      });
      const userRoles = userData.roles.map(role => role.roleCode);
      // 判断交集数量是否大于0
      if (_.intersection(userRoles, orRoles).length > 0) {
        return fn.apply(this, args);
      }
      // 判断是否包含
      for (const andRole of andRoles) {
        if (_.intersection(userRoles, andRole).length === andRole.length) {
          return fn.apply(this, args);
        }
      }
      const { ROLE_WIHTOUT_PERMISSION_ERROR } = ctx.app.exception.permission;
      ctx.error(ROLE_WIHTOUT_PERMISSION_ERROR);
    };
    return descriptor;
  };
};

/**
 * 自定义方法效验权限，会往方法中注入user相关数据
 * @param validation
 */
export const PermissionWithUser = (validation: (user: IUserData) => boolean) => {
  return (_target, _name, descriptor) => {
    const fn = descriptor.value;
    if (!is.function(fn)) {
      return descriptor;
    }
    // @ts-ignore
    descriptor.value = function(...args) {
      const ctx = initCtx(this.ctx, args);
      const userData = ctx.userData;
      // 超级管理员为所欲为
      if (userData.userinfo.isSuperuser === 1) {
        return fn.apply(this, args);
      }
      // 执行自定义权限效验方法
      if (validation(userData)) {
        return fn.apply(this, args);
      }
      const { USER_WIHTOUT_PERMISSION_ERROR } = ctx.app.exception.permission;
      ctx.error(USER_WIHTOUT_PERMISSION_ERROR);
    };
    return descriptor;
  };
};

/**
 * 支持具体行为权限与/或
 * 例：限制用户必须要有“修改部门权限”和“添加部门权限”
 * @PermissionWithAction(['update_department', 'create_department'])
 * 例：限制用户有“修改部门权限”或“添加部门权限”
 * @PermissionWithRole('write_department', 'write_department')
 * 例：限制用户有“部门全部权限”，或者“查看部门权限”、“删除部门权限”、“添加部门权限”、“修改部门权限”
 * @PermissionWithRole('all_department', [
 *    'update_department',
 *    'create_department',
 *    'delete_department',
 *    'read_department',
 * ])
 */
export const PermissionWithAction = (...actions: Array<string | Array<string | null>>) => {
  assert(actions.length > 0, '需要至少设置一个权限');
  return (_target, _name, descriptor) => {
    const fn = descriptor.value;
    if (!is.function(fn)) {
      return descriptor;
    }
    // @ts-ignore
    descriptor.value = function(...args) {
      const ctx = initCtx(this.ctx, args);
      const userData = ctx.userData;
      // 超级管理员为所欲为
      if (userData.userinfo.isSuperuser === 1) {
        return fn.apply(this, args);
      }
      const orActions: string[] = [];
      const andActions = actions.filter(action => {
        if (typeof action === 'string') {
          orActions.push(action);
        }
        return Array.isArray(action);
      });
      const userPerms = userData.permissions;
      // 判断交集数量是否大于0
      if (_.intersection(userPerms, orActions).length > 0) {
        return fn.apply(this, args);
      }
      // 判断是否包含
      for (const andAction of andActions) {
        if (_.intersection(userPerms, andAction).length === andAction.length) {
          return fn.apply(this, args);
        }
      }
      const { USER_LACK_PERMISSION_ERROR } = ctx.app.exception.permission;
      ctx.error(USER_LACK_PERMISSION_ERROR);
    };
    return descriptor;
  };
};
