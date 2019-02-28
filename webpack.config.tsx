import {Configuration} from "webpack";
import HtmlWebpackPlugin = require("html-webpack-plugin");
import * as path from "path";

const config: Configuration = {
    entry: {
        index: './index.tsx',
        comment: './src/pages/article/comment.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        // path: '/Volumes/DATASWAP/DevDir/php-mvc/test/admin',
        filename: '[name].js?v=[hash]',
        libraryTarget: "umd",
        umdNamedDefine: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /.*?\.tsx?$/i,
                use: 'ts-loader'
            },
            {
                test: /.*?\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    externals: {
        'react': {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React'
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDOM'
        },
        'hefang-js': {
            commonjs: 'hefang-js',
            commonjs2: 'hefang-js',
            amd: 'hefang-js',
            root: 'H'
        },
        'hefang-ui-react': {
            commonjs: 'hefang-ui-react',
            commonjs2: 'hefang-ui-react',
            amd: 'hefang-ui-react',
            root: 'HuiReact'
        },
        'hefang-ui-react-admin': {
            commonjs: 'hefang-ui-react-admin',
            commonjs2: 'hefang-ui-react-admin',
            amd: 'hefang-ui-react-admin',
            root: 'HuiReactAdmin'
        },
        'ace-builds': {
            commonjs: 'ace-builds',
            commonjs2: 'ace-builds',
            amd: 'ace-builds',
            root: 'ace'
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            chunks: ['index'],
            inject: "body",
            minify: {
                collapseBooleanAttributes: true,
                collapseInlineTagWhitespace: true,
                collapseWhitespace: true,
                html5: true,
                minifyCSS: true,
                minifyJS: true
            },
            template: './index.html'
        })
    ]
};

page("main", "./src/pages/Main.tsx");
page("settings", "Settings", "./src/pages/commodity/editor.html");
page("articlelist", "./src/pages/article/ArticleList.tsx");
page("articleeditor", "./src/pages/article/ArticleEditor.tsx", "./src/pages/commodity/editor.html");
page("urllist", "./src/pages/url/UrlList.tsx");
page("urleditor", "./src/pages/url/UrlEditor.tsx");
page("fileselector", "./src/pages/file/FileSelector.tsx");
page("filelist", "./src/pages/file/FileList.tsx");
page("visitlist", "./src/pages/visit/VisitList.tsx");
page("commentlist", "./src/pages/article/CommentList.tsx");
page('themelist', './src/pages/theme/ThemeList.tsx');
page('editor', "./src/pages/editor/CodeEditor.tsx", './src/pages/editor/CodeEditor.html');

function page(name: string, tsx: string = null, template: string = "./index.html") {
    config.entry[name] = tsx.indexOf("/") > -1 ? tsx : `./src/pages/${name}/${tsx}`;
    config.plugins.push(new HtmlWebpackPlugin({
        filename: `${name}.html`,
        chunks: [name],
        inject: "body",
        minify: {
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            html5: true,
            minifyCSS: true,
            minifyJS: true
        },
        template
    }))
}

export default config;