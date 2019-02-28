import * as React from "react";
import * as ReactDOM from 'react-dom';
import {getJSON, post} from "../../functions";
import {Api} from "../../urls";
import {Button, getLocalStorage, Pager, PagerModel, PagerResult, setLocalStorage, Toast} from "hefang-ui-react";
import {CommentModel} from "../../models/CommentModel";
import "./comment.css"
import "./textarea.css"
import {execute} from "hefang-js";

declare const contentId: string;
declare const commentEnable: boolean;
declare const commentCount: number;
declare const commentCaptchaEnable: boolean;


interface TextareaState {
    value: string
}

class Textarea extends React.Component<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, TextareaState> {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
    }

    render() {
        if (!this.props.maxLength) {
            return <textarea {...this.props}/>
        }
        const {className, style, onChange, ...props} = this.props;
        return <div className={`${className} hui-textarea`}>
            <textarea {...props} className="hui-input display-block" onChange={e => {
                this.setState({value: e.currentTarget.value});
                execute(onChange, e);
            }}/>
            <div>{this.state.value.length}/{this.props.maxLength}</div>
        </div>
    }
}

interface PostCommentState extends PagerModel<CommentModel> {
    content: string
    submitting: boolean
    captcha: string
    captchaNoCache: string | number
    nickname: string
    email: string
}

class PostComment extends React.Component<any, PostCommentState> {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            submitting: false,
            data: [],
            pageIndex: 1,
            pageSize: 10,
            total: 0,
            captcha: '',
            captchaNoCache: '',
            nickname: getLocalStorage('comment_nickname', '某网友'),
            email: getLocalStorage('comment_email')
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    componentWillReceiveProps() {
        this.fetchData()
    }

    private fetchData = (pageIndex: number = null, pageSize: number = null) => {
        const loading = Toast.loading();
        pageIndex === null && (pageIndex = this.state.pageIndex);
        pageSize === null && (pageSize = this.state.pageSize);
        getJSON(Api.commentList, {
            pageIndex, pageSize, contentId
        }, (res: PagerResult<CommentModel>) => {
            loading.close();
            if (res.success) {
                const {pageIndex, pageSize, total, data} = res.result;
                this.setState({pageIndex, pageSize, total, data})
            } else {
                Toast.show(res.result)
            }
        })
    };
    private doSubmit = () => {
        if (!this.state.content) {
            Toast.show('请输入评论内容');
            return;
        }
        if (commentCaptchaEnable && !this.state.captcha) {
            Toast.show('请输入验证码');
            return;
        }
        post(Api.commentInsert, {
            contentId,
            comment: this.state.content,
            captcha: this.state.captcha,
            authorInfo: {
                nickname: this.state.nickname,
                email: this.state.email,
                headImgUrl: null
            }
        }, res => {
            if (res.success) {
                Toast.success();
                this.fetchData(1);
                this.setState({
                    submitting: false,
                    content: '',
                    captcha: ''
                });
                setLocalStorage('comment_nickname', this.state.nickname);
                setLocalStorage('comment_email', this.state.email)
            } else {
                Toast.show(res.result)
            }
        })
    };
    private renderForm = () => {
        return <>
            <h2>发表评论</h2>
            <div className="form-group">
                <label htmlFor="commentContent">内容</label>
                <Textarea id={'commentContent'} rows={5}
                          value={this.state.content}
                          placeholder={'请输入评论内容'}
                          onChange={e => this.setState({content: e.currentTarget.value})}
                          maxLength={200}/>
            </div>
            <div className='display-flex-row'>
                <div className="form-group flex-1" style={{boxSizing: 'border-box', paddingRight: '.5rem'}}>
                    <label htmlFor="nickname">称呼</label>
                    <input type="text" id='nickname'
                           className="hui-input display-block"/>
                </div>
                <div className="form-group flex-1">
                    <label htmlFor="contact">联系方式</label>
                    <input id='contact' type="text" className="hui-input display-block"
                           placeholder='网站/QQ号/微信号/手机号/邮箱都行'/>
                </div>
            </div>
            <div className="display-flex-row">
                {commentCaptchaEnable ? <div className="comment-captcha-container flex-1 display-flex-row">
                    <img src={`${Api.captcha}?nocache=${this.state.captchaNoCache}`}
                         className='hui-input'
                         style={{height: '2rem', padding: 0, cursor: 'pointer'}}
                         title='点击刷新验证码'
                         onClick={e => this.setState({captchaNoCache: Math.random()})}/>
                    <input type="text" style={{width: '7rem'}}
                           className='hui-input'
                           placeholder='请输入验证码'
                           onChange={e => this.setState({captcha: e.currentTarget.value})}
                           value={this.state.captcha}/>
                    <div className='flex-1'>&nbsp;</div>
                </div> : <div className='flex-1'>&nbsp;</div>}
                <Button text='评论'
                        className='hui-btn-primary'
                        loading={this.state.submitting}
                        onClick={this.doSubmit}/>
            </div>
        </>;
    };

    render() {
        return <>
            <div className="block" id="postCommentBlock">
                {commentEnable ? this.renderForm() : <p>后台评论功能已关闭, 无法发表新评论</p>}
            </div>
            <div className="block" id="commentBlock">
                {commentCount > 0 ? <h2>共{commentCount}条评论</h2> : <h2>暂时没有评论</h2>}
                <div className='comment-list-container'>
                    {this.state.data.length > 0 ? this.state.data.map(item => <div>
                        <div className="comment-item">
                            <div className='display-flex-row'><span
                                className='flex-1'>{item.postTime}</span><span>{item.floor}楼</span></div>
                            <div className='comment-content'>{item.comment}</div>
                        </div>
                    </div>) : <div>听说第一个评论的人写代码永不出bug哦</div>}
                </div>
                <div className="comment-pager">
                    <Pager total={this.state.total}
                           pageIndex={this.state.pageIndex}
                           pageSize={this.state.pageSize}
                           onChange={this.fetchData}/>
                </div>
            </div>
        </>
    }
}


function renderForm() {
    ReactDOM.render(
        <PostComment/>,
        document.getElementById('commentContainer')
    );
}

renderForm();