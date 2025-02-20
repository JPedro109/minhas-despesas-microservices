import { NotFoundError, RequestSchema } from "@/shared";
import { PaymentMethodDAO } from "../../infrastructure";

export type UpdatePaymentMethodNameDTO = {
    accountId: string;
    name: string;
};

export const updatePaymentMethodNameSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
    name: {
        type: "string",
        optional: false,
    },
};

export class UpdatePaymentMethodNameService {
    constructor(private readonly paymentMethodDAO: PaymentMethodDAO) {}

    async execute({
        accountId,
        name,
    }: UpdatePaymentMethodNameDTO): Promise<void> {
        const paymentMethod =
            await this.paymentMethodDAO.getPaymentMethodByAccountId(accountId);
        if (!paymentMethod) {
            throw new NotFoundError("Esse método de pagamento não existe");
        }

        paymentMethod.name = name;
        await this.paymentMethodDAO.updatePaymentMethodByAccountIdAndPaymentMethodId(
            paymentMethod.accountId,
            paymentMethod.paymentMethodId,
            paymentMethod,
        );
    }
}
