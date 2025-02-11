import { randomUUID } from "node:crypto";

export class Utils {
    static createUUID(): string {
        return randomUUID();
    }
}
