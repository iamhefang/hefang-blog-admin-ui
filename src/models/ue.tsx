declare namespace UE {
    export interface Editor {
        setContent(value: string)

        getContent(): string

        ready(callback: Function)

        setHeight(height: number)

        addListener(types: string, callback: Function)
    }

    export interface UeOption {
        toolbars?: string[][]
        initialFrameHeight?: number
        initialFrameWidth?: number | string
        zIndex?: number
        initialContent?: string
        serverUrl?: string
        autoHeightEnabled?: boolean
        initialStyle?: string
        iframeCssUrl?: string
    }

    export function getEditor(selector: string, option?: UeOption): Editor


}