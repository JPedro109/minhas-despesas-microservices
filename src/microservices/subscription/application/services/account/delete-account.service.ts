import { NotFoundError } from "@/shared";
import { AccountDAO, CustomerDAO, Payment } from "../../infrastructure";

export type DeleteAccountDTO = {
    accountId: string;
};

export class DeleteAccountService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly customerDAO: CustomerDAO,
        private readonly payment: Payment,
    ) {}

    async execute({ accountId }: DeleteAccountDTO): Promise<void> {
        const account = await this.accountDAO.getAccountById(accountId);

        if (!account) {
            throw new NotFoundError("A conta não existe");
        }

        const customer =
            await this.customerDAO.getCustomerByAccountId(accountId);

        await this.accountDAO.deleteAccountById(accountId);
        await this.payment.deleteCustomer(customer.customerExternalId);
    }
}
