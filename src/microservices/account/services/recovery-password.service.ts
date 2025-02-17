import { RequestSchema } from "@/shared";
import { IdentityProvider } from "../infrastructure";

export type RecoveryPasswordDTO = {
    email: string;
    code: string;
    newPassword: string;
};

export const recoveryPasswordSchema: RequestSchema = {
    email: {
        type: "string",
        optional: false,
    },
    code: {
        type: "string",
        optional: false,
    },
    newPassword: {
        type: "string",
        optional: false,
    },
};

export class RecoveryPasswordService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({
        email,
        code,
        newPassword,
    }: RecoveryPasswordDTO): Promise<void> {
        await this.identityProvider.recoveryPassword(email, code, newPassword);
    }
}
