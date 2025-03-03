import { NotFoundError, RequestSchema } from "@/shared";
import { AccountDAO, SubscriptionDAO } from "../../infrastructure";

export type GetAccountSubscriptionDTO = {
    accountId: string;
};

export type GetAccountSubscriptionResponseDTO = {
    subscriptionId: string;
    accountId: string;
    subscriptionStatus: boolean;
};

export const getAccountSubscriptionSchema: RequestSchema = {
    accountId: {
        type: "string",
        optional: false,
    },
};

export class GetAccountSubscriptionService {
    constructor(
        private readonly accountDAO: AccountDAO,
        private readonly subscriptionDAO: SubscriptionDAO,
    ) {}

    async execute({
        accountId,
    }: GetAccountSubscriptionDTO): Promise<GetAccountSubscriptionResponseDTO> {
        const accountExists = await this.accountDAO.getAccountById(accountId);
        if (!accountExists) {
            throw new NotFoundError("A conta não existe");
        }

        const subscription =
            await this.subscriptionDAO.getSubscriptionByAccountId(accountId);
        if (!subscription) {
            throw new NotFoundError("A conta não tem uma assinatura");
        }

        return {
            accountId: subscription.accountId,
            subscriptionId: subscription.subscriptionId,
            subscriptionStatus: subscription.active,
        };
    }
}
