import { IdentityProvider } from "../infrastructure";

export type UpdateAccountPasswordDTO = {
    identityProviderId: string;
    password: string;
};

export const updateAccountPasswordSchema = {
    identityProviderId: {
        type: "string",
        optional: false,
    },
    password: {
        type: "string",
        optional: false,
    },
};

export class UpdateAccountPasswordService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({
        identityProviderId,
        password,
    }: UpdateAccountPasswordDTO): Promise<void> {
        await this.identityProvider.updatePassword(
            identityProviderId,
            password,
        );
    }
}
