import * as React from "react";
import * as ReactDOM from "react-dom";
import {UserModel} from "./src/models/UserModel";
import {Admin, Login, LoginForm, MenuModel, OnLockChanged} from "hefang-ui-react-admin";
import {ApiResult, Dialog, getLocalStorage, setLocalStorage, setSessionStorage, Toast} from "hefang-ui-react";
import {md5, sha1} from "hefang-js";
import {Password} from "./src/pages/profile/Password";
import {Api} from "./src/urls";
import {getJSON, post} from "./src/functions";
import "./src/common.css"

let menus: MenuModel[] = getLocalStorage("functions", [])
    , pollingTimer = null;

function renderAdmin(json: ApiResult<UserModel>) {
    if (!json.result.isAdmin) {
        doLogOut();
        Dialog.alert("您不是管理员, 无法进入该页面", {
            icon: 'exclamation-triangle',
            title: '您没有该权限'
        });
        return;
    }
    pollingTimer = setInterval(polling, 10000);
    ReactDOM.render(
        <Admin user={json.result}
               menus={menus}
               onSignOut={doLogOut}
               onCleanCache={(data) => {
                   json.result.isSuperAdmin && getJSON(Api.cleanCache, (res: ApiResult<string>) => {
                       if (res.success) {
                           Toast.success();
                       }
                   })
               }}
               onLockChanged={doScreenLock}
               brand={<a href="/" className='brand' target='_blank'>何方博客后台管理</a>}
               onProfileClick={showChangePasswordDialog}/>, document.body
    )
}

function polling() {
    getJSON(Api.polling, {
        nocache: Math.random()
    }, (res) => {
        if (!res.success) {
            clearInterval(pollingTimer);
            return;
        }

    });
}

function showChangePasswordDialog() {
    window['changePasswordDialog'] = Dialog.show({
        content: <Password/>,
        mask: true,
        height: 370,
        width: 380,
        maximizable: false,
        title: '修改密码',
        icon: 'key'
    });
}

function renderLogin() {
    ReactDOM.render(<Login type={"page"} onSubmit={doLogin} footer={<div>
        Powered By <a href="https://github.com/iamhefang/php-mvc" target='_blank'>php-mvc</a>,
        <a href="https://github.com/iamhefang/hefang-ui-react-admin" target='_blank'>hefang-ui</a>
    </div>}/>, document.body);
}

function doLogOut() {
    getJSON(Api.userLogOut, () => location.reload())
}

function doScreenLock(onChange: OnLockChanged) {
    const {lock, password, onResult} = onChange;
    if (lock) {
        if (!password) {
            onResult(lock, '请输入登录密码解锁');
            return;
        }
        if (password.length < 6) {
            onResult(lock, '密码错误');
            return;
        }
        post(Api.screenUnLock, {
            pwd: sha1(password) + md5(password)
        }, (res: ApiResult<string>) => {
            onResult(!res.success, res.success ? ' ' : res.result);
        })
    } else {
        getJSON(Api.screenLock, (res: ApiResult<string>) => {
            if (res) {
                onResult(true, '  ')
            } else {
                Toast.show(res.result)
            }
        })
    }
}

function doLogin(form: LoginForm) {
    const {name, password} = form;
    if (!name) {
        Toast.show("请输入登录名")
    } else if (!password) {
        Toast.show("请输入密码")
    } else if (name.length < 4 || password.length < 6) {
        Toast.show("用户名密码不匹配")
    } else {
        Toast.loading('登录中...');
        post(Api.userLogIn, {
            name, pwd: sha1(password) + md5(password)
        }, (res: ApiResult<UserModel>) => {
            if (res.success) {
                if (!res.result.isAdmin) {
                    doLogOut();
                    Dialog.alert("您不是管理员, 无法进入该页面", {
                        icon: 'exclamation-triangle',
                        title: '您没有该权限'
                    });
                    return;
                }
                Toast.success("正在跳转");
                setTimeout(function () {
                    location.reload();
                }, 500)
            } else {
                Toast.show(res.result)
            }
        })
    }
}

getJSON(Api.userInfo, (json: ApiResult<string | UserModel>) => {
    if (json.success) {
        setSessionStorage('currentLogin', json.result);
        getJSON(Api.userFunctions, (res: ApiResult<MenuModel[]>) => {
            if (res.success) {
                menus = res.result;
                setLocalStorage("functions", menus);
                renderAdmin(json as ApiResult<UserModel>)
            } else {
                Toast.show(res.result)
            }
        })
    } else {
        renderLogin();
    }
});