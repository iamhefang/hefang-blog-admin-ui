import {BaseModel} from "hefang-ui-react";

export interface UrlModel extends BaseModel {
    url?: string
    visitCount?: number
    expiresIn?: number
    disposable?: boolean
}