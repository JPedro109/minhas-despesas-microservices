import { events, routes } from "./main";

export const handler = async (event, context): Promise<unknown> => {
    if ("routeKey" in event && "rawPath" in event) {
        return await routes(event, context);
    }

    if ("Records" in event) {
        return await events(event);
    }

    throw new Error(`Event is not exists ${event}`);
};
