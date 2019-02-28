import * as React from "react";
import * as ReactDOM from "react-dom";
import {getJSON, post} from "../../functions";
import {Api} from "../../urls";
import {ApiResult, PagerResult, queryObject, SwitchBox, Toast} from "hefang-ui-react";
import {ConfigModel} from "../../models/ConfigModel";
import "./Settings.css"
import {extend, isEmptyObject} from "hefang-js";
import {ConfigCheckBoxAttr} from "../../models/ConfigCheckBoxAttr";
import {ConfigTextareaConfig} from "../../models/ConfigTextareaConfig";
import {AdminActions} from "hefang-ui-react-admin";

const adminActions: AdminActions = top['adminActions'];

function parseBoolean(value: any): boolean {
    return !(value === false || !value || value === "false");
}

export interface SettingsState {
    settings: ConfigModel[]
    kvs: { [key: string]: any }
}

export interface SettingsProps {

}

export interface UeEditorEvents {
    selector: string
    option: UE.UeOption
    value: string
}

export class Settings extends React.Component<SettingsProps, SettingsState> {
    static readonly defaultProps: SettingsProps = {};
    private changedValues: { [key: string]: any } = {};
    private oldValues: { [key: string]: any } = {};
    private editors: { [key: string]: UE.Editor } = {};
    private editorEvents: UeEditorEvents[] = [];

    constructor(props: SettingsProps) {
        super(props);
        this.state = {
            settings: [],
            kvs: {}
        };
    }


