import { Dynamo, Middy, SQS, Utils } from "@/shared";
import {
    AccountDAO,
    CustomerDAO,
    PaymentMethodDAO,
    PlanDAO,
    SubscriptionDAO,
    Notification,
    Payment,
} from "./infrastructure";
import {
    CreatePaymentMethodDTO,
    createPaymentMethodSchema,
    CreatePaymentMethodService,
    CreateSubscriptionDTO,
    CreateSubscriptionService,
    DeletePaymentMethodDTO,
    deletePaymentMethodSchema,
    DeletePaymentMethodService,
    GetAccountPaymentMethodDTO,
    GetAccountPaymentMethodResponseDTO,
    GetAccountPaymentMethodService,
    GetAccountSubscriptionDTO,
    GetAccountSubscriptionResponseDTO,
    GetAccountSubscriptionService,
    GetPlansService,
    NotifyUserOfSubscriptionPaymentFailureDTO,
    NotifyUserOfSubscriptionPaymentFailureUseCase,
    PlanResponseDTO,
    UpdatePaymentMethodNameDTO,
    UpdatePaymentMethodNameService,
    UpdatePaymentMethodTokenDTO,
    UpdatePaymentMethodTokenService,
} from "./services";

const dynamo = new Dynamo("Subscription");
const accountDAO = new AccountDAO(dynamo);
const customerDAO = new CustomerDAO(dynamo);
const paymentMethodDAO = new PaymentMethodDAO(dynamo);
const planDAO = new PlanDAO(dynamo);
const subscriptionDAO = new SubscriptionDAO(dynamo);

const sqs = new SQS();
const notification = new Notification(sqs);

const payment = new Payment();

export const handler = Middy.build([
    {
        path: "/payment-methods",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { accountId, name, token } = event.body;

            const dto: CreatePaymentMethodDTO = {
                accountId,
                name,
                token,
            };
            Utils.validateRequestSchema(dto, createPaymentMethodSchema);

            return await new CreatePaymentMethodService(
                accountDAO,
                customerDAO,
                paymentMethodDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/payment-methods",
        method: "DELETE",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { accountId } = event.body;

            const dto: DeletePaymentMethodDTO = {
                accountId,
            };
            Utils.validateRequestSchema(dto, deletePaymentMethodSchema);

            await new DeletePaymentMethodService(
                paymentMethodDAO,
                subscriptionDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/payment-methods",
        method: "GET",
        successStatusCode: 200,
        handler: async (
            event,
        ): Promise<GetAccountPaymentMethodResponseDTO | null> => {
            const { accountId } = event.body;

            const dto: GetAccountPaymentMethodDTO = {
                accountId,
            };
            Utils.validateRequestSchema(dto, deletePaymentMethodSchema);

            return await new GetAccountPaymentMethodService(
                accountDAO,
                paymentMethodDAO,
            ).execute(dto);
        },
    },
    {
        path: "/payment-methods/name",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { accountId, name } = event.body;

            const dto: UpdatePaymentMethodNameDTO = {
                accountId,
                name,
            };
            Utils.validateRequestSchema(dto, deletePaymentMethodSchema);

            await new UpdatePaymentMethodNameService(paymentMethodDAO).execute(
                dto,
            );
        },
    },
    {
        path: "/payment-methods/token",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { accountId, token } = event.body;

            const dto: UpdatePaymentMethodTokenDTO = {
                accountId,
                token,
            };
            Utils.validateRequestSchema(dto, deletePaymentMethodSchema);

            await new UpdatePaymentMethodTokenService(
                paymentMethodDAO,
                customerDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/plans",
        method: "GET",
        successStatusCode: 200,
        handler: async (): Promise<PlanResponseDTO[]> => {
            return await new GetPlansService(planDAO).execute();
        },
    },
    {
        path: "/subscriptions",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { accountId, planId } = event.body;

            const dto: CreateSubscriptionDTO = {
                accountId,
                planId,
            };
            Utils.validateRequestSchema(dto, createPaymentMethodSchema);

            return await new CreateSubscriptionService(
                customerDAO,
                paymentMethodDAO,
                planDAO,
                subscriptionDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/subscriptions",
        method: "GET",
        successStatusCode: 200,
        handler: async (event): Promise<GetAccountSubscriptionResponseDTO> => {
            const { accountId } = event.body;

            const dto: GetAccountSubscriptionDTO = {
                accountId,
            };
            Utils.validateRequestSchema(dto, createPaymentMethodSchema);

            return await new GetAccountSubscriptionService(
                accountDAO,
                subscriptionDAO,
                planDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/subscriptions/notify-payment-failed",
        method: "POST",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { customerId } = event.body;

            const dto: NotifyUserOfSubscriptionPaymentFailureDTO = {
                customerId,
            };
            Utils.validateRequestSchema(dto, createPaymentMethodSchema);

            await new NotifyUserOfSubscriptionPaymentFailureUseCase(
                customerDAO,
                accountDAO,
                notification,
            ).execute(dto);
        },
    },
]);
