import "dotenv/config";

type EnvironmentVariables = {
    nodeEnv: string;
    awsAccessKeyId: string;
    secretAccessKey: string;
    awsRegion: string;
};

export const envs: EnvironmentVariables = {
    nodeEnv: process.env.NODE_ENV,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION,
};
