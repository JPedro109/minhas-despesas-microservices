export class InvalidParamError extends Error {
    constructor(paramName: string) {
        super(paramName);
        this.name = "InvalidParamError";
    }
}
