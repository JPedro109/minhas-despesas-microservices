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

    async getPlanById(planId: string): Promise<PlanModel | null> {
        const item = await this.dynamo.getOne<PlanDynamoModel>(
            `${PlanDAO.entity}#${planId}`,
            `${PlanDAO.entity}#${planId}`,
        );

        if (!item) return null;

        return {
            planId: item.PlanId,
            name: item.Name,
            description: item.Description,
            amount: item.Amount,
            durationInDays: item.DurationInDays,
            planExternalId: item.PlanExternalId,
            createdAt: item.CreatedAt,
            updatedAt: item.UpdatedAt,
        };
    }
}
