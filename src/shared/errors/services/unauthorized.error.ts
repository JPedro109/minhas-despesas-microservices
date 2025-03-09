export class UnauthorizedError extends Error {
    constructor(paramName: string) {
        super(paramName);
        this.name = "UnauthorizedError";
    }
}
