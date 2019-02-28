import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    ApiResult,
    Icon,
    Pager,
    PagerModel,
    PagerResult,
    QrCode,
    SqlSort,
    Table,
    TableColumn,
    Toast
} from "hefang-ui-react";
import {getJSON, intent, post} from "../../functions";
import {Api, Url} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {extend} from "hefang-js";
import {ListParams} from "../../models/ListParams";
import {ThemeModel} from "../../models/ThemeModel";

declare const adminActions: AdminActions;

export interface ThemeListProps {

}

export interface ThemeListState extends PagerModel<ThemeModel> {
    sort: SqlSort
    selected: string[]
}

export class ThemeList extends React.Component<ThemeListProps, ThemeListState> {
    constructor(props: ThemeListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            sort: {key: null, type: null},
            selected: [],
        };
    }

    private fetchData = (params: ListParams = null) => {
        params = extend(true, {
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            sort: this.state.sort,
        }, params);
        const loading = Toast.loading();
        const {pageIndex, pageSize, sort} = params;
        getJSON(Api.themeList, {
            pageIndex, pageSize,
            sortKey: sort.key || "",
            sortType: sort.type || "",
        }, (res: PagerResult<ThemeModel>) => {
            loading.close();
            if (res.success) {
                const {pageIndex, pageSize, total, data} = res.result;
                this.setState({
                    pageIndex, pageSize, total, data, sort
                })
            } else {
                adminActions.toast(res.result)
            }
        })
    };

    private insertOrUpdateItem = (model: ThemeModel = null) => {
        adminActions.toast('主题市场开发中......')
    };
    private showSettings = (m: ThemeModel) => {
        adminActions.window(`settings.html?cate=theme_settings_${m.id}`, {
            width: 400,
            height: 600,
            minWidth: 400,
            minHeight: 400,
            title: '主题设置',
            mask: true,
            maximizable: false,
            onClosed: (data: any) => {
                this.fetchData()
            }
        })
    };
    private showQrCode = (m: ThemeModel) => {
        const url = `${location.protocol}//${location.host}${Url.base}/url/${m.id}`;
        adminActions.alert(<div className='text-center'>
            <QrCode content={url}/>
        </div>, {
            width: 140, height: 250, title: '二维码', icon: 'qrcode'
        })
    };

    private renderEmptyChildren = () => {
        if (this.state.data === null) {
            return "数据加载中"
        } else {
            return "暂无数据"
        }
    };
    private setCurrentTheme = (m: ThemeModel) => {
        if (m.current) {
            adminActions.toast("该主题已是当前主题");
            return;
        }
        adminActions.confirm(`确定要设置主题"${m.name}"为当前主题吗?`, "确定吗?", () => {
            const loading = adminActions.loading();
            post(Api.configUpdate, {data: {"system|theme": m.id}}, (res: ApiResult<string>) => {
                loading.close();
                if (res.success) {
                    this.fetchData();
                    adminActions.success();
                } else {
                    adminActions.toast(res.result)
                }
            })
        }, {icon: 'palette'});
    };
    private deleteItem = (ids: string[]) => {
        adminActions.confirm(
            `您正在删除"${ids.length}个数据`,
            "确定要删除吗?", () => {
                post(Api.urlDelete, {
                    id: ids
                }, (res: ApiResult<string>) => {
                    if (res.success) {
                        adminActions.success();
                        this.fetchData()
                    } else {
                        adminActions.toast(res.result)
                    }
                })
            })
    };

    componentDidMount() {
        this.fetchData();
    }

    private renderFooter = () => {
        return <Pager pageIndex={this.state.pageIndex}
                      pageSize={this.state.pageSize}
                      total={this.state.total}
                      onChange={(pageIndex, pageSize) => this.fetchData({pageIndex, pageSize})}/>;
    };

    render() {
        return <div className="list-page display-flex-column">
            <div className='list-actions'>
                <button className="hui-btn hui-btn-primary float-right"
                        onClick={e => this.insertOrUpdateItem()}>
                    主题市场
                </button>
                <button className="hui-btn hui-btn-danger float-right"
                        disabled={this.state.selected.length === 0}
                        onClick={e => this.deleteItem(this.state.selected)}>
                    删除
                </button>
            </div>
            <Table data={this.state.data || []}
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   footer={this.renderFooter()}
                   header={"fixed"}
                   className='flex-1 display-flex-column'
                   onSort={sort => this.fetchData({sort})}
                   selected={this.state.selected}
                   onSelected={selected => {
                       this.setState({selected});
                       return false;
                   }}
                   selectable={true}>
                <TableColumn title={''} field={(m: ThemeModel) => {
                    return <img src={m.cover} width={'6rem'}/>
                }} width={'6rem'} align={"center"}/>
                <TableColumn title={'名称'} field={'name'}/>
                <TableColumn title={'关键字'} field={(m: ThemeModel) => {
                    return m.keywords.join(', ')
                }}/>
                <TableColumn title={'作者'} field={(m: ThemeModel) => {
                    return <>
                        <div>作者: {m.author.name || '某网友'}</div>
                        <div>
                            主页: {m.author.blog ? <a href={m.author.blog} target='_blank'>{m.author.blog}</a> : '无'}
                        </div>
                        <div>
                            邮箱: {(m.author.email || '').indexOf('@') > -1 ? <a onClick={e => {
                            adminActions.confirm(`确定要发邮件给"${m.author.email}"吗?`, () => {
                                adminActions.toast("正在启动邮箱应用");
                                intent(`mailto:${m.author.email}`)
                            })
                        }} href="javascript:;">{m.author.email}</a> : '无'}
                        </div>
                    </>
                }}/>
                <TableColumn title={'版本'} field={(m: ThemeModel) => {
                    return <>{m.version} | <a href="javascript:;" title='更新至2.0.1'>更新</a></>
                }} align={"center"} width={"6rem"}/>
                <TableColumn title={'操作'} field={(m: ThemeModel, doExpand) => {
                    return <>
                        {m.configs.length > 0 ? <button className="no-background no-border"
                                                        title='显示设置项'
                                                        onClick={e => this.showSettings(m)}>
                            <Icon name='cog'/>
                        </button> : undefined}
                        <button className="no-background no-border" onClick={e => {
                            doExpand(<div dangerouslySetInnerHTML={{__html: m.description}}/>);
                        }}>
                            <Icon name='info-circle'/>
                        </button>
                        <button className="no-border no-background" onClick={e => this.setCurrentTheme(m)}>
                            {m.current ? <Icon name={'check-circle'} style={{color: 'green'}}/> :
                                <Icon name={'circle'}/>}
                        </button>
                    </>
                }} width={'6rem'} align={"center"}/>
            </Table>
        </div>
    }
}


ReactDOM.render(<ThemeList/>, document.body);