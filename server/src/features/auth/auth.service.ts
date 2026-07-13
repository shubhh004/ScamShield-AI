import { User } from './user.model';
import { hashPassword, comparePassword } from '../../lib/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../lib/jwt.utils';
import {
  ConflictError,
  ForbiddenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors';
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from './auth.schema';
import type { UserRole } from './auth.constants';

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResult extends AuthTokens {
  user: SafeUser;
}

interface LoginResult extends AuthTokens {
  user: SafeUser;
}

interface UserProfile extends SafeUser {
  createdAt: Date;
}

function toSafeUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}): SafeUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
}

async function issueRefreshToken(userId: string): Promise<string> {
  const refreshToken = generateRefreshToken(userId);
  const tokenHash = await hashPassword(refreshToken);
  await User.findByIdAndUpdate(userId, { refreshTokenHash: tokenHash });
  return refreshToken;
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const existing = await User.findOne({ email: input.email, isDeleted: false });
  if (existing !== null) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await User.create({ name: input.name, email: input.email, passwordHash });

  const accessToken = generateAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });

  const refreshToken = await issueRefreshToken(String(user._id));

  return { accessToken, refreshToken, user: toSafeUser(user) };
}

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await User.findOne({ email: input.email, isDeleted: false }).select('+passwordHash');
  if (user === null) {
    throw new InvalidCredentialsError();
  }

  if (!user.isActive) {
    throw new ForbiddenError('This account has been suspended');
  }

  const passwordMatch = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new InvalidCredentialsError();
  }

  const accessToken = generateAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });

  const refreshToken = await issueRefreshToken(String(user._id));

  return { accessToken, refreshToken, user: toSafeUser(user) };
}

export async function refreshAccessToken(
  incomingRefreshToken: string,
): Promise<Pick<AuthTokens, 'accessToken' | 'refreshToken'>> {
  const { payload, error } = verifyRefreshToken(incomingRefreshToken);

  if (error !== null || payload === null) {
    throw new InvalidRefreshTokenError();
  }

  const user = await User.findOne({ _id: payload.sub, isDeleted: false }).select(
    '+refreshTokenHash',
  );

  if (user === null || user.refreshTokenHash === null) {
    throw new InvalidRefreshTokenError();
  }

  const tokenMatch = await comparePassword(incomingRefreshToken, user.refreshTokenHash);

  if (!tokenMatch) {
    // Possible token reuse attack — invalidate all sessions for this user
    await User.findByIdAndUpdate(payload.sub, { refreshTokenHash: null });
    throw new InvalidRefreshTokenError();
  }

  const accessToken = generateAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });

  const refreshToken = await issueRefreshToken(String(user._id));

  return { accessToken, refreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
  const user = await User.findOne({ _id: userId, isDeleted: false, isActive: true });
  if (user === null) throw new NotFoundError('User');

  if (input.email !== undefined && input.email !== user.email) {
    const existing = await User.findOne({ email: input.email, isDeleted: false });
    if (existing !== null) throw new ConflictError('An account with this email already exists');
    user.email = input.email;
    user.isEmailVerified = false;
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  await user.save();
  return toSafeUser(user);
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await User.findOne({ _id: userId, isDeleted: false, isActive: true }).select('+passwordHash');
  if (user === null) throw new NotFoundError('User');

  const passwordMatch = await comparePassword(input.currentPassword, user.passwordHash);
  if (!passwordMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const newHash = await hashPassword(input.newPassword);
  await User.findByIdAndUpdate(userId, { passwordHash: newHash, refreshTokenHash: null });
}

export async function deleteAccount(userId: string): Promise<void> {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (user === null) throw new NotFoundError('User');

  await User.findByIdAndUpdate(userId, {
    isDeleted: true,
    deletedAt: new Date(),
    isActive: false,
    refreshTokenHash: null,
  });
}

export async function getMe(userId: string): Promise<UserProfile> {
  const user = await User.findOne({ _id: userId, isDeleted: false, isActive: true });
  if (user === null) {
    throw new NotFoundError('User');
  }
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}
