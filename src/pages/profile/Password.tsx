import * as React from 'react';
import {ApiResult, DialogOperater, Toast} from "hefang-ui-react";
import {post} from "../../functions";
import {Api} from "../../urls";
import {md5, sha1} from "hefang-js";

export interface PasswordState {
    old: string
    password: string
    renew: string
}

export interface PasswordProps {

}

export class Password extends React.Component<PasswordProps, PasswordState> {
    constructor(props: PasswordProps) {
        super(props);
        this.state = {
            old: '', password: '', renew: ''
        };
    }

    private doCommit = () => {
        const {old, password, renew} = this.state;
        if (!old) {
            Toast.show("请输入老密码");
        } else if (!password) {
            Toast.show("请输入新密码");
        } else if (!renew) {
            Toast.show("请再输入一次新密码");
        } else if (password.length < 6) {
            Toast.show("请输入6位以上新密码");
        } else if (password !== renew) {
            Toast.show("两次输入密码不一致");
        } else if (old.length < 6) {
            Toast.show("老密码不正确");
        } else {
            const loading = Toast.loading();
            post(Api.userChangePassword, {
                old: sha1(old) + md5(old),
                pwd: sha1(password) + md5(password),
                renew: sha1(renew) + md5(renew)
            }, (res: ApiResult<string>) => {
                loading.close();
                if (res.success) {
                    Toast.success();
                    (window['changePasswordDialog'] as DialogOperater).close()
                } else {
                    Toast.show(res.result)
                }
            })
        }
    };

    render() {
        return <div>
            <div style={{padding: '1rem', boxSizing: 'border-box'}}>
                <div className="form-group">
                    <label htmlFor="old">老密码</label>
                    <input type="password" className="hui-input display-block" id='old'
                           value={this.state.old}
                           onChange={e => this.setState({old: e.currentTarget.value})}/>
                </div>
                <div className="form-group">
                    <label htmlFor="password">新密码</label>
                    <input type="password" className="hui-input display-block" id='password'
                           value={this.state.password}
                           onChange={e => this.setState({password: e.currentTarget.value})}/>
                </div>
                <div className="form-group">
                    <label htmlFor="renew">再输一次密码</label>
                    <input type="password" className="hui-input display-block" id='renew'
                           value={this.state.renew}
                           onChange={e => this.setState({renew: e.currentTarget.value})}/>
                </div>
            </div>
            <div className="hui-dialog-footer">
                <button className="hui-btn-primary" onClick={this.doCommit}>确定</button>
            </div>
        </div>
    }
}