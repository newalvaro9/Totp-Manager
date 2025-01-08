export interface Key {
    name: string,
    secret: string
}

export interface OTP {
    token: string,
    remaining: number
}

export interface ReturnReadKeys {
    success: boolean,
    keys?: Key[]
}

interface SuccessResponse {
    success: boolean;
}

export type ReturnSaveKey = SuccessResponse
export type ReturnDeleteKey = SuccessResponse
export type ReturnExportKeys = SuccessResponse

export interface ReturnImportKeys {
    success: boolean,
    reason: "" | "cancel" | "parse",
    keys: Key[]
}