import "dotenv/config";

type EnvironmentVariables = {
    nodeEnv: string;
    awsAccessKeyId: string;
    awsSESSourceEmail: string;
    secretAccessKey: string;
    awsRegion: string;
    awsCognitoClientId: string;
    awsCognitoClientSecret: string;
    awsCognitoUserPoolId: string;
    localstackEndpoint: string;
    stripeSecretKey: string;
    webhookSecret: string;
    sendEmailQueue: string;
    awsBucketName: string;
    eventTopic: string;
    accountTableName: string;
    profileTableName: string;
    subscriptionTableName: string;
    expenseTableName: string;
};

export const envs: EnvironmentVariables = {
    nodeEnv: process.env.NODE_ENV,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    awsCognitoClientId: process.env.AWS_COGNITO_CLIENT_ID,
    awsCognitoClientSecret: process.env.AWS_COGNITO_CLIENT_SECRET,
    awsCognitoUserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    awsSESSourceEmail: process.env.AWS_SES_SOURCE_EMAIL,
    localstackEndpoint: process.env.LOCALSTACK_ENDPOINT,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.WEBHOOK_SECRET,
    sendEmailQueue: process.env.SEND_EMAIL_QUEUE,
    awsBucketName: process.env.AWS_BUCKET_NAME,
    eventTopic: process.env.EVENT_TOPIC,
    accountTableName: process.env.ACCOUNT_TABLE_NAME,
    profileTableName: process.env.PROFILE_TABLE_NAME,
    subscriptionTableName: process.env.SUBSCRIPTION_TABLE_NAME,
    expenseTableName: process.env.EXPENSE_TABLE_NAME,
};
