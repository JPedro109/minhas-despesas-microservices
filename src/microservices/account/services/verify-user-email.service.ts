import { IdentityProvider } from "../infrastructure";

export type VerifyUserEmailDTO = {
    email: string;
    code: string;
};

export const verifyUserEmailSchema = {
    email: {
        type: "string",
        optional: false,
    },
    code: {
        type: "string",
        optional: false,
    },
};

export class VerifyUserEmailService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({ email, code }: VerifyUserEmailDTO): Promise<void> {
        await this.identityProvider.verifyEmail(email, code);
    }
}
