const urlBase = ''
    , apiBase = urlBase + '/api';
export const Api = {
    base: apiBase,
    themeList: `${apiBase}/blog/theme/list.json`,
    captcha: `${apiBase}/content/captcha/image/comment.png`,
    commentList: `${apiBase}/content/comment/list.json`,
    commentInsert: `${apiBase}/content/comment/insert.json`,
    statisticsArticleCount: `${apiBase}/statistics/main/article.json`,
    visitDelete: `${apiBase}/statistics/visit/delete.json`,
    visitList: `${apiBase}/statistics/visit/list.json`,
    fileList: `${apiBase}/content/file/list.json`,
    urlList: `${apiBase}/content/url/list.json`,
    urlInsert: `${apiBase}/content/url/insert.json`,
    urlDelete: `${apiBase}/content/url/delete.json`,
    urlUpdate: `${apiBase}/content/url/update.json`,
    tagList: `${apiBase}/content/tag/list.json`,
    sendCode: `${apiBase}/aliyun/sms/send/login.json`,
    uEditorUpload: `${apiBase}/ueditor/ueditor/action`,
    fileInsert: `${apiBase}/content/file/insert.json`,
    articleDraft: `${apiBase}/content/article/draft.json`,
    articleInsert: `${apiBase}/content/article/insert.json`,
    articleDelete: `${apiBase}/content/article/delete.json`,
    articleUpdate: `${apiBase}/content/article/update.json`,
    articleList: `${apiBase}/content/article/list.json`,
    articleGet: `${apiBase}/content/article/get.json`,
    configUpdate: `${apiBase}/admin/config/update.json`,
    categoryUpdate: `${apiBase}/content/category/update.json`,
    categoryInsert: `${apiBase}/content/category/insert.json`,
    categoryDelete: `${apiBase}/content/category/delete.json`,
    categoryList: `${apiBase}/content/category/list.json`,
    settingList: `${apiBase}/admin/config/list.json`,
    userList: `${apiBase}/users/user/list.json`,
    userChangePassword: `${apiBase}/users/login/update/password.json`,
    userChangePhone: `${apiBase}/users/login/update/phone.json`,
    userInfo: `${apiBase}/users/login/info.json`,
    userLogIn: `${apiBase}/users/login/login.json`,
    userLogOut: `${apiBase}/users/login/logout.json`,
    userFunctions: `${apiBase}/users/login/functions.json`,
    screenLock: `${apiBase}/users/login/screen/lock.json`,
    screenUnLock: `${apiBase}/users/login/screen/unlock.json`,
    cleanCache: `${apiBase}/admin/cache/clean.json`,
    polling: `${apiBase}/admin/system/polling.json`
};
export const Url = {
    base: urlBase
};
export const Page = {};