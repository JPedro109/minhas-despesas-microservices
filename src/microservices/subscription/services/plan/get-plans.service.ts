import { PlanDAO } from "../../infrastructure";

export type PlanResponseDTO = {
    planId: string;
    planName: string;
    planAmount: number;
    durationInDays: number;
    planDescription: string;
};

export class GetPlansService {
    constructor(private readonly planDAO: PlanDAO) {}

    async execute(): Promise<PlanResponseDTO[]> {
        const plans = await this.planDAO.getPlans();

        return plans.map((x) => ({
            planId: x.planId,
            planName: x.name,
            planAmount: x.amount,
            durationInDays: x.durationInDays,
            planDescription: x.description,
        }));
    }
}
