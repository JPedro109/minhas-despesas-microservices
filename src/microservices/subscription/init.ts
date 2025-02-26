import { routes } from "./presentation";

export const handler = async (event, context): Promise<unknown> => {
    if ("routeKey" in event && "rawPath" in event) {
        return await routes(event, context);
    }
};
