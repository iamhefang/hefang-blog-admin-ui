import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    ApiResult,
    Icon,
    Pager,
    PagerModel,
    PagerResult,
    queryObject,
    SqlSort,
    Table,
    TableColumn,
    Toast
} from "hefang-ui-react";
import {getJSON, post} from "../../functions";
import {Api} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {CategoryModel} from "../../models/CategoryModel";
import {UserModel} from "../../models/UserModel";


declare const adminActions: AdminActions;

export interface OrderListProps {

}

export interface OrderListState extends PagerModel<UserModel> {
    search: string
    sort: SqlSort
    cateId: string
    categories: CategoryModel[]
    status: string
}

export class OrderList extends React.Component<OrderListProps, OrderListState> {
    constructor(props: OrderListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 10,
            total: 0,
            data: [],
            search: '',
            sort: {key: null, type: null},
            cateId: '',
            categories: [],
            status: ''
        };
    }

    private fetchData = (
        pageIndex: number = null,
        pageSize: number = null,
        sort: SqlSort = null,
        status: string = ''
    ) => {
        pageIndex = pageIndex || this.state.pageIndex;
        pageSize = pageSize || this.state.pageSize;
        sort = sort || this.state.sort;
        status = status === null ? this.state.status : status;
        const loading = Toast.loading();
        getJSON(Api.userList, {
            pageIndex, pageSize,
            search: this.state.search,
            sortKey: sort.key || "",
            sortType: sort.type || "",
            type: queryObject('type'),
            status
        }, (res: PagerResult<UserModel>) => {
            loading.close();
            if (res.success) {
                const {pageIndex, pageSize, total, data} = res.result;
                this.setState({
                    pageIndex, pageSize, total, data, sort, status
                })
            } else {
                Toast.show(res.result)
            }
        })
    };

    private renderEmptyChildren = () => {
        if (this.state.data === null) {
            return "数据加载中"
        } else if (this.state.data.length === 0 && this.state.search) {
            return "未搜索到数据"
        } else {
            return "暂无数据"
        }
    };

    private changePhone = (m: UserModel) => {
        adminActions.prompt("请输入手机号", m.phone, "修改手机号", (dialog) => {
            if (!/^1[3456789]\d{9}$/i.test(dialog.data())) {
                adminActions.toast("请输入11位数字手机号");
                return false;
            }
            post(Api.userChangePhone, {
                phone: dialog, loginId: m.id
            }, (res: ApiResult<string>) => {
                if (res.success) {
                    adminActions.success();
                } else {
                    adminActions.toast(res.result);
                    m.phone = dialog.data();
                    this.changePhone(m)
                }
            })
        }, null, {
            maxLength: 11,
            inputType: "tel",
            mask: true
        })
    };

    componentDidMount() {
        this.fetchData();
    }

    render() {
        return <div className="container">
            <div>
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
                <button className="hui-btn hui-btn-blue"
                        onClick={e => this.fetchData()}>搜索
                </button>
            </div>
            <Table data={this.state.data || []}
                   header={"fixed"}
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   selectable={false}>
                <TableColumn title={"头像"} field={(m: UserModel) => {
                    return m.headImgUrl ? <img src={m.headImgUrl} style={{width: '3rem', height: '3rem'}}/> : '无'
                }}/>
                <TableColumn title={"昵称"} field={'nickName'}/>
                <TableColumn title={"手机号"} field={(m: UserModel) => {
                    return m.phone ?
                        <span>{m.phone} | <a href="javascript:;" onClick={e => this.changePhone(m)}>修改</a></span> :
                        <span>无 | <a href="javascript:;" onClick={e => this.changePhone(m)}>绑定</a></span>
                }} width={"10em"} align={"center"}/>
            </Table>
            <div className="pager-container">
                <Pager total={this.state.total} pageIndex={this.state.pageIndex}
                       pageSize={this.state.pageSize}
                       onChange={(pageIndex, pageSize) => {
                           this.fetchData(pageIndex, pageSize)
                       }}/>
            </div>
        </div>
    }
}


ReactDOM.render(<OrderList/>, document.body);