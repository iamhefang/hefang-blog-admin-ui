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
import {getJSON, post} from "../../functions";
import {Api, Url} from "../../urls";
import {AdminActions} from "hefang-ui-react-admin";
import "../../common.css";
import {extend, formatDate} from "hefang-js";
import {ListParams} from "../../models/ListParams";
import {UrlModel} from "../../models/UrlModel";
import {TagModel} from "../../models/TagModel";
import {FileModel} from "../../models/FileModel";
import {func} from "prop-types";

declare const adminActions: AdminActions;

export interface FileListProps {

}

function fileIcon(m: FileModel) {
    let icon = 'file';
    if (m.mimeType.startsWith("image/")) {
        icon += '-image';
    } else if (m.fileName.endsWith('.pdf')) {
        icon += '-pdf';
    } else if (m.fileName.endsWith('.rar')
        || m.fileName.indexOf('.zip')
        || m.fileName.indexOf('.7z')
        || m.fileName.indexOf('.gz')) {
        icon += '-archive';
    }
    return icon;
}

export interface FileListState extends PagerModel<UrlModel> {
    sort: SqlSort
    selected: string[]
    tag: string
    tags: TagModel[]
}

export class FileList extends React.Component<FileListProps, FileListState> {
    constructor(props: FileListProps) {
        super(props);
        this.state = {
            pageIndex: 1,
            pageSize: 20,
            total: 0,
            data: [],
            sort: {key: null, type: null},
            selected: [],
            tags: [],
            tag: ''
        };
    }

    private fetchTags = () => {
        getJSON(Api.tagList, {type: 'file'}, (res: PagerResult<TagModel>) => {
            if (res.success) {
                this.setState({tags: res.result.data})
            } else {
                adminActions.toast(res.result)
            }
        })
    };
    private fetchData = (params: ListParams = null) => {
        params = extend(true, {
            pageIndex: this.state.pageIndex,
            pageSize: this.state.pageSize,
            sort: this.state.sort,
            tag: this.state.tag
        }, params);
        const loading = Toast.loading();
        const {pageIndex, pageSize, sort} = params;
        getJSON(Api.fileList, {
            pageIndex, pageSize,
            sortKey: sort.key || "",
            sortType: sort.type || "",
            tag: params.tag
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
            width: 140, height: 280, title: '二维码', icon: 'qrcode'
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
                        adminActions.success();
                        this.fetchData()
                    } else {
                        adminActions.toast(res.result)
                    }
                })
            })
    };

    componentDidMount() {
        this.fetchTags();
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
                <select className="hui-input" value={this.state.tag}
                        onChange={e => this.fetchData({tag: e.currentTarget.value})}>
                    <option value="">全部文件</option>
                    {this.state.tags.map(tag => <option value={tag.tag}>{tag.tag}({tag.contentCount})</option>)}
                </select>
                <button className="hui-btn hui-btn-primary float-right"
                        onClick={e => this.insertOrUpdateItem()}>
                    上传新文件
                </button>
                {this.state.selected.length > 0 ?
                    <button className="hui-btn hui-btn-danger float-right"
                            onClick={e => this.deleteItem(this.state.selected)}>
                        删除
                    </button> : undefined}
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
                <TableColumn title={"文件名"} field={(m: FileModel) => {
                    return <>
                        <Icon name={fileIcon(m)}/> {m.fileName}
                    </>
                }}/>
                <TableColumn title={'大小'} field={(m: FileModel) => {
                    if (m.size < 1024) {
                        return `${m.size}B`
                    }
                    if (m.size < 1024 * 1024) {
                        return `${(m.size / 1024).toFixed(1)}K`
                    }
                    if (m.size < 1024 * 1024 * 1024) {
                        return `${(m.size / 1024 / 1024).toFixed(1)}M`
                    }
                    return `${(m.size / 1024 / 1024 / 1024).toFixed(1)}G`;
                }} width={"5rem"} align={"center"} sort={'size'}/>
                <TableColumn title={'类型'} field={(m: FileModel) => {
                    return m.mimeType
                }} align={"left"} width={"6rem"}/>
                <TableColumn title={'上传时间'} field={(m: FileModel) => {
                    return formatDate(new Date(m.uploadTime))
                }} width={"6rem"} align={"center"} sort={'upload_time'}/>
                <TableColumn title={'操作'} field={(m: UrlModel) => {
                    return <>
                        <button className="no-background no-border" onClick={e => this.deleteItem[m.id]}>
                            <Icon name='trash-alt'/>
                        </button>
                        |
                        <button className="no-background no-border" onClick={e => this.insertOrUpdateItem(m)}>
                            <Icon name='edit'/>
                        </button>
                    </>
                }} align={"center"} width={'7rem'}/>
            </Table>
        </div>
    }
}


ReactDOM.render(<FileList/>, document.body);