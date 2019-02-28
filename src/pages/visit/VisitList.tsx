import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    ApiResult,
    Icon,
    Pager,
    PagerModel,
    PagerResult,
    SqlSort,
    Table,
    TableColumn,
    TableDoExpand,
    Toast
} from "hefang-ui-react";
import {getJSON, post} from "../../functions";
import {Api} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {extend} from "hefang-js";
import {ListParams} from "../../models/ListParams";
import {VisitModel} from "../../models/VisitModel";

declare const adminActions: AdminActions;

export interface VisitListProps {

}

export interface VisitListState extends PagerModel<VisitModel> {
    sort: SqlSort
    selected: string[]
    search: string
}

export class VisitList extends React.Component<VisitListProps, VisitListState> {
    constructor(props: VisitListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            sort: {key: null, type: null},
            selected: [],
            search: ''
        };
    }

    private fetchData = (params: ListParams = null) => {
        params = extend(true, {
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            sort: this.state.sort
        }, params);
        const loading = Toast.loading();
        const {pageIndex, pageSize, sort} = params;
        getJSON(Api.visitList, {
            pageIndex, pageSize,
            search: this.state.search,
            sortKey: sort.key || "",
            sortType: sort.type || "",
        }, (res: PagerResult<VisitModel>) => {
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

    private renderEmptyChildren = () => {
        if (this.state.data === null) {
            return "数据加载中"
        } else {
            return "暂无数据"
        }
    };

    private deleteItem = (ids: string[]) => {
        adminActions.confirm(
            `您正在删除${ids.length}条数据, 删除后不可恢复!!`,
            "确定要删除吗?", () => {
                post(Api.visitDelete, {
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
                        this.fetchData();
                        adminActions.alert(`成功删除${res.result}条数据`);
                    } else {
                        adminActions.toast(res.result)
                    }
                })
            })
    };

    private renderFooter = () => {
        return <Pager pageIndex={this.state.pageIndex}
                      pageSize={this.state.pageSize}
                      total={this.state.total}
                      onChange={(pageIndex, pageSize) => this.fetchData({pageIndex, pageSize})}/>;
    };

    componentDidMount() {
        this.fetchData();
    }

    render() {
        return <div className="list-page display-flex-column">
            <div className='list-actions'>
                时间从<input type="date" className='hui-input'/>到<input type="date" className='hui-input'/>
                <div className="search-container">
                    <input type="search"
                           className="hui-input hui-input-search"
                           value={this.state.search}
                           placeholder={"搜索"}
                           onFocus={e => e.currentTarget.select()}
                           onKeyDown={e => e.keyCode === 13 && this.fetchData()}
                           onChange={e => this.setState({search: e.currentTarget.value})}/>
                    <Icon name={"search"}/>
                </div>
                <button className="hui-btn-primary" onClick={e => this.fetchData()}>搜索</button>
                {this.state.selected.length > 0 ?
                    <button className="hui-btn hui-btn-danger float-right"
                            onClick={e => this.deleteItem(this.state.selected)}>
                        删除({this.state.selected.length})
                    </button> : undefined}
            </div>
            <Table data={this.state.data || []}
                   className='flex-1 display-flex-column'
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   onSort={sort => this.fetchData({sort})}
                   selected={this.state.selected}
                   header={"fixed"}
                   footer={this.renderFooter()}
                   onSelected={selected => {
                       this.setState({selected});
                       console.log(selected);
                       return false;
                   }}
                   selectable={true}>
                <TableColumn title={'路径'} field={(m: VisitModel) => {
                    return <a href={m.url} target='_blank'>{m.url}</a>
                }}/>
                <TableColumn title={'用户代理'} field={'userAgent'}/>
                <TableColumn title={'时间'} field={'visitTime'} width={'6rem'} align={"center"} sort={'visit_time'}/>
                <TableColumn title={'IP地址'} field={'ip'} width={'8rem'}/>
                <TableColumn title={'操作'} field={(m: VisitModel, doExpand: TableDoExpand) => {
                    return <>
                        <button className="no-background no-border" onClick={e => this.deleteItem[m.id]}>
                            <Icon name='trash-alt'/>
                        </button>
                        |
                        <button className="no-background no-border" onClick={e => {
                            doExpand(<>
                                <div>路径</div>
                                <div>{m.url}</div>

                                <div>来源</div>
                                <div>{m.referer}</div>

                                <div>用户代理</div>
                                <div>{m.userAgent}</div>
                            </>)
                        }}>
                            <Icon name='info-circle'/>
                        </button>
                    </>
                }} align={"center"} width={'6rem'}/>
            </Table>
        </div>
    }
}


ReactDOM.render(<VisitList/>, document.body);