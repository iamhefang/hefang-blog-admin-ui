import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    ApiResult,
    Icon,
    Pager,
    PagerModel,
    PagerResult,
    QrCode,
    queryObject,
    SqlSort,
    Table,
    TableColumn,
    Toast
} from "hefang-ui-react";
import {getJSON, post} from "../../functions";
import {Api, Url} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {extend, formatDate} from "hefang-js";
import {ListParams} from "../../models/ListParams";
import {UrlModel} from "../../models/UrlModel";

declare const adminActions: AdminActions;

export interface UrlListProps {

}

export interface UrlListState extends PagerModel<UrlModel> {
    sort: SqlSort
    selected: string[]
}

export class UrlList extends React.Component<UrlListProps, UrlListState> {
    constructor(props: UrlListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            sort: {key: null, type: null},
            selected: []
        };
    }

    private renderFooter = () => {
        return <Pager pageIndex={this.state.pageIndex}
                      pageSize={this.state.pageSize}
                      total={this.state.total}
                      onChange={(pageIndex, pageSize) => this.fetchData({pageIndex, pageSize})}/>;
    };
    private fetchData = (params: ListParams = null) => {
        params = extend(true, {
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            sort: this.state.sort,
        }, params);
        const loading = Toast.loading();
        const {pageIndex, pageSize, sort} = params;
        getJSON(Api.urlList, {
            pageIndex, pageSize,
            sortKey: sort.key || "",
            sortType: sort.type || "",
            type: queryObject('type')
        }, (res: PagerResult<UrlModel>) => {
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

    private insertOrUpdateItem = (model: UrlModel = null) => {
        adminActions.window(`urleditor.html?id=${model ? model.id : ''}`, {
            width: 400,
            height: 400,
            minWidth: 400,
            minHeight: 400,
            title: '添加/编辑文章',
            mask: true,
            maximizable: false,
            onClosed: (data: any) => {
                this.fetchData()
            }
        })
    };
    private showQrCode = (m: UrlModel) => {
        const url = `${location.protocol}//${location.host}${Url.base}/url/${m.id}`;
        adminActions.alert(<div className='text-center'>
            <QrCode content={url}/>
        </div>, {
            width: 140, height: 250, title: '手机扫码访问', icon: 'qrcode'
        })
    };

    private renderEmptyChildren = () => {
        if (this.state.data === null) {
            return "数据加载中"
        } else {
            return "暂无数据"
        }
    };

    private deleteItem = (ids: string[]) => {
        adminActions.confirm(
            `您正在删除"${ids.length}个数据`,
            "确定要删除吗?", () => {
                post(Api.urlDelete, {
                    id: ids
                }, (res: ApiResult<string>) => {
                    if (res.success) {
                        const obj = {};
                        this.state.selected.forEach(id => {
                            obj[id] = true;
                        });
                        ids.forEach(id => {
                            delete obj[id];
                        });
                        this.setState({selected: Object.keys(obj)});
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

    render() {
        return <div className="list-page display-flex-column">
            <div className='list-actions'>
                <button className="hui-btn hui-btn-primary float-right"
                        onClick={e => this.insertOrUpdateItem()}>
                    添加
                </button>
                {this.state.selected.length > 0 ?
                    <button className="hui-btn hui-btn-danger float-right"
                            onClick={e => this.deleteItem(this.state.selected)}>
                        删除({this.state.selected.length})
                    </button> : undefined}
            </div>
            <Table data={this.state.data || []}
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   onSort={sort => this.fetchData({sort})}
                   selected={this.state.selected}
                   footer={this.renderFooter()}
                   header={"fixed"}
                   className='flex-1 display-flex-column'
                   onSelected={selected => {
                       this.setState({selected});
                       console.log(selected);
                       return false;
                   }}
                   selectable={true}>

                <TableColumn title={'短连接'} field={(m: UrlModel) => {
                    const url = `${location.protocol}//${location.host}${Url.base}/url/${m.id}`;
                    return <a href={url} target='_blank'>{url}</a>
                }}/>
                <TableColumn title={'长连接'} field={
                    (m: UrlModel) => <a target='_blank'
                                        href={m.url}>{m.url.length > 30 ? m.url.substr(0, 30) : m.url}</a>}/>
                <TableColumn title={'访问次数'} field={'visitCount'} align={"center"} width={'6rem'} sort={'visit_count'}/>
                <TableColumn title={'一次性'} field={(m: UrlModel) => {
                    return m.disposable ? '是' : '否'
                }} align={"center"} width={'6rem'} sort={'disposable'}/>
                <TableColumn title={'有效期至'} field={(m: UrlModel) => {
                    return m.disposable ? '一次性' : (m.expiresIn ? formatDate(new Date(m.expiresIn)) : '永久')
                }} align={"center"} width={'6.5rem'} sort={'expires_in'}/>
                <TableColumn title={'操作'} field={(m: UrlModel) => {
                    return <>
                        <button className="no-background no-border" onClick={e => this.deleteItem[m.id]}>
                            <Icon name='trash-alt'/>
                        </button>
                        |
                        <button className="no-background no-border" onClick={e => this.insertOrUpdateItem(m)}>
                            <Icon name='edit'/>
                        </button>
                        |
                        <button className="no-background no-border" onClick={e => this.showQrCode(m)}>
                            <Icon name='qrcode'/>
                        </button>
                    </>
                }} align={"center"} width={'7rem'}/>
            </Table>
        </div>
    }
}


ReactDOM.render(<UrlList/>, document.body);