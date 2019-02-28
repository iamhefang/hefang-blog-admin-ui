import * as React from "react";
import * as ReactDOM from "react-dom";
import {CategoryModel} from "../../models/CategoryModel";
import {ApiResult, DialogOperater, queryObject, Toast} from "hefang-ui-react";
import "../../common.css";
import {post} from "../../functions";
import {Api} from "../../urls";
import {extend} from "hefang-js";

declare const dialogOperater: DialogOperater;

export interface CategoryEditorState extends CategoryModel {

}

export interface CategoryEditorProps {

}

export class CategoryEditor extends React.Component<CategoryEditorProps, CategoryEditorState> {
    constructor(props: CategoryEditorProps) {
        super(props);
        this.state = extend(true, {}, {
            id: '',
            alias: '',
            name: '',
            description: '',
            type: queryObject("type", "category") as string,
            keywords: ''
        }, queryObject() as object);
    }

    private doCommit = () => {
        const loading = Toast.loading();
        post(queryObject("id") ? Api.categoryUpdate : Api.categoryInsert,
            this.state, (res: ApiResult<CategoryModel>) => {
                loading.close();
                if (res.success) {
                    Toast.success();
                    dialogOperater.close("ok");
                } else {
                    Toast.show(res.result)
                }
            })
    };

    render() {
        return <div>
            <div className="container">
                <div className="form-group">
                    <label htmlFor="name">名称</label>
                    <input type="text" id="name" className="hui-input display-block"
                           value={this.state.name}
                           onChange={e => this.setState({
                               name: e.currentTarget.value
                           })}/>
                </div>
                <div className="form-group">
                    <label htmlFor="keywords">关键字</label>
                    <textarea id="keywords" className="hui-input display-block no-resize" maxLength={120} rows={2}
                              value={this.state.keywords}
                              onChange={e => this.setState({
                                  keywords: e.currentTarget.value
                              })}/>
                </div>
                <div className="form-group">
                    <label htmlFor="description">描述</label>
                    <textarea id='description' className="hui-input display-block no-resize" maxLength={250} rows={4}
                              value={this.state.description}
                              onChange={e => this.setState({
                                  description: e.currentTarget.value
                              })}/>
                </div>
            </div>
            <div className="hui-dialog-footer">
                <button className='hui-btn-primary' onClick={this.doCommit}>提交</button>
            </div>
        </div>
    }
}

ReactDOM.render(<CategoryEditor/>, document.body);