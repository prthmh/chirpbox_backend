interface EnvVariables {
  PORT: number;
  MONGODB_URI: string;
  CORS_ORIGIN: string;
  JWT_SECRET_KEY: string;
}

export const envObj: EnvVariables = {
  PORT: parseInt(process.env.PORT!),
  MONGODB_URI: process.env.MONGODB_URI!,
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
};
