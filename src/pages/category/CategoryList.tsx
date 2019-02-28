import * as React from "react";
import * as ReactDOM from "react-dom";
import {
    ApiResult,
    BaseModel,
    Icon,
    PagerModel,
    PagerResult,
    queryObject,
    queryString,
    SqlSort,
    Table,
    TableColumn,
    Toast
} from "hefang-ui-react";
import {Api} from "../../urls";
import {CategoryModel} from "../../models/CategoryModel";
import {getJSON, post} from "../../functions";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";

declare const adminActions: AdminActions;

export interface CategoryListState extends PagerModel<CategoryModel> {
    search: string
    sort: SqlSort
}

export interface CategoryListProps {

}

export class CategoryList extends React.Component<CategoryListProps, CategoryListState> {
    static readonly defaultProps: CategoryListProps = {};

    constructor(props: CategoryListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            search: '',
            sort: {key: null, type: null}
        };
    }

    private fetchData = (
        pageIndex: number = null,
        pageSize: number = null,
        sort: SqlSort = null
    ) => {
        pageIndex = pageIndex || this.state.pageIndex;
        pageSize = pageSize || this.state.pageSize;
        sort = sort || this.state.sort;
        const loading = Toast.loading();
        getJSON(Api.categoryList, {
            pgIndex: pageIndex, pgSize: pageSize,
            search: this.state.search,
            sortKey: sort.key || "",
            sortType: sort.type || "",
            type: queryObject('type')
        }, (res: PagerResult<CategoryModel>) => {
            loading.close();
            if (res.success) {
                const {pageIndex, pageSize, total, data} = res.result;
                this.setState({
                    pageIndex, pageSize, total, data, sort
                })
            } else {
            }
        })
    };
    private insertOrUpdateItem = (model: BaseModel = null) => {
        adminActions.window(`categoryeditor.html?${queryString(model)}`, {
            width: 350,
            height: 425,
            title: '添加/编辑分类',
            mask: true,
            maximizable: false,
            onClosed: (data: any) => {
                if (data === "ok") {
                    this.fetchData()
                }
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


    private deleteItem = (model: CategoryModel) => {
        adminActions.confirm(
            `您正在删除"${model.id}"`,
            "确定要删除吗?", () => {
                post(Api.categoryDelete, {
                    id: model.id
                }, (res: ApiResult<string>) => {
                    if (res.success) {
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
                <button className="hui-btn hui-btn-red float-right"
                        onClick={e => this.insertOrUpdateItem()}>
                    添加
                </button>
            </div>
            <Table data={this.state.data || []}
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   selectable={false}>
                <TableColumn title={"分类名"} field={'name'}/>
                <TableColumn title={"操作"} field={(model: CategoryModel) => {
                    return <>
                        <button className="no-border" onClick={e => this.deleteItem(model)}>
                            <Icon name="trash-alt"/>
                        </button>
                        | <button className="no-border" onClick={e => this.insertOrUpdateItem(model)}>
                            <Icon name='edit'/>
                        </button>
                    </>
                }} width={"10rem"} align={"center"}/>
            </Table>
        </div>
    }
}

// if ("adminOperater" in window) {
ReactDOM.render(<CategoryList/>, document.body);
// } else {
//     window.addEventListener("JsInterfaceReady", () =>
//         ReactDOM.render(<CategoryList/>, document.getElementById("container"))
//     );
// }