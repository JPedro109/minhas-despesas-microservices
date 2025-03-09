import {
    ConflictedError,
    ForbiddenError,
    InvalidParamError,
    InvalidRequestSchemaError,
    NotFoundError,
    UnauthorizedError,
} from "@/shared";
import middy, { MiddlewareObj } from "@middy/core";
import httpRouter from "@middy/http-router";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import type {
    APIGatewayProxyEventV2WithJWTAuthorizer,
    Context,
} from "aws-lambda";

export type Request = middy.Request<
    APIGatewayProxyEventV2WithJWTAuthorizer,
    unknown,
    Error,
    Context
>;
type Handler = (args: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any;
    headers: Record<string, string>;
    pathParameters: Record<string, string>;
    queryStringParameters: Record<string, string>;
    requestContext: {
        authorizer: {
            jwt: {
                claims: {
                    [name: string]: string | number | boolean | string[];
                };
                scopes: string[];
            };
        };
    };
}) => Promise<unknown>;
type HttpMethod = "POST" | "GET" | "PATCH" | "PUT" | "DELETE";
type Middleware = (request: Request) => Promise<void>;
type Route = {
    successStatusCode: number;
    path: string;
    method: HttpMethod;
    handler: Handler;
    middlewares?: Middleware[];
    doNotParseJsonBody?: boolean;
};
type MiddyHandler = middy.MiddyfiedHandler<unknown, unknown>;

export class Middy {
    static build(routes: Route[]): MiddyHandler {
        const handlers = routes.map((route) => ({
            method: route.method,
            path: route.path,
            handler: Middy.makeHandler(
                route.handler,
                route.successStatusCode,
                route.middlewares,
                route.doNotParseJsonBody,
            ),
        }));

        return middy().handler(httpRouter(handlers));
    }

    private static makeHandler(
        handler: Handler,
        successStatusCode: number,
        middlewares?: Middleware[],
        doNotParseJsonBody?: boolean,
    ): MiddyHandler {
        const middyHandler = doNotParseJsonBody
            ? middy()
            : middy().use(
                  httpJsonBodyParser({
                      disableContentTypeError: true,
                  }),
              );

        return middyHandler
            .use(Middy.middleware(successStatusCode, middlewares))
            .use(
                httpResponseSerializer({
                    defaultContentType: "application/json",
                    serializers: [
                        {
                            regex: /^application\/json$/,
                            serializer: ({ body }) => JSON.stringify(body),
                        },
                    ],
                }),
            )
            .handler(handler);
    }

    private static middleware(
        successStatusCode: number,
        middlewares?: Middleware[],
    ): MiddlewareObj<APIGatewayProxyEventV2WithJWTAuthorizer> {
        return {
            before: async (request): Promise<void> => {
                if (middlewares?.length) {
                    for (const middleware of middlewares) {
                        await middleware(request);
                    }
                }
            },
            after: (request): void => {
                request.response = {
                    ...request.response,
                    statusCode: successStatusCode,
                    headers: {
                        ...request.response?.headers,
                        "Content-Type": "application/json",
                    },
                };
            },
            onError: (request): void => {
                const { error } = request;

                const statusCode = Middy.setErrorStatusCode(error);

                if (statusCode !== 500) {
                    console.warn(
                        `${request.event.requestContext.http.path} ${request.event.requestContext.http.method} ${statusCode} | ${error.message}`,
                    );
                } else {
                    console.error(
                        `${request.event.requestContext.http.path} ${request.event.requestContext.http.method} ${statusCode} | ${error.message}\n${error.stack}`,
                    );
                }

                request.response = {
                    ...request.response,
                    statusCode,
                    body: JSON.stringify({
                        code:
                            statusCode === 500
                                ? "InternalServerError"
                                : error.name,
                        message:
                            statusCode === 500
                                ? "Internal server error"
                                : error.message,
                    }),
                    headers: {
                        ...request.response?.headers,
                        "Content-Type": "application/json",
                    },
                };
            },
        };
    }

    private static setErrorStatusCode(e: Error): number {
        if (e instanceof UnauthorizedError) return 401;
        if (e instanceof NotFoundError) return 404;
        if (e instanceof ForbiddenError) return 403;
        if (e instanceof ConflictedError) return 409;
        if (
            e instanceof InvalidParamError ||
            e instanceof InvalidRequestSchemaError
        ) {
            return 400;
        }
        return 500;
    }
}
