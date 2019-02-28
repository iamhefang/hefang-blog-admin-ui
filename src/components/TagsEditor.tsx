import * as React from "react";
import {execute} from "hefang-js";


export interface TagsEditorProps {
    value?: string[]
    onChange?: (value: string[]) => void
}

export interface TagsEditorState {
    value: { [key: string]: boolean }
    current: string
}

export class TagsEditor extends React.Component<TagsEditorProps, TagsEditorState> {

    constructor(props: TagsEditorProps) {
        super(props);
        this.state = {
            value: this.makeState(props.value || []),
            current: ''
        };
    }

    private makeState(value: string[]) {
        const obj = {};
        value.forEach(item => {
            obj[item] = true;
        });
        return obj;
    }

    componentWillReceiveProps(props: TagsEditorProps) {
        if (!Array.isArray(props.value)) return;
        this.setState({
            value: this.makeState(props.value)
        })
    }

    render() {
        return <div className="hui-input tags-container">
            {Object.keys(this.state.value).map(item => <span className='hui-btn' key={`tag${item}`}>
                {item}
                <button className='no-border no-background' onClick={e => {
                    const value = this.state.value;
                    delete  value[item];
                    this.setState({value})
                }}>✕</button>
            </span>)}
            <input type="text" maxLength={32} placeholder={'新标签'}
                   className='no-border no-background'
                   value={this.state.current}
                   onChange={e => this.setState({current: e.currentTarget.value})}
                   onKeyDown={e => {
                       if (e.keyCode === 13 || e.keyCode === 32) {
                           e.stopPropagation();
                           e.preventDefault();
                           if (e.currentTarget.value) {
                               const value = this.state.value;
                               value[this.state.current] = true;
                               this.setState({value, current: ''}, () => {
                                   execute(this.props.onChange, Object.keys(this.state.value))
                               });
                           }
                           return false;
                       }
                       if (e.keyCode === 8 && !e.currentTarget.value) {
                           e.stopPropagation();
                           e.preventDefault();
                           const value = this.state.value
                               , arr = Object.keys(value)
                               , current = arr[arr.length - 1];
                           delete value[current];
                           console.log(current);
                           this.setState({value, current});
                           return false;
                       }
                   }}/>
        </div>
    }
}