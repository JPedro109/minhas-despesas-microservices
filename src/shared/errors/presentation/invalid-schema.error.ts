export class InvalidRequestSchemaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidRequestSchemaError";
    }
}
