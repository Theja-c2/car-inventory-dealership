process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

import { signToken, verifyToken } from '../src/utils/jwt';

describe('JWT utils', () => {
  it('signs a token that can be verified back to the same payload', () => {
    const token = signToken({ userId: 1, role: 'user' });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.role).toBe('user');
  });

  it('throws when verifying an invalid token', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });
});
