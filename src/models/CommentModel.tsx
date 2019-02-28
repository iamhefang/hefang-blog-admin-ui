import {BaseModel} from "hefang-ui-react";

export interface CommentModel extends BaseModel {
    contentTitle: string
    contentId: string
    contentAlias: string
    floor: number
    postTime: number
    comment: string
    authorInfo: AuthorInfo
}

export interface AuthorInfo {
    nickname: string
    headImgUrl: string
    email: string
}