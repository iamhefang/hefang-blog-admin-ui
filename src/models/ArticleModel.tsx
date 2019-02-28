import {BaseModel} from "hefang-ui-react";

export interface ArticleModel extends BaseModel {
    alias?: string
    catalog?: string
    cateAlias?: string
    cateId?: string
    cateName?: string
    content?: string
    description?: string
    enable?: boolean
    id?: string
    isDraft?: boolean
    keywords?: string
    lastAlterTime?: number
    password?: string
    postTime?: number
    readCount?: number
    tags?: string[]
    title?: string
    type?: string
    covers?: string[]
    upCount?: number
}