import {BaseUserModel} from "hefang-ui-react-admin";

export interface UserModel extends BaseUserModel {
    password?: string
    roleId?: string
    lastLoginIp?: string
    lastLoginTime?: number
    phone?: string
    openId?: string
    nickName?: string
    headImgUrl?: string
    loginIp?: string
    loginName?: string
    loginTime?: string
    loginUserAgent?: string
}