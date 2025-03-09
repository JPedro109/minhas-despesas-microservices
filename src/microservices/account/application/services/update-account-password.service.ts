import { RequestSchema } from "@/shared";
import { IdentityProvider } from "../infrastructure";

export type UpdateAccountPasswordDTO = {
    identityProviderId: string;
    newPassword: string;
};

export const updateAccountPasswordSchema: RequestSchema = {
    identityProviderId: {
        type: "string",
        optional: false,
    },
    newPassword: {
        type: "string",
        optional: false,
    },
};

export class UpdateAccountPasswordService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({
        identityProviderId,
        newPassword,
    }: UpdateAccountPasswordDTO): Promise<void> {
        await this.identityProvider.updatePassword(
            identityProviderId,
            newPassword,
        );
    }
}
