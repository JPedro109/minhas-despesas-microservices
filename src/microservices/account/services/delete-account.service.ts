import { RequestSchema } from "@/shared";
import { AccountDAO, IdentityProvider } from "../infrastructure";

export type DeleteAccountDTO = {
    accountId: string;
    identityProviderId: string;
};

export const deleteAccountSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    identityProviderId: {
        type: "string",
        optional: false,
    },
};

export class DeleteAccountService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly identityProvider: IdentityProvider,
    ) {}

    async execute({
        accountId,
        identityProviderId,
    }: DeleteAccountDTO): Promise<void> {
        const databaseAccount = await this.accountDAO.getAccountById(accountId);
        if (databaseAccount) {
            await this.accountDAO.deleteAccountById(accountId);
        }

        const identityProviderAccount =
            await this.identityProvider.getAccountInfo(identityProviderId);
        if (identityProviderAccount) {
            await this.identityProvider.deleteAccount(identityProviderId);
        }
    }
}
