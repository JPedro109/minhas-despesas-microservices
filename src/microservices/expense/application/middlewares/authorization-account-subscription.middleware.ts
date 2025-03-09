import { ForbiddenError, Request } from "@/shared";
import { GetAccountSubscriptionService } from "../services";

export class AuthorizationAccountSubscriptionMiddleware {
    constructor(
        private readonly getAccountSubscription: GetAccountSubscriptionService,
    ) {}

    async handler(request: Request): Promise<void> {
        const { ["account_id"]: accountId } =
            request.event.requestContext.authorizer.jwt.claims;

        const subscription = await this.getAccountSubscription.execute({
            accountId: accountId as string,
        });

        if (!subscription.subscriptionStatus) {
            throw new ForbiddenError("Sua assinatura não está ativa");
        }
    }
}
