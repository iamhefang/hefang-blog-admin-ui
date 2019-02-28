import {BaseModel} from "hefang-ui-react";
import {CommodityAttribute} from "./CommodityAttribute";

export interface CommodityModel extends BaseModel {
    name?: string
    price?: number | ''
    cateId?: string
    detail?: string
    inventories?: number | ''
    saled?: number | ''
    keywords?: string
    description?: string
    cateName?: string
    cover?: string
    attributes?: CommodityAttribute
}
