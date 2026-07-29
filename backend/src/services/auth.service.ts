import { hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import { Types } from 'mongoose';
import { SECRET_KEY } from '@config';
import { HttpException } from '@/exceptions/httpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';

const BCRYPT_ROUNDS = 10;
const SLUG_MAX_LEN = 32;

const slugify = (input: string): string => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LEN);
};

const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user._id?.toString() };
  return {
    expiresIn: 2592000,
    token: sign(dataStoredInToken, SECRET_KEY, { expiresIn: 2592000 }),
  };
};

const createCookie = (tokenData: TokenData): string => {
  // SameSite=Lax so the cookie is sent on top-level navigations but blocked on
  // cross-site XHR/fetch — standard session-cookie hardening. Max-Age (not
  // Expires) so the lifetime is relative to the response, not the system clock.
  // HttpOnly is intentionally NOT set: the frontend reads this cookie via
  // document.cookie to keep the "logged in" state in sync after refresh/navigation.
  // Treat the JWT in this cookie as sensitive — it is the session token.
  return `Authorization=${tokenData.token}; Path=/; SameSite=Lax; Max-Age=${tokenData.expiresIn};`;
};

const sanitize = (user: User | any) => {
  if (!user) return user;
  const obj = typeof user.toObject === 'function' ? user.toObject() : user;
  const { password, passwordHash, __v, ...safe } = obj;
  return safe;
};

const uniqueSlug = async (base: string): Promise<string> => {
  const safe = slugify(base) || 'user';
  let candidate = safe;
  let attempt = 1;
  while (await UserModel.findOne({ folderSlug: candidate })) {
    attempt += 1;
    candidate = `${safe}-${attempt}`;
    if (attempt > 1000) throw new HttpException(500, 'Could not allocate a unique folder slug');
  }
  return candidate;
};

@Service()
export class AuthService {
  public async signup(userData: Partial<User>): Promise<any> {
    if (!userData || !userData.email || !userData.password) {
      throw new HttpException(400, 'email and password are required');
    }

    const email = String(userData.email).toLowerCase().trim();
    const password = String(userData.password);
    if (password.length < 8) {
      throw new HttpException(400, 'Password must be at least 8 characters');
    }

    const existing = await UserModel.findOne({ email });
    if (existing) {
      throw new HttpException(409, `This email ${email} already exists`);
    }

    const hashedPassword = await hash(password, BCRYPT_ROUNDS);
    const folderSlug = await uniqueSlug(userData.name || userData.username || email.split('@')[0]);

    let created;
    try {
      created = await UserModel.create({
        email,
        password: hashedPassword,
        username: userData.username,
        name: userData.name,
        role: 'user',
        status: true,
        active: true,
        folderSlug,
      });
    } catch (err: any) {
      // Mongoose duplicate-key on email — race or schema-level constraint
      if (err && err.code === 11000) {
        throw new HttpException(409, `This email ${email} already exists`);
      }
      // Mongoose validation
      if (err && err.name === 'ValidationError') {
        throw new HttpException(400, err.message);
      }
      throw err;
    }

    return sanitize(created);
  }

  public async login(userData: Partial<User>): Promise<{ cookie: string; findUser: any; tokenData: TokenData }> {
    if (!userData || !userData.email || !userData.password) {
      throw new HttpException(400, 'email and password are required');
    }
    const email = String(userData.email).toLowerCase().trim();
    const password = String(userData.password);

    const findUser = await UserModel.findOne({ email });
    if (!findUser) throw new HttpException(401, 'Invalid credentials');

    const isPasswordMatching = await compare(password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(401, 'Invalid credentials');

    findUser.lastLoginAt = new Date();
    await findUser.save();

    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);
    return { cookie, findUser: sanitize(findUser), tokenData };
  }

  public async verify(token: string | undefined): Promise<User | string | null> {
    if (!token) return 'Unauthorized';
    try {
      const decoded = verify(token, SECRET_KEY) as DataStoredInToken;
      const user = await UserModel.findById(decoded.id);
      if (!user) return 'User not found';
      return sanitize(user) as any;
    } catch (error) {
      return 'Unauthorized';
    }
  }

  public async adminResetPassword(adminId: string, userId: string, newPassword: string): Promise<void> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new HttpException(403, 'Unauthorized: Admin privileges required');
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new HttpException(404, 'User not found');
    const hashedPassword = await hash(newPassword, BCRYPT_ROUNDS);
    await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
  }

  public async logout(_userData: User): Promise<null> {
    // stateless JWT — nothing to do server-side. The client should drop its token.
    return null;
  }
}
