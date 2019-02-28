import {BaseModel} from "hefang-ui-react";
import {ConfigModel} from "./ConfigModel";

export interface ThemeModel extends BaseModel {
    author: { name: string, email: string, blog: string }
    name: string
    version: string
    cover: string
    keywords: string[]
    description: string
    url: string
    current: boolean
    configs: ConfigModel[]
}