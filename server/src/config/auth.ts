export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
};

export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['production-domain.com']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};