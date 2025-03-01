import { Middy, Utils } from "@/shared";
import {
    accountDAO,
    customerDAO,
    paymentMethodDAO,
    planDAO,
    subscriptionDAO,
    notification,
    payment,
} from "../factories";
import {
    createPaymentMethodSchema,
    deletePaymentMethodSchema,
    getAccountPaymentMethodSchema,
    updatePaymentMethodNameSchema,
    updatePaymentMethodTokenSchema,
    createSubscriptionSchema,
    getAccountSubscriptionSchema,
    notifyAccountOfSubscriptionPaymentFailureSchema,
    CreatePaymentMethodDTO,
    CreateSubscriptionDTO,
    DeletePaymentMethodDTO,
    GetAccountPaymentMethodResponseDTO,
    GetAccountSubscriptionDTO,
    GetAccountPaymentMethodDTO,
    GetAccountSubscriptionResponseDTO,
    NotifyAccountOfSubscriptionPaymentFailureDTO,
    GetPlanResponseDTO,
    UpdatePaymentMethodNameDTO,
    UpdatePaymentMethodTokenDTO,
    CreatePaymentMethodService,
    CreateSubscriptionService,
    DeletePaymentMethodService,
    GetAccountPaymentMethodService,
    GetAccountSubscriptionService,
    GetPlansService,
    NotifyAccountOfSubscriptionPaymentFailureService,
    UpdatePaymentMethodNameService,
    UpdatePaymentMethodTokenService,
    UpdateSubscriptionRenewalStatusDTO,
    UpdateSubscriptionRenewalStatusService,
} from "../services";

export const routes = Middy.build([
    {
        path: "/payment-methods",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { name, token } = event.body;

            const dto: CreatePaymentMethodDTO = {
                accountId: accountId as string,
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
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: DeletePaymentMethodDTO = {
                accountId: accountId as string,
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
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: GetAccountPaymentMethodDTO = {
                accountId: accountId as string,
            };
            Utils.validateRequestSchema(dto, getAccountPaymentMethodSchema);

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
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { name } = event.body;

            const dto: UpdatePaymentMethodNameDTO = {
                accountId: accountId as string,
                name,
            };
            Utils.validateRequestSchema(dto, updatePaymentMethodNameSchema);

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
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { token } = event.body;

            const dto: UpdatePaymentMethodTokenDTO = {
                accountId: accountId as string,
                token,
            };
            Utils.validateRequestSchema(dto, updatePaymentMethodTokenSchema);

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
        handler: async (): Promise<GetPlanResponseDTO[]> => {
            return await new GetPlansService(planDAO).execute();
        },
    },
    {
        path: "/subscriptions",
        method: "POST",
        successStatusCode: 201,
        handler: async (event): Promise<string> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { planId } = event.body;

            const dto: CreateSubscriptionDTO = {
                accountId: accountId as string,
                planId,
            };
            Utils.validateRequestSchema(dto, createSubscriptionSchema);

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
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: GetAccountSubscriptionDTO = {
                accountId: accountId as string,
            };
            Utils.validateRequestSchema(dto, getAccountSubscriptionSchema);

            return await new GetAccountSubscriptionService(
                accountDAO,
                subscriptionDAO,
                planDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/subscriptions/renewal",
        method: "PATCH",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { renewable } = event.body;

            const dto: UpdateSubscriptionRenewalStatusDTO = {
                accountId: accountId as string,
                renewable,
            };
            Utils.validateRequestSchema(dto, getAccountSubscriptionSchema);

            await new UpdateSubscriptionRenewalStatusService(
                subscriptionDAO,
                paymentMethodDAO,
                payment,
            ).execute(dto);
        },
    },
    {
        path: "/subscriptions/webhook",
        method: "POST",
        successStatusCode: 204,
        doNotParseJsonBody: true,
        handler: async (event): Promise<void> => {
            const payload = payment.validateWebhookRequest<{
                type: string;
                data: { object: { customer: string } };
            }>(event.body, event.headers["stripe-signature"]);

            const { type, data } = payload;

            const dto: NotifyAccountOfSubscriptionPaymentFailureDTO = {
                customerId: data.object.customer,
            };
            Utils.validateRequestSchema(
                dto,
                notifyAccountOfSubscriptionPaymentFailureSchema,
            );

            if (type === "invoice.payment_failed") {
                await new NotifyAccountOfSubscriptionPaymentFailureService(
                    customerDAO,
                    accountDAO,
                    notification,
                ).execute(dto);
            }
        },
    },
]);
