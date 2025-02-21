import { RequestSchema } from "@/shared";
import { AccountDAO } from "../../infrastructure";

export type CreateAccountDTO = {
    accountId: string;
};

export const createAccountSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
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
