import {BaseModel} from "hefang-ui-react";
import {AddressInfo} from "./AddressInfo";
import {Commodity} from "./Commodity";

export interface OrderModel extends BaseModel {
    totalFee?: number
    name?: string
    orderTime?: number
    status?: string
    deliverTime?: number
    expressCompany?: string
    expressNo?: string
    finishTime?: number
    id?: string
    loginId?: string
    orderNo?: string
    payTime?: number
    title?: string
    wechatFee?: number
    wechatNo?: string
    wechatPrepayId?: string
    wxpayQrcodeUrl?: string
    addressInfo?: AddressInfo
    commodities?: Commodity[]
}

