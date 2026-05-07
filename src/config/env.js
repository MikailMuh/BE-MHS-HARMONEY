require('dotenv').config();
const REQUIRED_VARS = ['DATABASE_URL', 'JWT_SECRET'];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ [ENV] Missing required environment variables:', missing.join(', '));
  console.error('💡 Check your .env file. See .env.example for reference.');
  process.exit(1);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },

  cors: {
    origins:
      process.env.CORS_ORIGINS === '*' || !process.env.CORS_ORIGINS
        ? '*'
        : process.env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || null,
  },

  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,
  },
};

module.exports = config;