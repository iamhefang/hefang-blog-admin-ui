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
import {Api, Url} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {ArticleModel} from "../../models/ArticleModel";
import {extend, formatDate} from "hefang-js";
import {TagModel} from "../../models/TagModel";
import {ListParams} from "../../models/ListParams";


declare const adminActions: AdminActions;

export interface ArticleListProps {

}

export interface ArticleListState extends PagerModel<ArticleModel> {
    search: string
    sort: SqlSort
    cateId: string
    tags: TagModel[]
    tag: string
}

export class ArticleList extends React.Component<ArticleListProps, ArticleListState> {
    constructor(props: ArticleListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            search: '',
            sort: {key: null, type: null},
            cateId: '',
            tags: [],
            tag: '',
        };
    }

    private fetchData = (params: ListParams = null) => {
        params = extend(true, {
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            search: this.state.search,
            sort: this.state.sort,
            tag: this.state.tag
        }, params);
        const loading = Toast.loading();
        const {pageIndex, pageSize, tag, search, sort} = params;
        getJSON(Api.articleList, {
            pageIndex, pageSize, tag, search,
            sortKey: sort.key || "",
            sortType: sort.type || "",
            type: queryObject('type')
        }, (res: PagerResult<ArticleModel>) => {
            loading.close();
            if (res.success) {
                const {pageIndex, pageSize, total, data} = res.result;
                this.setState({
                    pageIndex, pageSize, total, data, sort, tag
                })
            } else {
                adminActions.toast(res.result)
            }
        })
    };

    private insertOrUpdateItem = (model: ArticleModel = null) => {
        const width = top.innerWidth * .9
            , height = top.innerHeight * .95;
        adminActions.window(`articleeditor.html?id=${model ? model.id : ''}&type=${queryObject('type')}`, {
            width: width > 1024 ? 1024 : width,
            height: height > 768 ? 768 : height,
            title: '添加/编辑文章',
            mask: 70,
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

    private deleteItem = (model: ArticleModel) => {
        adminActions.confirm(
            `您正在删除"${model.title}"`,
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

    private changeDraft = (m: ArticleModel) => {
        adminActions.confirm(`确定要把该文章${m.isDraft ? '正式发表' : '改为草稿'}吗?`, () => {
            post(Api.articleDraft, {
                isDraft: !m.isDraft,
                id: m.id
            }, (res) => {
                if (res.success) {
                    this.fetchData();
                    adminActions.toast('操作成功');
                } else {
                    adminActions.toast(res.result)
                }
            })
        });
    };
    private renderFooter = () => {
        return <Pager pageIndex={this.state.pageIndex}
                      pageSize={this.state.pageSize}
                      total={this.state.total}
                      onChange={(pageIndex, pageSize) => this.fetchData({pageIndex, pageSize})}/>;
    };

    componentDidMount() {
        this.fetchData();
        getJSON(Api.tagList, {type: 'article'}, (res: PagerResult<TagModel>) => {
            if (res.success) {
                this.setState({tags: res.result.data})
            } else {
                adminActions.toast(res.result)
            }
        });
    }

    render() {
        return <div className="list-page display-flex-column">
            <div className='list-actions'>
                {queryObject('type') === 'article' ?
                    <select className="hui-input" value={this.state.tag}
                            onChange={e => this.fetchData({tag: e.currentTarget.value})}>
                        <option value="">全部标签</option>
                        {this.state.tags.map(tag => <option value={tag.tag}>{tag.tag}({tag.contentCount})</option>)}
                    </select> : undefined}
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
                    {queryObject('type') === 'article' ? '新建文章' : '新建页面'}
                </button>
            </div>
            <Table data={this.state.data || []}
                   emptyChildren={this.renderEmptyChildren()}
                   sort={this.state.sort}
                   header={"fixed"}
                   footer={this.renderFooter()}
                   className={'flex-1 display-flex-column'}
                   onSort={sort => this.fetchData({sort})}
                   selectable={false}>
                <TableColumn title={"标题"} field={(m: ArticleModel) => {
                    return <a href={`${Url.base}/${queryObject("type")}/${m.alias || m.id}.html`}
                              target='_blank'>{m.title}</a>
                }}/>
                {queryObject("type") === 'article' ?
                    <TableColumn title={'标签'}
                                 field={(m: ArticleModel) => m.tags.map(tag => <a
                                     href='javascript:;' style={{marginRight: '.5rem'}}
                                     onClick={e => this.fetchData({tag})}>{tag}</a>)}/> : undefined}
                <TableColumn title={'阅读量'} field={'readCount'} width={"5rem"} align={"center"} sort={'read_count'}/>
                <TableColumn title={'点赞量'} field={'upCount'} width={"5rem"} align={"center"} sort={'up_count'}/>
                <TableColumn title={"发布时间"} field={(m: ArticleModel) => {
                    return formatDate(new Date(m.postTime))
                }} width={"6rem"} align={"center"} sort={'post_time'}/>
                <TableColumn title={'是否草稿'} field={(m: ArticleModel) => {
                    return m.isDraft ?
                        <><span style={{color: 'red'}}>是</span> | <a href="javascript:;"
                                                                     onClick={e => this.changeDraft(m)}>正式发表</a></> :
                        <><span style={{color: 'green'}}>否</span> | <a href="javascript:;"
                                                                       onClick={e => this.changeDraft(m)}>转为草稿</a></>;
                }} align={"center"} width={"6rem"} sort={'is_draft'}/>
                <TableColumn title={"操作"} field={(model: ArticleModel) => {
                    return <>
                        <button className="no-border no-background" onClick={e => this.deleteItem(model)}>
                            <Icon name="trash-alt"/>
                        </button>
                        | <button className="no-border no-background" onClick={e => this.insertOrUpdateItem(model)}>
                            <Icon name='edit'/>
                        </button>
                    </>
                }} width={"5rem"} align={"center"}/>
            </Table>
        </div>
    }
}


ReactDOM.render(<ArticleList/>, document.body);