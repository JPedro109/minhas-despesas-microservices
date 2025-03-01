import { Dynamo, SQS } from "@/shared";
import {
    AccountDAO,
    CustomerDAO,
    PaymentMethodDAO,
    PlanDAO,
    SubscriptionDAO,
    Notification,
    Payment,
} from "./infrastructure";

const dynamo = new Dynamo("Subscription");
export const accountDAO = new AccountDAO(dynamo);
export const customerDAO = new CustomerDAO(dynamo);
export const paymentMethodDAO = new PaymentMethodDAO(dynamo);
export const planDAO = new PlanDAO(dynamo);
export const subscriptionDAO = new SubscriptionDAO(dynamo);

const sqs = new SQS();
export const notification = new Notification(sqs);

export const payment = new Payment();
