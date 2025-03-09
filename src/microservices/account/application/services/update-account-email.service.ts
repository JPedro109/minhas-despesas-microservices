import { RequestSchema } from "@/shared";
import { IdentityProvider, Notification } from "../infrastructure";

export type UpdateAccountEmailDTO = {
    identityProviderId: string;
    accessToken: string;
    code: string;
};

export const updateAccountEmailSchema: RequestSchema = {
    identityProviderId: {
        type: "string",
        optional: false,
    },
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
    constructor(
        private readonly identityProvider: IdentityProvider,
        private readonly notify: Notification,
    ) {}

    async execute({
        identityProviderId,
        accessToken,
        code,
    }: UpdateAccountEmailDTO): Promise<void> {
        await this.identityProvider.updateEmail(accessToken, code);
        const data =
            await this.identityProvider.getAccountInfo(identityProviderId);
        await this.notify.sendEvent({
            event: "update:account-email",
            data: {
                accountId: data.accountId,
                email: data.email,
            },
        });
    }
}
