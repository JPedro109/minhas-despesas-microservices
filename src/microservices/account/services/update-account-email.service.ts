import { IdentityProvider } from "../infrastructure";

export type UpdateAccountEmailDTO = {
    accessToken: string;
    code: string;
};

export const updateAccountEmailSchema = {
    accessToken: {
        type: "string",
        optional: false,
    },
    code: {
        type: "string",
        optional: false,
    },
};

export class UpdateAccountEmailService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({ accessToken, code }: UpdateAccountEmailDTO): Promise<void> {
        await this.identityProvider.updateEmail(accessToken, code);
    }
}
