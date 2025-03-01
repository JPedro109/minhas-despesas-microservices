import { NotFoundError } from "@/shared";
import { AccountDAO } from "../../infrastructure";

export type DeleteAccountDTO = {
    accountId: string;
};

export class DeleteAccountService {
    constructor(private readonly accountDAO: AccountDAO) {}

    async execute({ accountId }: DeleteAccountDTO): Promise<void> {
        const account = await this.accountDAO.getAccountById(accountId);

        if (!account) {
            throw new NotFoundError("A conta não existe");
        }

        await this.accountDAO.deleteAccountById(accountId);
    }
}
