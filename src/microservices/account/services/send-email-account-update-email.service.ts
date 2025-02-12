import { NotFoundError } from "@/shared";
import { IdentityProvider } from "../infrastructure";

export type SendAccountEmailUpdateEmailDTO = {
    identityProviderId: string;
    newEmail: string;
};

export const sendAccountEmailUpdateEmailSchema = {
    identityProviderId: {
        type: "string",
        optional: false,
    },
    newEmail: {
        type: "string",
        optional: false,
    },
};

export class SendAccountEmailUpdateEmailService {
    constructor(private readonly identityProvider: IdentityProvider) {}

    async execute({
        identityProviderId,
        newEmail,
    }: SendAccountEmailUpdateEmailDTO): Promise<void> {
        const accountInfo =
            await this.identityProvider.getAccountInfo(identityProviderId);

        if (!accountInfo) {
            throw new NotFoundError("A conta não exite");
        }

        await this.identityProvider.sendEmailEmailUpdate(
            accountInfo.email,
            newEmail,
        );
    }
}
