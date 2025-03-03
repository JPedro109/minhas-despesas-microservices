import { AccountDAO } from "../../infrastructure";

export type CreateAccountDTO = {
    accountId: string;
};

export class CreateAccountService {
    constructor(private readonly accountDAO: AccountDAO) {}

    async execute({ accountId }: CreateAccountDTO): Promise<string> {
        const databaseAccount = await this.accountDAO.createAccount({
            accountId,
        });

        return databaseAccount.accountId;
    }
}
