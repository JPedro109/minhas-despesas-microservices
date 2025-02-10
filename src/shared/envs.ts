import "dotenv/config";

type EnvironmentVariables = {
    nodeEnv: string;
    awsAccessKeyId: string;
    secretAccessKey: string;
    awsRegion: string;
    awsCognitoClientId: string;
    awsCognitoClientSecret: string;
    awsCognitoUserPoolId: string;
};

export const envs: EnvironmentVariables = {
    nodeEnv: process.env.NODE_ENV,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
    awsCognitoClientId: process.env.AWS_COGNITO_CLIENT_ID,
    awsCognitoClientSecret: process.env.AWS_COGNITO_CLIENT_SECRET,
    awsCognitoUserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
};
