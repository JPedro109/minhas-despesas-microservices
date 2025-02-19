import { NotFoundError, RequestSchema } from "@/shared";
import { AccountDAO, PaymentMethodDAO } from "../../infrastructure";

export type GetAccountPaymentMethodDTO = {
    accountId: string;
};

export type GetAccountPaymentMethodResponseDTO = {
    paymentMethodId: string;
    accountId: string;
    name: string;
    token: string;
};

export const getAccountPaymentMethodSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
};

export class GetAccountPaymentMethodService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly paymentMethodDAO: PaymentMethodDAO,
    ) {}

    async execute({
        accountId,
    }: GetAccountPaymentMethodDTO): Promise<GetAccountPaymentMethodResponseDTO | null> {
        const accountExists = await this.accountDAO.getAccountById(accountId);

        if (!accountExists) throw new NotFoundError("A conta não existe");

        const paymentMethod =
            await this.paymentMethodDAO.getPaymentMethodByAccountId(accountId);

        if (!paymentMethod) return null;

        return {
            paymentMethodId: paymentMethod.paymentMethodId,
            accountId: paymentMethod.accountId,
            name: paymentMethod.name,
            token: paymentMethod.token,
        };
    }
}
