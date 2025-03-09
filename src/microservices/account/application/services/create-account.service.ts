import { RequestSchema, Utils } from "@/shared";
import {
    AccountConsentDAO,
    AccountDAO,
    IdentityProvider,
    Notification,
} from "../infrastructure";

export type CreateAccountDTO = {
    email: string;
    password: string;
    consentVersion: string;
    ipAddress: string;
    userAgent: string;
};

export const createAccountSchema: RequestSchema = {
    email: {
        type: "string",
        optional: false,
    },
    password: {
        type: "string",
        optional: false,
    },
    consentVersion: {
        type: "string",
        optional: false,
    },
};

export class CreateAccountService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly accountConsentDAO: AccountConsentDAO,
        private readonly identityProvider: IdentityProvider,
        private readonly notify: Notification,
    ) {}

    async execute({
        email,
        password,
        consentVersion,
        userAgent,
        ipAddress,
    }: CreateAccountDTO): Promise<string> {
        const databaseAccount = await this.accountDAO.createAccount({
            accountId: Utils.createUUID(),
        });

        let identityProviderId: string;
        try {
            await this.accountConsentDAO.createAccountConsent({
                accountConsentId: Utils.createUUID(),
                accountId: databaseAccount.accountId,
                consentVersion,
                ipAddress,
                userAgent,
            });

            identityProviderId = await this.identityProvider.createAccount(
                databaseAccount.accountId,
                email,
                password,
            );

            await this.notify.sendEvent({
                event: "create:account",
                data: {
                    accountId: databaseAccount.accountId,
                    email,
                },
            });

            return databaseAccount.accountId;
        } catch (error) {
            if (identityProviderId) {
                await this.identityProvider.deleteAccount(identityProviderId);
            }
            await this.accountDAO.deleteAccountById(databaseAccount.accountId);
            throw error;
        }
    }
}
