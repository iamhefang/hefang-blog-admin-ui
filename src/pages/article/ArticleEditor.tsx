import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    ApiResult,
    DialogOperater,
    getLocalStorage,
    queryObject,
    setLocalStorage,
    SwitchBox,
    Toast
} from "hefang-ui-react";
import "../../common.css";
import {getJSON, post} from "../../functions";
import {Api} from "../../urls";
import "../commodity/editor.css";
import {ArticleModel} from "../../models/ArticleModel";
import {UeApiResult} from "../../models/UeApiResult";
import {TagsEditor} from "../../components/TagsEditor";
import {extend} from "hefang-js";
import {AdminActions} from "hefang-ui-react-admin";
import Editor = UE.Editor;

declare const dialogOperater: DialogOperater;

const adminActions: AdminActions = top['adminActions'];

export interface ArticleEditorState extends ArticleModel {

}

export interface ArticleEditorProps {

}

export type FieldType = "text" | "number" | "string" | "boolean";

function field(id: string, label: string, type: FieldType = 'text', isAttr: boolean = false): Field {
    return {id, type, label, isAttr}
}

export interface Field {
    id: string
    label: string
    type: FieldType,
    isAttr: boolean
}

const fields: Field[] = [
    field("title", '标题'),
    field("alias", "访问路径"),
    field('password', '密码'),
    field("keywords", '关键字', 'string'),
    field("description", '描述', 'string'),
];
const id = queryObject('id') as string
    , type = queryObject("type")
    , isInFunction = queryObject("function") === '1'
    , emptyState = {
    id: id,
    title: '',
    keywords: '',
    description: '',
    content: '',
    covers: [],
    tags: [],
    type
};

export class ArticleEditor extends React.Component<ArticleEditorProps, ArticleEditorState> {
    constructor(props: ArticleEditorProps) {
        super(props);
        this.state = id ? emptyState : extend(true, {}, emptyState, getLocalStorage("draft", {}));
    }

    private editor: Editor;

    componentDidMount() {
        ('dialogOperater' in window) && dialogOperater.data(true);
        window.addEventListener('beforeunload', (e) => {
            if (('dialogOperater' in window) && !dialogOperater.data()) {
                e.returnValue = "还未保存";
                e.stopPropagation();
                e.preventDefault();
                return "还未保存";
            }
        });
        this.editor = UE.getEditor("editor", {
            toolbars: [[
                'source', '|', 'undo', 'redo', '|',
                'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '| ', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|', 'insertcode', '|',
                'directionalityltr', 'directionalityrtl', 'indent', '|',
                'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
                'attachment', 'pagebreak ', 'background', '|', 'simpleupload', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'map', '|',
                'horizo​​ntal', 'date', 'time', 'spechars', '|',
                'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols ', '|', 'preview', 'searchreplace', 'drafts'
            ]],
            initialFrameHeight: window.innerHeight - 105,
            initialFrameWidth: '100%',
            zIndex: 1,
            initialContent: this.state.content || '文章详情',
            serverUrl: Api.uEditorUpload,
            autoHeightEnabled: false,
            iframeCssUrl: '//api.jueweikeji.com.cn/statics/ueditor/article.css'
        });
        this.editor.ready(() => {
            this.editor.setContent(this.state.content);
            const edui2 = document.getElementById("edui2")
                , edui1BottomBar = document.getElementById("edui1_bottombar")
                , onResize = () => {
                const height = window.innerHeight - 48 - edui2.scrollHeight - edui1BottomBar.scrollHeight - 6;
                this.editor.setHeight(height);
            };
            this.editor.addListener('contentChange', () => {
                this.state.id || setLocalStorage("draft", extend(true, {}, this.state, {content: this.editor.getContent()}));
                ('dialogOperater' in window) && dialogOperater.data(false);
            });
            window.addEventListener("resize", onResize);
            onResize();
            id && getJSON(Api.articleGet, {id}, (res: ApiResult<ArticleModel>) => {
                if (res.success) {
                    this.setState(res.result);
                    this.editor.setContent(res.result.content)
                } else {
                    Toast.show(res.result)
                }
            })
        })
    }

