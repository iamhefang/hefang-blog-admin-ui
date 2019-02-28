import {BaseModel} from "hefang-ui-react";

export interface FileModel extends BaseModel {
    fileName?: string
    size?: number
    mimeType?: string
    loginId?: string
    uploadTime?: number
    uploadFrom?: string
    isSecret?: boolean
}