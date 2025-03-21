import { Dynamo } from "@/shared";

export type PlanDynamoModel = {
    PlanId: string;
    Name: string;
    Description: string;
    Amount: number;
    DurationInDays: number;
    PlanExternalId: string;
    CreatedAt: Date;
    UpdatedAt: Date;
};

export type PlanModel = {
    planId: string;
    name: string;
    description: string;
    amount: number;
    durationInDays: number;
    planExternalId: string;
    createdAt: Date;
    updatedAt: Date;
};

export class PlanDAO {
    static entity: string = "Plan";

    constructor(private readonly dynamo: Dynamo) {}

    async getPlans(): Promise<PlanModel[]> {
        const items = await this.dynamo.get<PlanDynamoModel>("PLANS");

        if (!items.length) return [];

        return items.map((item) => ({
            planId: item.PlanId,
            name: item.Name,
            description: item.Description,
            amount: item.Amount,
            durationInDays: item.DurationInDays,
            planExternalId: item.PlanExternalId,
            createdAt: item.CreatedAt,
            updatedAt: item.UpdatedAt,
        }));
    }

    async getPlanById(planId: string): Promise<PlanModel | null> {
        const item = await this.dynamo.getOne<PlanDynamoModel>(
            "PLANS",
            `${planId}`,
        );

        if (!item) return null;

        return {
            planId: item.PlanId,
            name: item.Name,
            description: item.Description,
            amount: item.Amount,
            durationInDays: item.DurationInDays,
            planExternalId: item.PlanExternalId,
            createdAt: new Date(item.CreatedAt),
            updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt) : null,
        };
    }
}
