import { makeBindingClass, Options } from 'graphql-binding'
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import * as schema from  './schema.graphql'

export interface Query {
    departments: <T = DepartmentList>(args: { offset?: Int | null, limit?: Int | null, where?: DepartmentWhereInput | null, orderBy?: DepartmentOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    menus: <T = MenuList>(args: { offset?: Int | null, limit?: Int | null, where?: MenuWhereInput | null, orderBy?: MenuOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    organizations: <T = OrganizationList>(args: { offset?: Int | null, limit?: Int | null, where?: OrganizationWhereInput | null, orderBy?: OrganizationOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    permissions: <T = PermissionList>(args: { offset?: Int | null, limit?: Int | null, where?: PermissionWhereInput | null, orderBy?: PermissionOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    platforms: <T = PlatformList>(args: { offset?: Int | null, limit?: Int | null, where?: PlatformWhereInput | null, orderBy?: PlatformOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    roles: <T = RoleList>(args: { offset?: Int | null, limit?: Int | null, where?: RoleWhereInput | null, orderBy?: RoleOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    users: <T = UserList>(args: { offset?: Int | null, limit?: Int | null, where?: UserWhereInput | null, orderBy?: UserOrderByInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Mutation {
    createDepartment: <T = Department>(args: { data: DepartmentCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createMenu: <T = Menu>(args: { data: MenuCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    addRoleMenu: <T = Array<MenuRole>>(args: { data: BindRoleMenuInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    addUserMenu: <T = Array<MenuUser>>(args: { data: BindUserMenuInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createOrganization: <T = Organization>(args: { data: OrganizationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPermission: <T = Permission>(args: { data: PermissionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    addRolePermission: <T = Array<PermissionRole>>(args: { data: BindRolePermissionInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    addUserPermission: <T = Array<PermissionUser>>(args: { data: BindUserPermissionInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPlatform: <T = Platform>(args: { data: PlatformCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createRole: <T = Role>(args: { data: RoleCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    addUserRole: <T = Array<RoleUser>>(args: { data: BindUserRoleInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createUser: <T = User>(args: { data: UserCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Subscription {}

export interface Binding {
  query: Query
  mutation: Mutation
  subscription: Subscription
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
  delegateSubscription(fieldName: string, args?: {
      [key: string]: any;
  }, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
  getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(...args: any[]): T
}

export const Binding = makeBindingClass<BindingConstructor<Binding>>({ schema })

/**
 * Types
*/

export type DepartmentOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'departmentName_ASC' |
  'departmentName_DESC' |
  'location_ASC' |
  'location_DESC' |
  'departmentOrder_ASC' |
  'departmentOrder_DESC' |
  'supreiorId_ASC' |
  'supreiorId_DESC' |
  'organizationId_ASC' |
  'organizationId_DESC'

export type MenuIsCategory =   'YES' |
  'NO'

export type MenuOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'name_ASC' |
  'name_DESC' |
  'code_ASC' |
  'code_DESC' |
  'path_ASC' |
  'path_DESC' |
  'icon_ASC' |
  'icon_DESC' |
  'order_ASC' |
  'order_DESC' |
  'isCategory_ASC' |
  'isCategory_DESC' |
  'remark_ASC' |
  'remark_DESC' |
  'supreiorId_ASC' |
  'supreiorId_DESC' |
  'platformId_ASC' |
  'platformId_DESC'

export type OrganizationOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'organizeName_ASC' |
  'organizeName_DESC' |
  'location_ASC' |
  'location_DESC'

export type PermissionIsCategory =   'YES' |
  'NO'

export type PermissionIsGlobal =   'YES' |
  'NO'

export type PermissionOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'name_ASC' |
  'name_DESC' |
  'code_ASC' |
  'code_DESC' |
  'isCategory_ASC' |
  'isCategory_DESC' |
  'isGlobal_ASC' |
  'isGlobal_DESC' |
  'remark_ASC' |
  'remark_DESC' |
  'supreiorId_ASC' |
  'supreiorId_DESC' |
  'platformId_ASC' |
  'platformId_DESC'

export type PlatformOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'platformName_ASC' |
  'platformName_DESC' |
  'platformDesc_ASC' |
  'platformDesc_DESC'

export type RoleOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'roleName_ASC' |
  'roleName_DESC' |
  'roleCode_ASC' |
  'roleCode_DESC' |
  'remark_ASC' |
  'remark_DESC' |
  'platformId_ASC' |
  'platformId_DESC'

export type UserGender =   'UNKNOWN' |
  'MAN' |
  'WOMAN'

export type UserIsActive =   'NO' |
  'YES'

export type UserIsStaff =   'NO' |
  'YES'

export type UserIsSuperuser =   'NO' |
  'YES'

export type UserOrderByInput =   'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'deletedAt_ASC' |
  'deletedAt_DESC' |
  'username_ASC' |
  'username_DESC' |
  'password_ASC' |
  'password_DESC' |
  'realname_ASC' |
  'realname_DESC' |
  'nickname_ASC' |
  'nickname_DESC' |
  'gender_ASC' |
  'gender_DESC' |
  'isSuperuser_ASC' |
  'isSuperuser_DESC' |
  'isStaff_ASC' |
  'isStaff_DESC' |
  'isActive_ASC' |
  'isActive_DESC' |
  'email_ASC' |
  'email_DESC' |
  'mobile_ASC' |
  'mobile_DESC' |
  'firstLoginTime_ASC' |
  'firstLoginTime_DESC' |
  'lastLoginTime_ASC' |
  'lastLoginTime_DESC' |
  'departmentId_ASC' |
  'departmentId_DESC' |
  'organizationId_ASC' |
  'organizationId_DESC' |
  'platformId_ASC' |
  'platformId_DESC'

export interface BaseWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
}

export interface BindRoleMenuInput {
  roleId: String
  menuIds: Array<String>
}

export interface BindRolePermissionInput {
  roleId: String
  permissionIds: Array<String>
}

export interface BindUserMenuInput {
  userId: String
  menuIds: Array<String>
}

export interface BindUserPermissionInput {
  userId: String
  permissionIds: Array<String>
}

export interface BindUserRoleInput {
  userId: String
  roleIds: Array<String>
}

export interface DepartmentCreateInput {
  departmentName: String
  location?: String | null
  departmentOrder?: Float | null
  supreiorId?: String | null
  organizationId?: String | null
}

export interface DepartmentUpdateInput {
  departmentName?: String | null
  location?: String | null
  departmentOrder?: Float | null
  supreiorId?: String | null
  organizationId?: String | null
}

export interface DepartmentWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  departmentName_eq?: String | null
  departmentName_contains?: String | null
  departmentName_startsWith?: String | null
  departmentName_endsWith?: String | null
  departmentName_in?: String[] | String | null
  location_eq?: String | null
  location_contains?: String | null
  location_startsWith?: String | null
  location_endsWith?: String | null
  location_in?: String[] | String | null
  departmentOrder_eq?: Float | null
  departmentOrder_gt?: Float | null
  departmentOrder_gte?: Float | null
  departmentOrder_lt?: Float | null
  departmentOrder_lte?: Float | null
  departmentOrder_in?: Int[] | Int | null
  supreiorId_eq?: ID_Input | null
  supreiorId_in?: ID_Output[] | ID_Output | null
  organizationId_eq?: ID_Input | null
  organizationId_in?: ID_Output[] | ID_Output | null
}

export interface DepartmentWhereUniqueInput {
  id: String
}

export interface MenuCreateInput {
  name: String
  code: String
  path: String
  icon: String
  order?: Float | null
  isCategory: MenuIsCategory
  remark?: String | null
  supreiorId?: String | null
  platformId?: String | null
}

export interface MenuRoleCreateInput {
  roleId: String
  menuId: String
}

export interface MenuRoleUpdateInput {
  roleId?: String | null
  menuId?: String | null
}

export interface MenuRoleWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  roleId_eq?: ID_Input | null
  roleId_in?: ID_Output[] | ID_Output | null
  menuId_eq?: ID_Input | null
  menuId_in?: ID_Output[] | ID_Output | null
}

export interface MenuRoleWhereUniqueInput {
  id: String
}

export interface MenuUpdateInput {
  name?: String | null
  code?: String | null
  path?: String | null
  icon?: String | null
  order?: Float | null
  isCategory?: MenuIsCategory | null
  remark?: String | null
  supreiorId?: String | null
  platformId?: String | null
}

export interface MenuUserCreateInput {
  userId: String
  menuId: String
}

export interface MenuUserUpdateInput {
  userId?: String | null
  menuId?: String | null
}

export interface MenuUserWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  userId_eq?: ID_Input | null
  userId_in?: ID_Output[] | ID_Output | null
  menuId_eq?: ID_Input | null
  menuId_in?: ID_Output[] | ID_Output | null
}

export interface MenuUserWhereUniqueInput {
  id: String
}

export interface MenuWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
  code_eq?: String | null
  code_contains?: String | null
  code_startsWith?: String | null
  code_endsWith?: String | null
  code_in?: String[] | String | null
  path_eq?: String | null
  path_contains?: String | null
  path_startsWith?: String | null
  path_endsWith?: String | null
  path_in?: String[] | String | null
  icon_eq?: String | null
  icon_contains?: String | null
  icon_startsWith?: String | null
  icon_endsWith?: String | null
  icon_in?: String[] | String | null
  order_eq?: Float | null
  order_gt?: Float | null
  order_gte?: Float | null
  order_lt?: Float | null
  order_lte?: Float | null
  order_in?: Int[] | Int | null
  isCategory_eq?: MenuIsCategory | null
  isCategory_in?: MenuIsCategory[] | MenuIsCategory | null
  remark_eq?: String | null
  remark_contains?: String | null
  remark_startsWith?: String | null
  remark_endsWith?: String | null
  remark_in?: String[] | String | null
  supreiorId_eq?: ID_Input | null
  supreiorId_in?: ID_Output[] | ID_Output | null
  platformId_eq?: ID_Input | null
  platformId_in?: ID_Output[] | ID_Output | null
}

export interface MenuWhereUniqueInput {
  id: String
}

export interface OrganizationCreateInput {
  organizeName: String
  location?: String | null
}

export interface OrganizationUpdateInput {
  organizeName?: String | null
  location?: String | null
}

export interface OrganizationWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  organizeName_eq?: String | null
  organizeName_contains?: String | null
  organizeName_startsWith?: String | null
  organizeName_endsWith?: String | null
  organizeName_in?: String[] | String | null
  location_eq?: String | null
  location_contains?: String | null
  location_startsWith?: String | null
  location_endsWith?: String | null
  location_in?: String[] | String | null
}

export interface OrganizationWhereUniqueInput {
  id: String
}

export interface PermissionCreateInput {
  name: String
  code: String
  isCategory: PermissionIsCategory
  isGlobal: PermissionIsGlobal
  remark?: String | null
  supreiorId?: String | null
  platformId?: String | null
}

export interface PermissionRoleCreateInput {
  roleId: String
  permissionId: String
}

export interface PermissionRoleUpdateInput {
  roleId?: String | null
  permissionId?: String | null
}

export interface PermissionRoleWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  roleId_eq?: ID_Input | null
  roleId_in?: ID_Output[] | ID_Output | null
  permissionId_eq?: ID_Input | null
  permissionId_in?: ID_Output[] | ID_Output | null
}

export interface PermissionRoleWhereUniqueInput {
  id: String
}

export interface PermissionUpdateInput {
  name?: String | null
  code?: String | null
  isCategory?: PermissionIsCategory | null
  isGlobal?: PermissionIsGlobal | null
  remark?: String | null
  supreiorId?: String | null
  platformId?: String | null
}

export interface PermissionUserCreateInput {
  userId: String
  permissionId: String
}

export interface PermissionUserUpdateInput {
  userId?: String | null
  permissionId?: String | null
}

export interface PermissionUserWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  userId_eq?: ID_Input | null
  userId_in?: ID_Output[] | ID_Output | null
  permissionId_eq?: ID_Input | null
  permissionId_in?: ID_Output[] | ID_Output | null
}

export interface PermissionUserWhereUniqueInput {
  id: String
}

export interface PermissionWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  name_eq?: String | null
  name_contains?: String | null
  name_startsWith?: String | null
  name_endsWith?: String | null
  name_in?: String[] | String | null
  code_eq?: String | null
  code_contains?: String | null
  code_startsWith?: String | null
  code_endsWith?: String | null
  code_in?: String[] | String | null
  isCategory_eq?: PermissionIsCategory | null
  isCategory_in?: PermissionIsCategory[] | PermissionIsCategory | null
  isGlobal_eq?: PermissionIsGlobal | null
  isGlobal_in?: PermissionIsGlobal[] | PermissionIsGlobal | null
  remark_eq?: String | null
  remark_contains?: String | null
  remark_startsWith?: String | null
  remark_endsWith?: String | null
  remark_in?: String[] | String | null
  supreiorId_eq?: ID_Input | null
  supreiorId_in?: ID_Output[] | ID_Output | null
  platformId_eq?: ID_Input | null
  platformId_in?: ID_Output[] | ID_Output | null
}

export interface PermissionWhereUniqueInput {
  id: String
}

export interface PlatformCreateInput {
  platformName: String
  platformDesc: String
}

export interface PlatformUpdateInput {
  platformName?: String | null
  platformDesc?: String | null
}

export interface PlatformWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  platformName_eq?: String | null
  platformName_contains?: String | null
  platformName_startsWith?: String | null
  platformName_endsWith?: String | null
  platformName_in?: String[] | String | null
  platformDesc_eq?: String | null
  platformDesc_contains?: String | null
  platformDesc_startsWith?: String | null
  platformDesc_endsWith?: String | null
  platformDesc_in?: String[] | String | null
}

export interface PlatformWhereUniqueInput {
  id: String
}

export interface RoleCreateInput {
  roleName: String
  roleCode: String
  remark?: String | null
  platformId?: String | null
}

export interface RoleUpdateInput {
  roleName?: String | null
  roleCode?: String | null
  remark?: String | null
  platformId?: String | null
}

export interface RoleUserCreateInput {
  userId: String
  roleId: String
}

export interface RoleUserUpdateInput {
  userId?: String | null
  roleId?: String | null
}

export interface RoleUserWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  userId_eq?: ID_Input | null
  userId_in?: ID_Output[] | ID_Output | null
  roleId_eq?: ID_Input | null
  roleId_in?: ID_Output[] | ID_Output | null
}

export interface RoleUserWhereUniqueInput {
  id: String
}

export interface RoleWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  roleName_eq?: String | null
  roleName_contains?: String | null
  roleName_startsWith?: String | null
  roleName_endsWith?: String | null
  roleName_in?: String[] | String | null
  roleCode_eq?: String | null
  roleCode_contains?: String | null
  roleCode_startsWith?: String | null
  roleCode_endsWith?: String | null
  roleCode_in?: String[] | String | null
  remark_eq?: String | null
  remark_contains?: String | null
  remark_startsWith?: String | null
  remark_endsWith?: String | null
  remark_in?: String[] | String | null
  platformId_eq?: ID_Input | null
  platformId_in?: ID_Output[] | ID_Output | null
}

export interface RoleWhereUniqueInput {
  id: String
}

export interface UserCreateInput {
  username: String
  password: String
  realname?: String | null
  nickname?: String | null
  gender: UserGender
  isSuperuser: UserIsSuperuser
  isStaff: UserIsStaff
  isActive: UserIsActive
  email?: String | null
  mobile?: String | null
  firstLoginTime?: DateTime | null
  lastLoginTime?: DateTime | null
  departmentId?: String | null
  organizationId?: String | null
  platformId?: String | null
}

export interface UserUpdateInput {
  username?: String | null
  password?: String | null
  realname?: String | null
  nickname?: String | null
  gender?: UserGender | null
  isSuperuser?: UserIsSuperuser | null
  isStaff?: UserIsStaff | null
  isActive?: UserIsActive | null
  email?: String | null
  mobile?: String | null
  firstLoginTime?: DateTime | null
  lastLoginTime?: DateTime | null
  departmentId?: String | null
  organizationId?: String | null
  platformId?: String | null
}

export interface UserWhereInput {
  id_eq?: String | null
  id_in?: String[] | String | null
  createdAt_eq?: String | null
  createdAt_lt?: String | null
  createdAt_lte?: String | null
  createdAt_gt?: String | null
  createdAt_gte?: String | null
  createdById_eq?: String | null
  updatedAt_eq?: String | null
  updatedAt_lt?: String | null
  updatedAt_lte?: String | null
  updatedAt_gt?: String | null
  updatedAt_gte?: String | null
  updatedById_eq?: String | null
  deletedAt_all?: Boolean | null
  deletedAt_eq?: String | null
  deletedAt_lt?: String | null
  deletedAt_lte?: String | null
  deletedAt_gt?: String | null
  deletedAt_gte?: String | null
  deletedById_eq?: String | null
  username_eq?: String | null
  username_contains?: String | null
  username_startsWith?: String | null
  username_endsWith?: String | null
  username_in?: String[] | String | null
  password_eq?: String | null
  password_contains?: String | null
  password_startsWith?: String | null
  password_endsWith?: String | null
  password_in?: String[] | String | null
  realname_eq?: String | null
  realname_contains?: String | null
  realname_startsWith?: String | null
  realname_endsWith?: String | null
  realname_in?: String[] | String | null
  nickname_eq?: String | null
  nickname_contains?: String | null
  nickname_startsWith?: String | null
  nickname_endsWith?: String | null
  nickname_in?: String[] | String | null
  gender_eq?: UserGender | null
  gender_in?: UserGender[] | UserGender | null
  isSuperuser_eq?: UserIsSuperuser | null
  isSuperuser_in?: UserIsSuperuser[] | UserIsSuperuser | null
  isStaff_eq?: UserIsStaff | null
  isStaff_in?: UserIsStaff[] | UserIsStaff | null
  isActive_eq?: UserIsActive | null
  isActive_in?: UserIsActive[] | UserIsActive | null
  email_eq?: String | null
  email_contains?: String | null
  email_startsWith?: String | null
  email_endsWith?: String | null
  email_in?: String[] | String | null
  mobile_eq?: String | null
  mobile_contains?: String | null
  mobile_startsWith?: String | null
  mobile_endsWith?: String | null
  mobile_in?: String[] | String | null
  firstLoginTime_gt?: DateTime | null
  firstLoginTime_gte?: DateTime | null
  firstLoginTime_lt?: DateTime | null
  firstLoginTime_lte?: DateTime | null
  lastLoginTime_gt?: DateTime | null
  lastLoginTime_gte?: DateTime | null
  lastLoginTime_lt?: DateTime | null
  lastLoginTime_lte?: DateTime | null
  departmentId_eq?: ID_Input | null
  departmentId_in?: ID_Output[] | ID_Output | null
  organizationId_eq?: ID_Input | null
  organizationId_in?: ID_Output[] | ID_Output | null
  platformId_eq?: ID_Input | null
  platformId_in?: ID_Output[] | ID_Output | null
}

export interface UserWhereUniqueInput {
  id?: String | null
  username?: String | null
  email?: String | null
}

export interface BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface DeleteResponse {
  id: ID_Output
}

export interface BaseModel extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface BaseModelUUID extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
}

export interface Department extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  departmentName: String
  location?: String | null
  departmentOrder?: Int | null
  supreior?: Department | null
  supreiorId?: String | null
  organization?: Organization | null
  organizationId?: String | null
}

/*
 * 部门列表视图

 */
export interface DepartmentList {
  rows: Array<Department>
  count: Int
}

export interface Menu extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  name: String
  code: String
  path: String
  icon: String
  order?: Int | null
  isCategory?: MenuIsCategory | null
  remark?: String | null
  supreior?: Menu | null
  supreiorId?: String | null
  platform?: Platform | null
  platformId?: String | null
  menuUsers?: Array<MenuUser> | null
  menuRoles?: Array<MenuRole> | null
}

/*
 * 菜单列表视图

 */
export interface MenuList {
  rows: Array<Menu>
  count: Int
}

export interface MenuRole extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  role?: Role | null
  roleId: String
  menu?: Menu | null
  menuId: String
}

export interface MenuUser extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  user?: User | null
  userId: String
  menu?: Menu | null
  menuId: String
}

export interface Organization extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  organizeName: String
  location?: String | null
}

/*
 * 机构列表视图

 */
export interface OrganizationList {
  rows: Array<Organization>
  count: Int
}

export interface Permission extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  name: String
  code: String
  isCategory?: PermissionIsCategory | null
  isGlobal?: PermissionIsGlobal | null
  remark?: String | null
  supreior?: Permission | null
  supreiorId?: String | null
  platform?: Platform | null
  platformId?: String | null
  permissionUsers?: Array<PermissionUser> | null
  permissionRoles?: Array<PermissionRole> | null
}

/*
 * 权限列表视图

 */
export interface PermissionList {
  rows: Array<Permission>
  count: Int
}

export interface PermissionRole extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  role?: Role | null
  roleId: String
  permission?: Permission | null
  permissionId: String
}

export interface PermissionUser extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  user?: User | null
  userId: String
  permission?: Permission | null
  permissionId: String
}

export interface Platform extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  platformName: String
  platformDesc: String
}

/*
 * 平台列表视图

 */
export interface PlatformList {
  rows: Array<Platform>
  count: Int
}

export interface Role extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  roleName: String
  roleCode: String
  remark?: String | null
  platform?: Platform | null
  platformId?: String | null
  permissionRoles?: Array<PermissionRole> | null
  roleUsers?: Array<RoleUser> | null
}

/*
 * 角色列表视图

 */
export interface RoleList {
  rows: Array<Role>
  count: Int
}

export interface RoleUser extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  user?: User | null
  userId: String
  role?: Role | null
  roleId: String
}

export interface StandardDeleteResponse {
  id: ID_Output
}

export interface User extends BaseGraphQLObject {
  id: ID_Output
  createdAt: DateTime
  createdById: String
  updatedAt?: DateTime | null
  updatedById?: String | null
  deletedAt?: DateTime | null
  deletedById?: String | null
  version: Int
  username: String
  realname?: String | null
  nickname?: String | null
  gender?: UserGender | null
  isSuperuser?: UserIsSuperuser | null
  isStaff?: UserIsStaff | null
  isActive?: UserIsActive | null
  email: String
  mobile?: String | null
  firstLoginTime?: DateTime | null
  lastLoginTime?: DateTime | null
  department?: Department | null
  departmentId?: String | null
  organization?: Organization | null
  organizationId?: String | null
  platform?: Platform | null
  platformId?: String | null
  permissionUsers?: Array<PermissionUser> | null
  roleUsers?: Array<RoleUser> | null
}

/*
 * 用户列表列表视图

 */
export interface UserList {
  rows: Array<User>
  count: Int
}

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The javascript `Date` as string. Type represents date and time as the ISO Date string.
*/
export type DateTime = Date | string

/*
The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).
*/
export type Float = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.
*/
export type Int = number

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string