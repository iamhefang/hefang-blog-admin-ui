import {SqlSort} from "hefang-ui-react";

export interface ListParams {
    pageIndex?: number
    pageSize?: number,
    search?: string
    sort?: SqlSort,
    tag?: string
    type?: string
}