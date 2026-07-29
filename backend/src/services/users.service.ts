import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@/exceptions/httpException';
import { User } from '@interfaces/users.interface';
import { UserModel } from '@models/users.model';


@Service()
export class UserService {
  public async findAllUser(id: string): Promise<User[]> {
    const Checkpermissions = await UserModel.findById(id);
    if (Checkpermissions.role === 'admin') {

      // console.log(Checkpermissions.role)
      const users: User[] = await UserModel.find();
      return users;
    }else{
      return []
    }
  }

  public async findAllUserAdmin(): Promise<User[]> {
    const users: User[] = await UserModel.find({ role: 'landlord' });
    return users;
  }

  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await UserModel.findOne({ _id: userId });
    if (!findUser) throw new HttpException(404, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: User): Promise<User> {
    const findUser: User = await UserModel.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    userData.password = hashedPassword;
    const createUserData: User = await UserModel.create(userData);

    return createUserData;
  }

  public async updateUser(userId: string, userData: User): Promise<User> {
    if (userData.email) {
      const findUser: User = await UserModel.findOne({ email: userData.email });
      if (findUser && findUser._id != userId) throw new HttpException(409, `This email ${userData.email} already exists`);
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }



    const updateUserById = await UserModel.findByIdAndUpdate(userId, userData, { new: true });
    if (!updateUserById) throw new HttpException(404, "User doesn't exist");

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById: User = await UserModel.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(404, "User doesn't exist");

    return deleteUserById;
  }


  public async adminResetPassword(adminId: string, userId: string, newPassword: string): Promise<void> {
    // 1. Verify admin privileges (e.g., check if admin has the right role)
    const admin: User = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      throw new HttpException(403, 'Unauthorized: Admin privileges required');
    }

    // 2. Find the target user
    const user: User = await UserModel.findById(userId);
    if (!user) throw new HttpException(404, 'User not found');

    // 3. Hash and update the password
    const hashedPassword = await hash(newPassword, 10);
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
  }

  public async ensureUser(opts: {
    email: string;
    password: string;
    name?: string;
    role: 'admin' | 'user';
  }): Promise<{ user: User; created: boolean }> {
    const existing = await UserModel.findOne({ email: opts.email });
    if (existing) {
      return { user: existing, created: false };
    }
    const hashedPassword = await hash(opts.password, 10);
    const created = await UserModel.create({
      email: opts.email,
      password: hashedPassword,
      name: opts.name,
      role: opts.role,
      status: true,
    });
    return { user: created, created: true };
  }
}
