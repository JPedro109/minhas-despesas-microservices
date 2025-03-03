import { getSubscriptionAccountService } from "../factories";
import { AuthorizationAccountSubscriptionMiddleware } from "../presentation/middlewares";

export const authorizationAccountSubscriptionMiddleware =
    new AuthorizationAccountSubscriptionMiddleware(
        getSubscriptionAccountService,
    );
