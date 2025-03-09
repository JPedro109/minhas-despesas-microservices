export class NotFoundError extends Error {
    constructor(paramName: string) {
        super(paramName);
        this.name = "NotFoundError";
    }
}
