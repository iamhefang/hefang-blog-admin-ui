import * as React from 'react';
import * as ReactDOM from "react-dom"
import {ApiResult, DialogOperater, queryObject, Toast} from "hefang-ui-react";
import {getJSON, post} from "../../functions";
import {Api} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";

declare const dialogOperater: DialogOperater;
declare const adminActions: AdminActions;

export interface PhoneState {
    phone: string
    code: string
    timer: number
}

export interface PhoneProps {

}

const loginId = queryObject('id');


export class Phone extends React.Component<PhoneProps, PhoneState> {
    constructor(props: PhoneProps) {
        super(props);
        this.state = {
            phone: '',
            code: '',
            timer: 0
        };
    }

    private doCommit = () => {
        const {phone, code} = this.state;
        if (!phone || phone.length !== 11) {
            Toast.show("请输入11位手机号");
            return;
        }

        if (!code) {
            Toast.show("请输入验证码");
            return;
        }

        if (code.length !== 6) {
            Toast.show("验证码错误");
            return;
        }

        post(Api.userChangePhone, {
            loginId, code, phone
        }, (res: ApiResult<string>) => {
            if (res.success) {
                adminActions.success();
                setTimeout(() => {
                    dialogOperater.close("ok")
                }, 1000)
            } else {
                adminActions.toast(res.result)
            }
        })
    };
    private fetchCode = () => {
        const {phone} = this.state;
        if (!phone || phone.length !== 11) {
            Toast.show("请输入11位手机号");
            return;
        }
        getJSON(Api.sendCode, {
            phone
        }, (res: ApiResult<string>) => {
            if (res.success) {
                this.setState({timer: 60});
                const timerId = setInterval(() => {
                    const timer = this.state.timer - 1;
                    this.setState({timer});
                    if (timer <= 0) {
                        clearInterval(timerId)
                    }
                }, 1000)
            } else {
                Toast.show(res.result)
            }
        })
    };

    render() {
        return <div>
            <div style={{padding: '1rem', boxSizing: 'border-box'}}>
                <div className="form-group">
                    <label htmlFor="phone">手机号</label>
                    <input type="tel" className="hui-input display-block" id="phone"
                           maxLength={11} value={this.state.phone}
                           onChange={e => this.setState({phone: e.currentTarget.value})}/>
                </div>
                <div className="form-group">
                    <label htmlFor="code">验证码</label>
                    <input type="text" className="hui-input display-block" id='code'
                           value={this.state.code}
                           onChange={e => this.setState({code: e.currentTarget.value})}/>
                </div>
                <button className='hui-btn-primary display-block'
                        onClick={this.fetchCode}>
                    {this.state.timer > 0 ? `请稍候(${this.state.timer})` : '获取验证码'}
                </button>
            </div>
            <div className="hui-dialog-footer">
                <button className="hui-btn-primary" onClick={this.doCommit}>确定</button>
            </div>
        </div>
    }
}

ReactDOM.render(<Phone/>, document.body);