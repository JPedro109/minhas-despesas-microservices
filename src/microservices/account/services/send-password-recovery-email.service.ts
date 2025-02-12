import { IdentityProvider } from "../infrastructure";

export type SendPasswordRecoveryEmailDTO = {
    email: string;
};

export const sendPasswordRecoveryEmailSchema = {
    email: {
        type: "string",
        optional: false,
    },
};

export class SendPasswordRecoveryEmailService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({ email }: SendPasswordRecoveryEmailDTO): Promise<void> {
        await this.identityProvider.sendRecoveryPasswordEmail(email);
    }
}
