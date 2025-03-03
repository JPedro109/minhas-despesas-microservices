import { AccountDAO } from "../../infrastructure";

export type CreateAccountDTO = {
    accountId: string;
    email: string;
};

export class CreateAccountService {
    constructor(private readonly accountDAO: AccountDAO) {}

    async execute({ accountId, email }: CreateAccountDTO): Promise<string> {
        const databaseAccount = await this.accountDAO.createAccount({
            accountId,
            email,
        });
        return databaseAccount.accountId;
    }
}
