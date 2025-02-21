import { envs } from "@/shared";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    DeleteCommand,
    QueryCommand,
    UpdateCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

type Filter = {
    column: string;
    expression: "=" | ">" | "<" | ">=" | "<=";
    value: unknown;
};

type UpdateDTO = {
    pk: string;
    sk: string;
    data: object;
};

export class Dynamo {
    private readonly client: DynamoDBClient;
    private readonly dynamo: DynamoDBDocumentClient;

    constructor(private readonly tableName: string) {
        const credential = {
            accessKeyId: envs.awsAccessKeyId,
            secretAccessKey: envs.secretAccessKey,
        };
        this.client = new DynamoDBClient({
            region: envs.awsRegion,
            credentials: envs.nodeEnv === "production" ? null : credential,
        });

        this.dynamo = DynamoDBDocumentClient.from(this.client);
    }

    async create(pk: string, sk: string, data: object): Promise<string> {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                PK: pk,
                SK: sk,
                ...data,
            },
        });

        await this.dynamo.send(command);

        return pk;
    }

    async getOne<T>(pk: string, sk: string): Promise<T | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                PK: pk,
                SK: sk,
            },
        });

        const { Item } = await this.dynamo.send(command);

        if (!Item) return null;

        return Item as T;
    }

    async get<T>(
        pk: string,
        sk?: string,
        params?: {
            skBeginsWith?: boolean;
            indexName?: string;
            filters?: Filter[];
        },
    ): Promise<T[]> {
        const keyConditionExpression = ["#p = :pk"];
        const names = {
            "#p": params?.indexName ? params?.indexName + "PK" : "PK",
        };
        const values = { ":pk": pk };

        if (sk) {
            keyConditionExpression.push(
                params.skBeginsWith ? "begins_with(#s, :sk)" : "#s = :sk",
            );
            names["#s"] = params?.indexName ? params?.indexName + "SK" : "SK";
            values[":sk"] = sk;
        }

        const filterExpressions = [];
        let filterIndex = 0;
        if (params?.filters) {
            for (const filter of params.filters) {
                const filterKey = `#col${filterIndex}`;
                const valueKey = `:val${filterIndex}`;

                filterExpressions.push(
                    `${filterKey} ${filter.expression} ${valueKey}`,
                );
                names[filterKey] = filter.column;
                values[valueKey] = filter.value;

                filterIndex++;
            }
        }

        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: keyConditionExpression.join(" AND "),
            FilterExpression: filterExpressions.length
                ? filterExpressions.join(" AND ")
                : null,
            ExpressionAttributeNames: names,
            ExpressionAttributeValues: values,
            IndexName: params?.indexName,
        });

        const { Items } = await this.dynamo.send(command);

        return Items ? (Items as T[]) : [];
    }

    async updateOne(pk: string, sk: string, data: object): Promise<void> {
        const expressions = [];
        const names = {};
        const values = {};

        let filterIndex = 0;
        for (const key in data) {
            const filterKey = `#col${filterIndex}`;
            const valueKey = `:val${filterIndex}`;

            expressions.push(`${filterKey} = ${valueKey}`);
            names[filterKey] = key;
            values[valueKey] = data[key];

            filterIndex++;
        }

        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                PK: pk,
                SK: sk,
            },
            UpdateExpression: `set ${expressions.join(", ")}`,
            ExpressionAttributeNames: names,
            ExpressionAttributeValues: values,
        });

        await this.dynamo.send(command);
    }

    async updateMany(dtos: UpdateDTO[]): Promise<void> {
        const transactItems = [];

        for (const dto of dtos) {
            const expressions = [];
            const names = {};
            const values = {};

            let filterIndex = 0;
            for (const key in dto.data) {
                const filterKey = `#col${filterIndex}`;
                const valueKey = `:val${filterIndex}`;

                expressions.push(`${filterKey} = ${valueKey}`);
                names[filterKey] = key;
                values[valueKey] = dto.data[key];

                filterIndex++;
            }
            const command = {
                TableName: this.tableName,
                Key: {
                    PK: dto.pk,
                    SK: dto.sk,
                },
                UpdateExpression: `set ${expressions.join(", ")}`,
                ExpressionAttributeNames: names,
                ExpressionAttributeValues: values,
            };

            transactItems.push({ Update: command });
        }

        const comands = [];
        const size = 100;
        for (let i = 0; i < transactItems.length; i += size) {
            const command = new TransactWriteCommand({
                TransactItems: transactItems.slice(i, i + size),
            });
            comands.push(this.dynamo.send(command));
        }

        await Promise.all(comands);
    }

    async deleteOne(pk: string, sk: string): Promise<void> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                PK: pk,
                SK: sk,
            },
        });

        await this.dynamo.send(command);
    }

    async deletePartion(pk: string): Promise<void> {
        const transactItems = [];
        const items = await this.get<{ PK: string; SK: string }>(pk);

        for (const item of items) {
            const command = {
                TableName: this.tableName,
                Key: {
                    PK: item.PK,
                    SK: item.SK,
                },
            };

            transactItems.push({ Delete: command });
        }

        const comands = [];
        const size = 100;
        for (let i = 0; i < transactItems.length; i += size) {
            const command = new TransactWriteCommand({
                TransactItems: transactItems.slice(i, i + size),
            });
            comands.push(this.dynamo.send(command));
        }

        await Promise.all(comands);
    }
}
