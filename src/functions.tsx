import {ApiResult, getSessionStorage, queryString} from "hefang-ui-react";
import {isFunction, isPlainObject} from "hefang-js";
import {UserModel} from "./models/UserModel";

export function getJSON(url: string);
export function getJSON(url: string, callback: (res: ApiResult<any>) => void);
export function getJSON(url: string, data: object, callback: (res: ApiResult<any>) => void);
export function getJSON(url: string, data?, callback?) {
    if (isFunction(data)) {
        callback = data;
        data = undefined;
    }
    fetch(url + (data ? `?${queryString(data)}` : ''), {
        method: 'GET', credentials: "same-origin"
    }).then(value => value.json()).then(callback)
}


export function post(url: string);
export function post(url: string, callback: (res: ApiResult<any>) => void);
export function post(url: string, data: object, callback: (res: ApiResult<any>) => void);
export function post(url: string, data?, callback?) {
    if (isFunction(data)) {
        callback = data;
        data = undefined;
    }
    const init: RequestInit = {method: 'POST', credentials: "same-origin"};
    if (isPlainObject(data)) {
        init.body = JSON.stringify(data);
        init.headers = {'Content-Type': 'application/json'};
    }
    fetch(url, init).then(value => value.json()).then(callback)
}


export function currentLogin(): UserModel {
    return getSessionStorage('currentLogin')
}


export function intent(url: string) {
    const frame = document.createElement('iframe') as HTMLIFrameElement;
    document.body.appendChild(frame);
    frame.style.display = 'none';
    frame.src = url;
    setTimeout(function () {
        frame.remove();
    }, 1500);
}