import { routes } from "./main";

export const handler = async (event, context): Promise<unknown> => {
    if ("routeKey" in event && "rawPath" in event) {
        return await routes(event, context);
    }
};
