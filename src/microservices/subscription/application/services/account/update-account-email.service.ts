import { NotFoundError } from "@/shared";
import { AccountDAO } from "../../infrastructure";

export type UpdateAccountEmailDTO = {
    accountId: string;
    email: string;
};

export class UpdateAccountEmailService {
    constructor(private readonly accountDAO: AccountDAO) {}

    async execute({ accountId, email }: UpdateAccountEmailDTO): Promise<void> {
        const account = await this.accountDAO.getAccountById(accountId);

        if (!account) {
            throw new NotFoundError("A conta não existe");
        }

        account.email = email;

        await this.accountDAO.updateAccountById(accountId, account);
    }
}
