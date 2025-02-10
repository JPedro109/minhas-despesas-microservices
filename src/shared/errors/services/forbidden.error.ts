export class ForbiddenError extends Error {
    constructor(paramName: string) {
        super(paramName);
        this.name = "ForbiddenError";
    }
}
