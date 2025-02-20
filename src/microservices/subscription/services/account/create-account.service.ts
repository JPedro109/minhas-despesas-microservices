import { RequestSchema } from "@/shared";
import { AccountDAO, CustomerDAO, Payment } from "../../infrastructure";

export type CreateAccountDTO = {
    accountId: string;
    email: string;
};

export const createAccountSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    email: {
        type: "string",
        optional: false,
    },
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
        let customerId: string | undefined;

        try {
            customerId = await this.payment.createCustomer();
            await this.customerDAO.createCustomer({
                accountId: databaseAccount.accountId,
                customerId,
            });
            return databaseAccount.accountId;
        } catch (e) {
            if (customerId) {
                await this.payment.deleteCustomer(customerId);
            }
            await this.accountDAO.deleteAccountById(databaseAccount.accountId);
            throw e;
        }
    }
}
