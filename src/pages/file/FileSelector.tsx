import * as React from "react";
import {ReactNode} from "react";
import * as ReactDOM from "react-dom";
import {AdminActions} from "hefang-ui-react-admin";
import {DialogOperater} from "hefang-ui-react";
import {extend} from "hefang-js";
import "./file-selector.css";

const adminActions: AdminActions = top['adminActions'];
declare const dialogOperater: DialogOperater;


export interface FileSelectorState {

}

export interface FileSelectorProps {

}

export interface FileSelectorOptions {
    type?: string
    tag?: string
    title?: string
    icon?: string | ReactNode | boolean
}

export class FileSelector extends React.Component<FileSelectorProps, FileSelectorState> {
    constructor(props: FileSelectorProps) {
        super(props);
        this.state = {};
    }

    render() {
        return <div className="file-selector-container">

        </div>
    }


    public static readonly defaultOptions: FileSelectorOptions = {
        type: 'all',
        tag: '',
        title: '文件选择',
        icon: true
    };

    public static show(options: FileSelectorOptions) {
        options = extend(true, {}, FileSelector.defaultOptions, options);
        adminActions.window(`fileselector.html?${JSON.stringify(options)}`, {
            width: 800,
            height: 600,
            resizable: false,
            maximizable: false,
            mask: true,
            title: options.title,
            icon: options.icon
        });
    }
}

ReactDOM.render(<FileSelector/>, document.body);