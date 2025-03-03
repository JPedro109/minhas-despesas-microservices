import { Utils } from "@/shared";
import { AccountDAO, CustomerDAO, Payment } from "../../infrastructure";

export type CreateAccountDTO = {
    accountId: string;
    email: string;
};

export class CreateAccountService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly customerDAO: CustomerDAO,
        private readonly payment: Payment,
    ) {}

    async execute({ accountId, email }: CreateAccountDTO): Promise<string> {
        const databaseAccount = await this.accountDAO.createAccount({
            accountId,
            email,
        });
        let customerExternalId: string | undefined;

        try {
            customerExternalId = await this.payment.createCustomer();
            await this.customerDAO.createCustomer({
                accountId: databaseAccount.accountId,
                customerId: Utils.createUUID(),
                customerExternalId,
            });
            return databaseAccount.accountId;
        } catch (e) {
            if (customerExternalId) {
                await this.payment.deleteCustomer(customerExternalId);
            }
            await this.accountDAO.deleteAccountById(databaseAccount.accountId);
            throw e;
        }
    }
}
