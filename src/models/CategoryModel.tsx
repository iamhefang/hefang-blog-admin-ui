import {BaseModel} from "hefang-ui-react";

export interface CategoryModel extends BaseModel {
    alias: string
    name: string
    keywords: string
    description: string
    type: string
    enable?: boolean
}