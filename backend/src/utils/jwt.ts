import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  userId: number;
  role: 'user' | 'admin';
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function signToken(payload: TokenPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getSecret()) as unknown as TokenPayload;
}
