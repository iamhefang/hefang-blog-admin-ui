import * as React from "react";
import * as ReactDOM from "react-dom";
import {UrlModel} from "../../models/UrlModel";
import {SwitchBox} from "hefang-ui-react";


export interface UrlEditorProps {

}

export interface UrlEditorState extends UrlModel {

}

export class UrlEditor extends React.Component<UrlEditorProps, UrlEditorState> {
    constructor(props: UrlEditorProps) {
        super(props);
        this.state = {
            url: '',
            disposable: true,
            expiresIn: 0
        };
    }

    render() {
        return <>
            <div style={{padding: '1rem', boxSizing: 'border-box'}}>
                <div className="form-group">
                    <label htmlFor="url">长连接</label>
                    <textarea className='hui-input display-block no-resize'
                              value={this.state.url}
                              onChange={e => this.setState({url: e.currentTarget.value})}/>
                </div>
                <div className="form-group">
                    <table style={{width: '100%'}}>
                        <tbody>
                        <tr>
                            <td>一次性</td>
                            <td className='text-right'>
                                <SwitchBox type={"primary"}
                                           on={this.state.disposable}
                                           onChange={disposable => this.setState({disposable})}/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                {this.state.disposable ? undefined : <div className="form-group">
                    <label htmlFor="expiresIn">有效期至</label>
                    <input type="date-time" className='hui-input display-block'/>
                </div>}
            </div>
            <div className="hui-dialog-footer">
                <button className='hui-btn-primary'>提交</button>
            </div>
        </>
    }
}

ReactDOM.render(<UrlEditor/>, document.body);