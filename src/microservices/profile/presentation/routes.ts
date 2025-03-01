import { Middy, Utils } from "@/shared";
import {
    getProfileSchema,
    updateProfileSchema,
    GetProfileDTO,
    GetProfileResponseDTO,
    UpdateProfileDTO,
    GetProfileService,
    UpdateProfileService,
} from "../services";
import { profileDAO } from "../factories";

export const routes = Middy.build([
    {
        path: "/profiles",
        method: "GET",
        successStatusCode: 200,
        handler: async (event): Promise<GetProfileResponseDTO> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;

            const dto: GetProfileDTO = {
                accountId: accountId as string,
            };
            Utils.validateRequestSchema(dto, getProfileSchema);

            return await new GetProfileService(profileDAO).execute(dto);
        },
    },
    {
        path: "/profiles",
        method: "PUT",
        successStatusCode: 204,
        handler: async (event): Promise<void> => {
            const { ["account_id"]: accountId } =
                event.requestContext.authorizer.jwt.claims;
            const { username } = event.body;

            const dto: UpdateProfileDTO = {
                accountId: accountId as string,
                username,
            };
            Utils.validateRequestSchema(dto, updateProfileSchema);

            await new UpdateProfileService(profileDAO).execute(dto);
        },
    },
]);