    private doCommit = (isDraft: boolean) => {
        const loading = Toast.loading()
            , {id, title, description, keywords, covers, tags, alias} = this.state;
        post(id ? Api.articleUpdate : Api.articleInsert, {
            id, title, description, keywords, covers, tags, alias, isDraft,
            content: this.editor.getContent()
        }, (res: ApiResult<ArticleModel>) => {
            loading.close();
            if (res.success) {
                if (('dialogOperater' in window) && id) {
                    dialogOperater.close(true);
                    return;
                }
                adminActions.confirm("要继续添加文章吗?", "文章添加成功", (operater) => {
                    this.setState({
                        id: '',
                        title: '',
                        keywords: '',
                        description: '',
                        alias: '',
                        content: '',
                        covers: [],
                        tags: []
                    });
                    this.editor.setContent('');
                });
                ('dialogOperater' in window) && dialogOperater.data(true);
                localStorage.removeItem('draft')
            } else {
                Toast.show(res.result)
            }
        })
    };

    private doUpload = (e) => {
        const input = e.currentTarget as HTMLInputElement
            , form = new FormData();
        form.append('upfile', input.files[0]);
        fetch(Api.uEditorUpload + '?action=uploadimage', {
            method: 'POST',
            credentials: "same-origin",
            body: form
        }).then(value => value.json())
            .then((res: UeApiResult) => {
                if (res.state !== 'SUCCESS') {
                    Toast.show(res.state);
                    return;
                }
                this.setState({
                    covers: [res.url]
                })
            })
    };

    private renderField = (field: Field) => {
        const value = this.state[field.id];
        if (field.type === "text" || field.type === "number") {
            return <div className="form-group">
                <label htmlFor={field.id}>{field.label}</label>
                <input type={field.type} id={field.id} className="hui-input display-block"
                       value={value || ''}
                       onChange={e => {
                           const obj = {};
                           obj[field.id] = e.currentTarget.value;
                           this.setState(obj);
                           ('dialogOperater' in window) && dialogOperater.data(false);
                       }}/>
            </div>
        }

        if (field.type === "string") {
            return <div className="form-group">
                <label htmlFor={field.id}>{field.label}</label>
                <textarea id={field.id} className="hui-input display-block no-resize"
                          rows={2} value={value || ''}
                          onChange={e => {
                              const obj = {};
                              obj[field.id] = e.currentTarget.value;
                              this.setState(obj);
                              ('dialogOperater' in window) && dialogOperater.data(false);
                          }}/>
            </div>
        }
        if (field.type === "boolean") {
            return <div className="form-group">
                <table>
                    <tbody>
                    <tr>
                        <td>{field.label}</td>
                        <td align={"right"}><SwitchBox type={"primary"} on={value === '是'} onChange={on => {
                            const obj = {};
                            obj[field.id] = on ? '是' : '否';
                            this.setState(obj);
                            ('dialogOperater' in window) && dialogOperater.data(false);
                        }}/></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        }
    };

    componentDidUpdate() {
        this.state.id || setLocalStorage("draft", extend(true, {}, this.state, {content: this.editor.getContent()}));
    }

    render() {
        return <div className="editor-container display-flex-row">
            <div className='editor flex-1'>
                <textarea id="editor"/>
            </div>
            <div className="editor-attrs">
                {type ? undefined : <div className="form-group">
                    <label htmlFor="type">类型</label>
                    <select value={this.state.type} className='hui-input display-block' id='type'
                            onChange={e => this.setState({type: e.currentTarget.value})}>
                        <option value="article">文章</option>
                        <option value="page">页面</option>
                    </select>
                </div>}
                {this.state.type === 'page' ? undefined : <div className="form-group">
                    <label className='image-uploader' style={{backgroundImage: `url(${this.state.covers[0]})`}}>
                        <input type="file" accept="image/*" onChange={this.doUpload}/>
                    </label>
                </div>}
                {fields.map(this.renderField)}
                {this.state.type === 'article' ? <div className="form-group">
                    <label>文章标签</label>
                    <TagsEditor value={this.state.tags} onChange={tags => this.setState({tags})}/>
                </div> : undefined}
            </div>
            <div className="hui-dialog-footer">
                <button className='hui-btn-primary' onClick={e => this.doCommit(true)}>保存草稿</button>
                <button className='hui-btn-success' onClick={e => this.doCommit(false)}>正在发表</button>
            </div>
        </div>
    }
}

ReactDOM.render(<ArticleEditor/>, document.body);