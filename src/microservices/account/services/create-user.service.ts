import { Utils } from "@/shared";
import {
    AccountConsentDAO,
    AccountDAO,
    AccountModel,
    IdentityProvider,
} from "../infrastructure";

export type CreateUserDTO = {
    email: string;
    password: string;
    consentVersion: string;
    ipAddress: string;
    userAgent: string;
};

export const createUserSchema = {
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
    userAgent: {
        type: "string",
        optional: false,
    },
    ipAddress: {
        type: "string",
        optional: false,
    },
};

export class CreateUserService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly accountConsentDAO: AccountConsentDAO,
        private readonly identityProvider: IdentityProvider,
    ) {}

    async execute({
        email,
        password,
        consentVersion,
        userAgent,
        ipAddress,
    }: CreateUserDTO): Promise<string> {
        const databaseAccount = await this.accountDAO.createAccount({
            accountId: Utils.createUUID(),
        });

        let identityProviderId: string | null;
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

            return databaseAccount.accountId;
        } catch (error) {
            await this.rollback(databaseAccount, identityProviderId);
            throw error;
        }
    }

    private async rollback(
        account: AccountModel | null,
        identityProviderId: string | null,
    ): Promise<void> {
        if (account) {
            await this.accountDAO.deleteAccountById(account.accountId);
        }

        if (identityProviderId) {
            await this.identityProvider.deleteAccount(identityProviderId);
        }
    }
}
