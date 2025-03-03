import { Middy, Utils } from "@/shared";
import {
    authorizationAccountSubscriptionMiddleware,
    createExpenseService,
    getAccountExpensesService,
    updateExpenseService,
    deleteExpenseService,
    payExpenseService,
    expenseUndoPaymentService,
    createExtractService,
    getUserExtractsService,
    updatePreviousMonthPaidExpensesToUnpaidService,
    createExpenseSchema,
    createExtractSchema,
    deleteExpenseSchema,
    expenseUndoPaymentSchema,
    getAccountExpensesSchema,
    payExpenseSchema,
    updateExpenseSchema,
    getAccountExtractsSchema,
    CreateExpenseDTO,
    CreateExtractDTO,
    DeleteExpenseDTO,
    GetAccountExpensesResponseDTO,
    ExpenseUndoPaymentDTO,
    GetAccountExpensesDTO,
    GetUserExtractsResponseDTO,
    PayExpenseDTO,
    UpdateExpenseDTO,
} from "../application";

export const routes = Middy.build([
    {
        path: "/expenses",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { expenseName, expenseValue, expenseDueDate } = event.body;

            const dto: CreateExpenseDTO = {
                accountId: accountId as string,
                expenseName,
                expenseValue,
                expenseDueDate,
            };
            Utils.validateRequestSchema(dto, createExpenseSchema);

            return await createExpenseService.execute({
                ...dto,
                expenseDueDate: new Date(expenseDueDate),
            });
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/expenses",
        method: "GET",
        successStatusCode: 200,
        handler: async (event): Promise<GetAccountExpensesResponseDTO[]> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: GetAccountExpensesDTO = {
                accountId: accountId as string,
            };
            Utils.validateRequestSchema(dto, getAccountExpensesSchema);

            return await getAccountExpensesService.execute(dto);
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/expenses/{expenseId}",
        method: "PUT",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { expenseId } = event.pathParameters;
            const { expenseName, expenseValue, expenseDueDate } = event.body;

            const dto: UpdateExpenseDTO = {
                accountId: accountId as string,
                expenseId,
                expenseName,
                expenseValue: expenseValue,
                expenseDueDate: expenseDueDate,
            };

            Utils.validateRequestSchema(dto, updateExpenseSchema);

            await updateExpenseService.execute({
                ...dto,
                expenseDueDate: new Date(expenseDueDate),
            });
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/expenses/{expenseId}",
        method: "DELETE",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { expenseId } = event.pathParameters;

            const dto: DeleteExpenseDTO = {
                accountId: accountId as string,
                expenseId,
                deleteExpensePaymentHistory:
                    event.queryStringParameters?.deleteExpensePaymentHistory ===
                    "true",
            };
            Utils.validateRequestSchema(dto, deleteExpenseSchema);

            await deleteExpenseService.execute(dto);
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/expenses/pay/{expenseId}",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { expenseId } = event.pathParameters;

            const dto: PayExpenseDTO = {
                accountId: accountId as string,
                expenseId,
            };
            Utils.validateRequestSchema(dto, payExpenseSchema);

            await payExpenseService.execute(dto);
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/expenses/undo-payment/{expenseId}",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { expenseId } = event.pathParameters;

            const dto: ExpenseUndoPaymentDTO = {
                accountId: accountId as string,
                expenseId,
            };
            Utils.validateRequestSchema(dto, expenseUndoPaymentSchema);

            await expenseUndoPaymentService.execute(dto);
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/extracts",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { referenceMonth, referenceYear } = event.body;

            const dto: CreateExtractDTO = {
                accountId: accountId as string,
                referenceMonth: referenceMonth,
                referenceYear: referenceYear,
            };
            Utils.validateRequestSchema(dto, createExtractSchema);

            return createExtractService.execute(dto);
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/extracts",
        method: "GET",
        successStatusCode: 200,
        handler: async (event): Promise<GetUserExtractsResponseDTO[]> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto = { accountId: accountId as string };

            Utils.validateRequestSchema(dto, getAccountExtractsSchema);

            return getUserExtractsService.execute(dto);
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
    {
        path: "/expenses/unpaid-previous-month",
        method: "POST",
        successStatusCode: 204,
        handler: async (): Promise<void> => {
            await updatePreviousMonthPaidExpensesToUnpaidService.execute();
        },
        middlewares: [
            authorizationAccountSubscriptionMiddleware.handler.bind(
                authorizationAccountSubscriptionMiddleware,
            ),
        ],
    },
]);
