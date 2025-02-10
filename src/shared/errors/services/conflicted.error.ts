export class ConflictedError extends Error {
    constructor(paramName: string) {
        super(paramName);
        this.name = "ConflictedError";
    }
}
