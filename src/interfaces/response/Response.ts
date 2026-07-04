export interface IResponse {
    success: boolean,
    error: [],
    data: []
}
export class Response implements IResponse {
    success!: boolean
    error!: [];
    data!: [];

    sendResponseSuccess(data: any, status: boolean) {
        return {
            success: status,
            error: [],
            data: data
        }
    }
    sendResponseFailure(data: any, status: boolean) {
        return {
            success: status,
            error: data,
            data: []
        }
    }
}