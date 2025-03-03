import { Dynamo } from "@/shared";
import {
    AccountDAO,
    ExpenseDAO,
    ExtractDAO,
    PaymentHistoryDAO,
    Extract,
    Bucket,
    SubscriptionDAO,
} from "./infrastructure";
import { GetAccountSubscriptionService } from "./services";
import { AuthorizationAccountSubscriptionMiddleware } from "./presentation/middlewares";

const dynamo = new Dynamo("Expense");
export const accountDAO = new AccountDAO(dynamo);
export const expenseDAO = new ExpenseDAO(dynamo);
export const extractDAO = new ExtractDAO(dynamo);
export const paymentHistoryDAO = new PaymentHistoryDAO(dynamo);
export const subscriptionDAO = new SubscriptionDAO(dynamo);

export const extract = new Extract();

export const bucket = new Bucket();

export const getSubscriptionAccountService = new GetAccountSubscriptionService(
    accountDAO,
    subscriptionDAO,
);

export const authorizationAccountSubscriptionMiddleware =
    new AuthorizationAccountSubscriptionMiddleware(
        getSubscriptionAccountService,
    );
