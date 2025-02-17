import { RequestSchema, Utils } from "@/shared";
import {
    AccountConsentDAO,
    AccountDAO,
    IdentityProvider,
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

        try {
            await this.accountConsentDAO.createAccountConsent({
                accountConsentId: Utils.createUUID(),
                accountId: databaseAccount.accountId,
                consentVersion,
                ipAddress,
                userAgent,
            });

            await this.identityProvider.createAccount(
                databaseAccount.accountId,
                email,
                password,
            );

            return databaseAccount.accountId;
        } catch (error) {
            await this.accountDAO.deleteAccountById(databaseAccount.accountId);
            throw error;
        }
    }
}
