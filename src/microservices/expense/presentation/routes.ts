import { Middy, Utils } from "@/shared";
import {
    accountDAO,
    expenseDAO,
    extractDAO,
    paymentHistoryDAO,
    extract,
    bucket,
} from "../factories";
import {
    createExpenseSchema,
    createExtractSchema,
    deleteExpenseSchema,
    expenseUndoPaymentSchema,
    getAccountExpensesSchema,
    payExpenseSchema,
    updateExpenseSchema,
    getAccountExtractsSchema,
    CreateExpenseService,
    CreateExpenseDTO,
    CreateExtractDTO,
    DeleteExpenseDTO,
    GetAccountExpensesResponseDTO,
    ExpenseUndoPaymentDTO,
    GetAccountExpensesDTO,
    GetUserExtractsResponseDTO,
    PayExpenseDTO,
    UpdateExpenseDTO,
    CreateExtractService,
    DeleteExpenseService,
    ExpenseUndoPaymentService,
    GetAccountExpensesService,
    GetUserExtractsService,
    PayExpenseService,
    UpdateExpenseService,
    UpdatePreviousMonthPaidExpensesToUnpaidService,
} from "../services";

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

            return await new CreateExpenseService(
                accountDAO,
                expenseDAO,
            ).execute({
                ...dto,
                expenseDueDate: new Date(expenseDueDate),
            });
        },
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

            return await new GetAccountExpensesService(
                accountDAO,
                expenseDAO,
            ).execute(dto);
        },
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

            await new UpdateExpenseService(expenseDAO).execute({
                ...dto,
                expenseDueDate: new Date(expenseDueDate),
            });
        },
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

            await new DeleteExpenseService(
                expenseDAO,
                paymentHistoryDAO,
            ).execute(dto);
        },
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

            await new PayExpenseService(expenseDAO, paymentHistoryDAO).execute(
                dto,
            );
        },
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

            await new ExpenseUndoPaymentService(
                expenseDAO,
                paymentHistoryDAO,
            ).execute(dto);
        },
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

            return await new CreateExtractService(
                accountDAO,
                paymentHistoryDAO,
                extractDAO,
                extract,
                bucket,
            ).execute(dto);
        },
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

            return await new GetUserExtractsService(
                accountDAO,
                extractDAO,
            ).execute(dto);
        },
    },
    {
        path: "/expenses/unpaid-previous-month",
        method: "POST",
        successStatusCode: 204,
        handler: async (): Promise<void> => {
            await new UpdatePreviousMonthPaidExpensesToUnpaidService(
                expenseDAO,
            ).execute();
        },
    },
]);
