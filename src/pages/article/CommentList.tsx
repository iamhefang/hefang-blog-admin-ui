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
    TableDoExpand,
    Toast
} from "hefang-ui-react";
import {currentLogin, getJSON, post} from "../../functions";
import {Api, Url} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {CommentModel} from "../../models/CommentModel";
import {extend} from "hefang-js";
import {ListParams} from "../../models/ListParams";


declare const adminActions: AdminActions;
const contentId = queryObject('contentId') as string;

export interface CommentListProps {

}

export interface CommentListState extends PagerModel<CommentModel> {
    search: string
    sort: SqlSort
    contentId: string
}

export class CommentList extends React.Component<CommentListProps, CommentListState> {
    constructor(props: CommentListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            search: '',
            sort: {key: null, type: null},
            contentId
        };
    }

    private fetchData = (params: ListParams = null) => {
        params = extend(true, {
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            search: this.state.search,
            sort: this.state.sort,
        }, params);
        const loading = Toast.loading();
        const {pageIndex, pageSize, tag, search, sort} = params;
        getJSON(Api.commentList, {
            pageIndex, pageSize, tag, search,
            sortKey: sort.key || "",
            sortType: sort.type || "",
            type: queryObject('type')
        }, (res: PagerResult<CommentModel>) => {
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

    private insertOrUpdateItem = (model: CommentModel = null) => {
        adminActions.window(`articleeditor.html?id=${model ? model.id : ''}&type=${queryObject('type')}`, {
            width: 1024,
            height: 768,
            title: '添加/编辑文章',
            mask: true,
            maximizable: true,
            onClosing: (operater) => {
                if (!operater.data()) {
                    operater.shake();
                    adminActions.confirm(
                        <div className='hui-dialog-content'>
                            <p>文章已编辑， 还未保存。</p>
                            <p>关闭后内容将自动保存到草稿中。</p>
                        </div>,
                        '确定要关闭吗？',
                        () => operater.close(true),
                        {icon: 'exclamation-triangle'}
                    );
                    return false;
                }
            },
            onClosed: (operater) => this.fetchData()
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

    private deleteItem = (model: CommentModel) => {
        adminActions.confirm(
            `您正在删除" "`,
            "确定要删除吗?", () => {
                post(Api.articleDelete, {
                    id: model.id
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

    private changeDraft = (isDraft: boolean) => {

    };

    private showUserInfo = (m: CommentModel) => {

    };

    private replay = (m: CommentModel) => {
        const login = currentLogin();
        adminActions.prompt(`回复${m.floor}楼`, operater => {
            post(Api.commentInsert, {
                replayId: m.id,
                comment: operater.data(),
                contentId: m.contentId,
                authorInfo: {
                    nickname: login.realName || login.nickName || login.loginName,
                    email: null,
                    headImgUrl: login.headImgUrl
                }
            }, res => {
                if (res.success) {
                    this.fetchData();
                } else {
                    adminActions.toast(res.result);
                }
            })
        }, null, {
            inputType: "textarea",
            rows: 4,
            mask: true,
            placeholder: '请输入回复内容'
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
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   header={"fixed"}
                   footer={this.renderFooter()}
                   className={'flex-1 display-flex-column'}
                   onSort={sort => this.fetchData({sort})}
                   selectable={true}>
                {contentId ? undefined : <TableColumn title={'文章'} field={(m: CommentModel) => {
                    return <a href={`${Url.base}/article/${m.contentAlias || m.contentId}.html`}
                              target='_blank'>{m.contentTitle}</a>
                }}/>}
                <TableColumn title={'内容'} field={'comment'}/>
                <TableColumn title={'发表时间'} field={'postTime'}
                             width={'6rem'} align={"center"}
                             sort={'post_time'}/>
                <TableColumn title={'楼层'} field={'floor'} width={'5rem'} align={"center"} sort={'floor'}/>
                <TableColumn title={'详情'} field={(m: CommentModel, doExpand: TableDoExpand) => {
                    return <>
                        <button className='no-background no-border' onClick={e => {
                            doExpand(<table style={{background: 'white'}}>
                                <tbody>
                                <tr>
                                    <td>昵称</td>
                                    <td>邮箱</td>
                                </tr>
                                <tr>
                                    <td>{m.authorInfo.nickname || '无'}</td>
                                    <td>{m.authorInfo.email || '无'}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>内容</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>{m.comment}</td>
                                </tr>
                                </tbody>
                            </table>)
                        }}><Icon name='info-circle'/></button>
                        |
                        <button className="no-background no-border" title='回复' onClick={e => this.replay(m)}>
                            <Icon name='pen'/>
                        </button>
                    </>
                }} width={'8rem'} align={"center"}/>
            </Table>
        </div>
    }
}


ReactDOM.render(<CommentList/>, document.body);