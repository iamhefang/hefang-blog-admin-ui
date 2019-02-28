import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {MainModel} from "../models/MainModel";
import {currentLogin, getJSON} from "../functions";
import {UserModel} from "../models/UserModel";
import {Api} from "../urls";
import {ApiResult, Toast} from "hefang-ui-react";

export interface MainProps {

}

export interface MainState extends MainModel {
}

export class Main extends React.Component<MainProps, MainState> {
    private user: UserModel = currentLogin();

    constructor(props: MainProps) {
        super(props);
        this.state = {
            articleCount: 0,
            articleNotEnableCount: 0,
            articleDraftCount: 0,
            pageCount: 0,
            pageNotEnableCount: 0,
            pageDraftCount: 0,
        };
    }

    private fetchArticleCount = () => {
        getJSON(Api.statisticsArticleCount, (res: ApiResult<MainModel>) => {
            if (res.success) {
                this.setState(res.result);
            } else {
                Toast.show(res.result)
            }
        })
    };

    componentDidMount() {
        this.fetchArticleCount();
    }

    render() {
        return <div className="">
            <p>您当前登录IP为: {this.user.loginIp}</p>
            <p>您当前登录时间: {this.user.loginTime}</p>
            <p>
                当前共有{this.state.articleCount}篇文章,
                其中草稿{this.state.articleDraftCount}篇,{this.state.articleNotEnableCount}篇已删除
            </p>
            <p>
                当前共有{this.state.pageCount}个页面,
                其中草稿{this.state.pageDraftCount}个,{this.state.pageNotEnableCount}个已删除
            </p>
        </div>
    }
}


ReactDOM.render(<Main/>, document.body);