import { NotFoundError, RequestSchema } from "@/shared";
import { AccountDAO } from "../../infrastructure";

export type UpdateAccountDTO = {
    accountId: string;
    email: string;
};

export const updateAccountSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    email: {
        type: "string",
        optional: false,
    },
};

export class UpdateAccountEmailService {
    constructor(private readonly accountDAO: AccountDAO) {}

    async execute({ accountId, email }: UpdateAccountDTO): Promise<void> {
        const account = await this.accountDAO.getAccountById(accountId);

        if (!account) {
            throw new NotFoundError("A conta não existe");
        }

        account.email = email;

        await this.accountDAO.updateAccountById(accountId, account);
    }
}