    componentDidMount() {
        window.addEventListener('beforeunload', (e) => {
            if (!isEmptyObject(this.changedValues)) {
                e.returnValue = '设置还未保存';
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        });
        this.fetchData();
    }

    private fetchData = () => {
        this.changedValues = {};
        getJSON(Api.settingList, {
            cateId: queryObject('cate')
        }, (res: PagerResult<ConfigModel>) => {
            if (res.success) {
                const kvs = {};
                res.result.data.forEach(item => {
                    kvs[item.cate + '|' + item.key] = item.value;
                    this.oldValues[item.cate + '|' + item.key] = item.value;
                });
                this.setState({
                    kvs,
                    settings: res.result.data
                }, () => {
                    this.editorEvents.forEach(e => {
                        const editor = UE.getEditor(e.selector, e.option);
                        editor.ready(() => {
                            editor.setContent(e.value)
                        });
                        editor.addListener('contentChange', () => {
                            this.onValueChanged(e.selector, editor.getContent())
                        });
                        this.editors[e.selector] = editor;
                    })
                });
            } else {
                Toast.show(res.result)
            }
        });
    };


    private doSubmit = () => {
        adminActions.confirm("确定要保存更改的配置项吗?", () => {
            const loading = adminActions.loading();
            post(Api.configUpdate, {
                data: this.changedValues
            }, (res: ApiResult<string>) => {
                loading.close();
                if (res.success) {
                    this.fetchData();
                    adminActions.success();
                } else {
                    adminActions.toast(res.result)
                }
            })
        });
    };

    private onValueChanged = (name: string, value: any) => {
        const {kvs} = this.state;
        kvs[name] = value;
        if (value == this.oldValues[name]) {
            delete this.changedValues[name];
        } else {
            this.changedValues[name] = value;
        }
        this.setState({kvs})
    };

    private renderSettingItem = (config: ConfigModel) => {
        const type = config.type.toLowerCase()
            , name = config.cate + '|' + config.key
            , value = this.state.kvs[name];

        if (config.dependKey && !this.state.kvs[config.cate + '|' + config.dependKey]) {
            return undefined;
        }

        switch (type) {
            case 'int':
            case 'float':
                return <div className="form-group">
                    <label htmlFor={name}
                           className={config.canBeNull ? undefined : 'not-empty'}>{config.name}</label>
                    <input type="number" className="hui-input display-block"
                           id={name} min={config.min || undefined} max={config.max || undefined}
                           placeholder={config.placeholder} value={value}
                           onChange={e => this.onValueChanged(name, +e.currentTarget.value)}/>
                </div>;
            case 'bool':
                return <table className="hui-table form-group" style={{width: '100%'}}>
                    <tbody>
                    <tr>
                        <td>{config.name}</td>
                        <td className='text-right'>
                            <SwitchBox type={"primary"} on={parseBoolean(value)}
                                       onChange={on => this.onValueChanged(name, on)}/>
                        </td>
                    </tr>
                    </tbody>
                </table>;
            case 'string':
                const rows = config.attribute ? (config.attribute as ConfigTextareaConfig).rows : 3;
                return <div className="form-group">
                    <label htmlFor={name}
                           className={config.canBeNull ? undefined : 'not-empty'}>{config.name}</label>
                    <textarea className="hui-input no-resize display-block"
                              id={name} maxLength={config.maxLength || undefined}
                              placeholder={config.placeholder} rows={rows}
                              value={value}
                              onChange={e => this.onValueChanged(name, e.currentTarget.value)}/>
                </div>;
            case "checkbox":
                const checkBoxAttrs: ConfigCheckBoxAttr[] = config.attribute
                    , val = (value + "").split('')
                    , checkBoxObj = {};
                val.forEach(v => {
                    checkBoxObj[v] = true;
                });
                return <div className="form-group">
                    <label>{config.name}</label>
                    <div className="hui-input">
                        {checkBoxAttrs.map(a => <label className="no-select" style={{marginLeft: '.5rem'}}>
                            <input type='checkbox' name={name}
                                   onChange={e => {
                                       if (e.currentTarget.checked) {
                                           checkBoxObj[a.value] = true;
                                       } else {
                                           delete checkBoxObj[a.value];
                                       }
                                       this.onValueChanged(name, Object.keys(checkBoxObj).join(''))
                                   }}
                                   value={a.value} checked={a.value in checkBoxObj}/> {a.name}
                        </label>)}
                    </div>
                </div>;
            case "radio":
                const attr: ConfigCheckBoxAttr[] = config.attribute;
                return <div className="form-group">
                    <label>{config.name}</label>
                    <div className="hui-input">
                        {attr.map(a => <label className='no-select' style={{marginLeft: '.5rem'}}>
                            <input type="radio" name={name} onChange={e => {
                                this.onValueChanged(name, a.value);
                            }} checked={a.value === value}/> {a.name}
                        </label>)}
                    </div>
                </div>;
            case "html":
                if (!(config.name in this.editors)) {
                    this.editorEvents.push({
                        selector: name,
                        option: extend(true, {
                            toolbars: [[
                                'source', '|', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset'
                            ]],
                            maximumWords: config.maxLength || 1000,
                            initialFrameWidth: '100%'
                        }, config.attribute),
                        value: config.value
                    });
                }
                return <div className="form-group">
                    <label>{config.name}</label>
                    <textarea id={name} rows={8} className='display-block'/>
                </div>;
            default:
                return <div className="form-group">
                    <label htmlFor={name}
                           className={config.canBeNull ? undefined : 'not-empty'}>{config.name}</label>
                    <input type="text" className="hui-input display-block"
                           id={name} maxLength={config.maxLength || undefined}
                           placeholder={config.placeholder}
                           value={value}
                           onChange={e => this.onValueChanged(name, e.currentTarget.value)}/>
                </div>;

        }
    };

    render() {
        return <div className="container">
            {this.state.settings.map(this.renderSettingItem)}
            <div className="btn-container">
                <button className="hui-btn-primary" disabled={isEmptyObject(this.changedValues)}
                        onClick={this.doSubmit}>提交
                </button>
            </div>
        </div>
    }
}

// if ("adminOperater" in window) {
ReactDOM.render(<Settings/>, document.body);
// } else {
//     window.addEventListener("JsInterfaceReady", () =>
//         ReactDOM.render(<Settings/>, document.getElementById("container"))
//     );
// }