import {BaseModel} from "hefang-ui-react";

export interface VisitModel extends BaseModel {
    url: string
    visitTime: string
    ip: string
    userAgent: string
    referer: string
}