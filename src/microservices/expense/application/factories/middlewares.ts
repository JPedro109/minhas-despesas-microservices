import { getSubscriptionAccountService } from ".";
import { AuthorizationAccountSubscriptionMiddleware } from "../middlewares";

export const authorizationAccountSubscriptionMiddleware =
    new AuthorizationAccountSubscriptionMiddleware(
        getSubscriptionAccountService,
    );
