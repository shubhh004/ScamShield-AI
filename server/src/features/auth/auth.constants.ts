export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TokenType = {
  ACCESS: 'access',
  REFRESH: 'refresh',
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];
