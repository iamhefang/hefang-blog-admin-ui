import * as React from "react";
import * as ReactDOM from "react-dom";

import "./CodeEditor.css";
import {Ace, edit} from "ace-builds";

interface CodeEditorState {

}

class CodeEditor extends React.Component<any, CodeEditorState> {
    private editor: Ace.Editor;

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.editor = edit('editor', {
            mode: 'ace/mode/html',
            theme: 'ace/theme/monokai'
        });
        this.editor.setOption('enableEmmet', true);
    }

    render() {
        return <>
            <div className="editor flex-1" id='editor'>

            </div>
            <div className="flex-1">
                <iframe src="" frameBorder={0}/>
            </div>
        </>
    }
}

ReactDOM.render(<CodeEditor/>, document.body);