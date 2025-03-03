import {
    CreateAccountService,
    CreatePaymentMethodService,
    CreateSubscriptionService,
    DeleteAccountService,
    DeletePaymentMethodService,
    GetAccountPaymentMethodService,
    GetAccountSubscriptionService,
    GetPlansService,
    NotifyAccountOfSubscriptionPaymentFailureService,
    UpdateAccountEmailService,
    UpdatePaymentMethodNameService,
    UpdatePaymentMethodTokenService,
    UpdateSubscriptionRenewalStatusService,
} from "../services";
import {
    accountDAO,
    customerDAO,
    notification,
    payment,
    paymentMethodDAO,
    planDAO,
    subscriptionDAO,
} from "./infrastructure";

// Account
export const createAccountService = new CreateAccountService(
    accountDAO,
    customerDAO,
    payment,
);
export const updateAccountEmailService = new UpdateAccountEmailService(
    accountDAO,
);
export const deleteAccountService = new DeleteAccountService(
    accountDAO,
    customerDAO,
    payment,
);

// Plan
export const getPlansService = new GetPlansService(planDAO);

// Payment Method
export const createPaymentMethodService = new CreatePaymentMethodService(
    accountDAO,
    customerDAO,
    paymentMethodDAO,
    payment,
);
export const getAccountPaymentMethodService =
    new GetAccountPaymentMethodService(accountDAO, paymentMethodDAO);
export const updatePaymentMethodNameService =
    new UpdatePaymentMethodNameService(paymentMethodDAO);
export const updatePaymentMethodTokenService =
    new UpdatePaymentMethodTokenService(paymentMethodDAO, customerDAO, payment);
export const deletePaymentMethodService = new DeletePaymentMethodService(
    paymentMethodDAO,
    subscriptionDAO,
    payment,
);

// Subscription
export const createSubscriptionService = new CreateSubscriptionService(
    customerDAO,
    paymentMethodDAO,
    planDAO,
    subscriptionDAO,
    payment,
    notification,
);
export const getAccountSubscriptionService = new GetAccountSubscriptionService(
    accountDAO,
    subscriptionDAO,
    planDAO,
    payment,
);
export const updateSubscriptionRenewalStatusService =
    new UpdateSubscriptionRenewalStatusService(
        subscriptionDAO,
        paymentMethodDAO,
        payment,
    );
export const notifyAccountOfSubscriptionPaymentFailureService =
    new NotifyAccountOfSubscriptionPaymentFailureService(
        customerDAO,
        accountDAO,
        subscriptionDAO,
        notification,
    );
