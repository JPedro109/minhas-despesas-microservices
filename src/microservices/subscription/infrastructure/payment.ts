import { envs, UnauthorizedError } from "@/shared";

import { Stripe } from "stripe";

type SubscriptionData = {
    active: boolean;
    renewable: boolean;
    startDate: Date;
    endDate: Date;
};

export class Payment {
    public readonly stripe = new Stripe(envs.stripeSecretKey);

    public async createCustomer(): Promise<string> {
        const customer = await this.stripe.customers.create();

        return customer.id;
    }

    public async deleteCustomer(customerId: string): Promise<void> {
        await this.stripe.customers.del(customerId);
    }

    public async attachmentPaymentMethodInCustomer(
        customerId: string,
        token: string,
    ): Promise<string> {
        const paymentMethod = await this.stripe.paymentMethods.attach(token, {
            customer: customerId,
        });

        return paymentMethod.id;
    }

    public async detachmentPaymentMethodInCustomerByToken(
        token: string,
    ): Promise<void> {
        await this.stripe.paymentMethods.detach(token);
    }

    public async createSubscription(
        customerId: string,
        planExternalId: string,
        paymentMethod: string,
    ): Promise<string> {
        const subscription = await this.stripe.subscriptions.create({
            customer: customerId,
            items: [
                {
                    price: planExternalId,
                },
            ],
            default_payment_method: paymentMethod,
        });

        return subscription.id;
    }

    public async getSubscriptionBySubscriptionExternalId(
        subscriptionExternalId: string,
    ): Promise<SubscriptionData> {
        const subscription = await this.stripe.subscriptions.retrieve(
            subscriptionExternalId,
        );

        return {
            active: subscription.status === "active",
            renewable: !subscription.cancel_at_period_end,
            startDate: new Date(subscription.current_period_start * 1000),
            endDate: new Date(subscription.current_period_end * 1000),
        };
    }

    public async updateSubscriptionRenewable(
        subscriptionId: string,
        renewable: boolean,
    ): Promise<void> {
        await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: !renewable,
        });
    }

    async deleteSubscription(subscriptionExternalId: string): Promise<void> {
        await this.stripe.subscriptions.cancel(subscriptionExternalId);
    }

    validateWebhookRequest<T>(body: object, signature: string): T {
        try {
            return this.stripe.webhooks.constructEvent(
                body as unknown as string,
                signature,
                envs.webhookSecret,
            ) as T;
        } catch (e) {
            throw new UnauthorizedError(e.message);
        }
    }

    async payExpiredSubscriptionIfAny(
        customerId: string,
        token: string,
    ): Promise<void> {
        const invoices = await this.stripe.invoices.list({
            limit: 1,
            customer: customerId,
            status: "open",
        });

        if (invoices.data.length > 0) {
            const invoice = invoices.data[0];
            this.stripe.invoices.pay(invoice.id, {
                payment_method: token,
            });
        }
    }

    public async deleteAllCustomers(): Promise<void> {
        const customers = await this.stripe.customers.list({
            limit: 100,
        });

        for (const customer of customers.data) {
            if (customer.id) {
                await this.stripe.customers.del(customer.id);
            }
        }
    }
}
