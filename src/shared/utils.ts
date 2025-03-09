import { InvalidRequestSchemaError } from "@/shared";

import { randomUUID } from "node:crypto";
import { z } from "zod";

export type RequestSchema = {
    [field: string]: {
        type: "string" | "number" | "boolean" | "date" | RequestSchema;
        optional: boolean;
    };
};

export class Utils {
    static createUUID(): string {
        return randomUUID();
    }

    static validateRequestSchema(body: object, schema: RequestSchema): void {
        const result = (
            Utils.mountZodObjet(schema, {}) as z.AnyZodObject
        ).safeParse(body);

        if (!result.success) {
            const messages: string[] = [];

            result.error.errors.forEach((error) => {
                messages.push(`${error.path.join(".")} ${error.message}`);
            });

            throw new InvalidRequestSchemaError(messages.join(", "));
        }
    }

    private static mountZodObjet(
        schema: RequestSchema,
        zodObject: object,
    ): object {
        const typesDict = {
            string: z.string().min(1),
            number: z.number(),
            boolean: z.boolean(),
            date: z
                .string()
                .refine((value) => !isNaN(Date.parse(value)), {
                    message: "The date must be in a valid format (ISO 8601)",
                })
                .transform((value) => new Date(value)),
        };

        for (const field in schema) {
            const props = schema[field];

            if (
                props.type != "string" &&
                props.type != "number" &&
                props.type != "boolean" &&
                props.type != "date"
            ) {
                zodObject[field] = props.optional
                    ? (
                          Utils.mountZodObjet(
                              props.type as unknown as RequestSchema,
                              {},
                          ) as z.ZodAny
                      ).optional()
                    : Utils.mountZodObjet(
                          props.type as unknown as RequestSchema,
                          {},
                      );
            } else {
                zodObject[field] = props.optional
                    ? typesDict[props.type].optional()
                    : typesDict[props.type];
            }
        }

        return z.object(zodObject as z.ZodRawShape);
    }
}
