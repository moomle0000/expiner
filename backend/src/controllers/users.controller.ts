import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { User } from '@interfaces/users.interface';
import { UserService } from '@services/users.service';
import { RequestWithUser } from '@interfaces/auth.interface';

export class UserController {
  public user = Container.get(UserService);

  public getUsers = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user._id;
      const findAllUsersData: User[] = await this.user.findAllUser(adminId);
      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUsersAdmin = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const findAllUsersData: User[] = await this.user.findAllUserAdmin();
      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getUserById = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.user.findUserById(userId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createUser = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const createUserData: User = await this.user.createUser(userData);
      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const userData: User = req.body;
      const updateUserData: User = await this.user.updateUser(userId, userData);
      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.user.deleteUser(userId);
      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public adminResetPassword = async (req: RequestWithUser | any, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user._id;
      const { userId, newPassword } = req.body;
      await this.user.adminResetPassword(adminId, userId, newPassword);
      res.status(200).json({ message: 'User password reset successfully by admin' });
    } catch (error) {
      next(error);
    }
  };
}
