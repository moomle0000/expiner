import { Service } from 'typedi';
import { createHash } from 'crypto';
import { HttpException } from '@exceptions/httpException';
import { IApiKey, ApiKeyPublic } from '@interfaces/apiKey.interface';
import { ApiKeyModel } from '@models/apiKey.model';
import { UserModel } from '@models/users.model';
import { User } from '@interfaces/users.interface';
import { generateRandomString } from '@utils/util';

const RAW_KEY_BYTES = 24;

const sha256 = (raw: string): string => {
  return createHash('sha256').update(raw).digest('hex');
};

// build the denormalised `user` block from a populated createdBy ref
const buildUserBlock = (u: any): ApiKeyPublic['user'] => {
  if (!u) return null;
  return {
    id: u._id ? u._id.toString() : '',
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
  };
};

const toPublic = (k: any): ApiKeyPublic => {
  const createdBy = k.createdBy; // may be an ObjectId or a populated user doc
  const populated = createdBy && typeof createdBy === 'object' && createdBy._id;
  return {
    id: k._id.toString(),
    name: k.name,
    createdById: populated ? createdBy._id.toString() : createdBy.toString(),
    user: populated ? buildUserBlock(createdBy) : null,
    active: k.active,
    lastUsedAt: k.lastUsedAt,
    createdAt: k.createdAt,
  };
};

@Service()
export class ApiKeyService {
  public async listKeysForUser(createdBy: string): Promise<ApiKeyPublic[]> {
    const keys = await ApiKeyModel.find({ createdBy })
      .select('-keyHash')
      .populate({ path: 'createdBy', select: 'name username email role' })
      .sort({ createdAt: -1 });
    return keys.map(k => toPublic(k));
  }

  public async listAllKeys(): Promise<ApiKeyPublic[]> {
    // populate createdBy with the user fields the admin UI needs
    const keys = await ApiKeyModel.find()
      .select('-keyHash')
      .populate({ path: 'createdBy', select: 'name username email role' })
      .sort({ createdAt: -1 });
    return keys.map(k => toPublic(k));
  }

  public async createKey(createdBy: string, name: string): Promise<{ record: IApiKey; rawKey: string }> {
    if (!name) throw new HttpException(400, 'Name is required');
    const user = await UserModel.findById(createdBy);
    if (!user) throw new HttpException(404, 'User not found');

    const rawKey = generateRandomString(RAW_KEY_BYTES);
    const keyHash = sha256(rawKey);

    const record = await ApiKeyModel.create({
      name,
      keyHash,
      createdBy: user._id,
      active: true,
    });
    return { record, rawKey };
  }

  public async validateKey(raw: string): Promise<User | null> {
    if (!raw) return null;
    const keyHash = sha256(raw);
    const found = await ApiKeyModel.findOne({ keyHash, active: true });
    if (!found) return null;

    // touch lastUsedAt in background, do not await
    ApiKeyModel.updateOne({ _id: found._id }, { $set: { lastUsedAt: new Date() } }).catch(() => {});

    const user = await UserModel.findById(found.createdBy);
    if (!user) return null;
    if (user.status === false || user.active === false) return null;
    return user as User;
  }

  public async revokeKey(id: string, requester: { id: string; role?: string }): Promise<IApiKey> {
    const key = await ApiKeyModel.findById(id);
    if (!key) throw new HttpException(404, 'API key not found');
    if (requester.role !== 'admin' && key.createdBy.toString() !== requester.id) {
      throw new HttpException(403, 'You can only revoke your own keys');
    }
    key.active = false;
    await key.save();
    return key;
  }
}
