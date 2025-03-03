import {
    CreateAccountService,
    CreateExpenseService,
    CreateExtractService,
    CreateSubscriptionService,
    DeleteAccountService,
    DeleteExpenseService,
    ExpenseUndoPaymentService,
    GetAccountExpensesService,
    GetAccountSubscriptionService,
    GetUserExtractsService,
    PayExpenseService,
    UpdateAccountEmailService,
    UpdateExpenseService,
    UpdatePreviousMonthPaidExpensesToUnpaidService,
    UpdateSubscriptionService,
} from "../services";
import {
    accountDAO,
    bucket,
    expenseDAO,
    extract,
    extractDAO,
    paymentHistoryDAO,
    subscriptionDAO,
} from ".";

// Account
export const createAccountService = new CreateAccountService(accountDAO);
export const updateAccountEmailService = new UpdateAccountEmailService(
    accountDAO,
);
export const deleteAccountService = new DeleteAccountService(accountDAO);

// Expense
export const createExpenseService = new CreateExpenseService(
    accountDAO,
    expenseDAO,
);
export const getAccountExpensesService = new GetAccountExpensesService(
    accountDAO,
    expenseDAO,
);
export const updateExpenseService = new UpdateExpenseService(expenseDAO);
export const deleteExpenseService = new DeleteExpenseService(
    expenseDAO,
    paymentHistoryDAO,
);
export const payExpenseService = new PayExpenseService(
    expenseDAO,
    paymentHistoryDAO,
);
export const expenseUndoPaymentService = new ExpenseUndoPaymentService(
    expenseDAO,
    paymentHistoryDAO,
);
export const updatePreviousMonthPaidExpensesToUnpaidService =
    new UpdatePreviousMonthPaidExpensesToUnpaidService(expenseDAO);

// Extract
export const createExtractService = new CreateExtractService(
    accountDAO,
    paymentHistoryDAO,
    extractDAO,
    extract,
    bucket,
);
export const getUserExtractsService = new GetUserExtractsService(
    accountDAO,
    extractDAO,
);

// Subscription
export const createSubscriptionService = new CreateSubscriptionService(
    subscriptionDAO,
);
export const getSubscriptionAccountService = new GetAccountSubscriptionService(
    accountDAO,
    subscriptionDAO,
);
export const updateSubscriptionService = new UpdateSubscriptionService(
    subscriptionDAO,
);
