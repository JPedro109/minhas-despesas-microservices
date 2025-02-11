import { IdentityProvider } from "../infrastructure";

export type VerifyAccountEmailDTO = {
    email: string;
    code: string;
};

export const verifyAccountEmailSchema = {
    email: {
        type: "string",
        optional: false,
    },
    code: {
        type: "string",
        optional: false,
    },
};

export class VerifyAccountEmailService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({ email, code }: VerifyAccountEmailDTO): Promise<void> {
        await this.identityProvider.verifyEmail(email, code);
    }
}
