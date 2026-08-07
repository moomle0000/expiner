import 'reflect-metadata';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  BOOTSTRAP_ADMIN_NAME,
  BOOTSTRAP_ADMIN_PASSWORD,
  BOOTSTRAP_USER_EMAIL,
  BOOTSTRAP_USER_NAME,
  BOOTSTRAP_USER_PASSWORD,
} from '@config';
import { UserService } from '@services/users.service';
import { logger } from '@utils/logger';
import Container from 'typedi';

export async function seedBootstrapUsers(): Promise<void> {
  console.log('🌱 Seeding bootstrap users...');
  const userService = Container.get(UserService);
  const targets: Array<{
    label: string;
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'user';
  }> = [];

  if (BOOTSTRAP_ADMIN_EMAIL && BOOTSTRAP_ADMIN_PASSWORD) {
    targets.push({
      label: 'admin',
      email: BOOTSTRAP_ADMIN_EMAIL.toLowerCase().trim(),
      password: BOOTSTRAP_ADMIN_PASSWORD,
      name: BOOTSTRAP_ADMIN_NAME,
      role: 'admin',
    });
  }

  if (BOOTSTRAP_USER_EMAIL && BOOTSTRAP_USER_PASSWORD) {
    targets.push({
      label: 'user',
      email: BOOTSTRAP_USER_EMAIL.toLowerCase().trim(),
      password: BOOTSTRAP_USER_PASSWORD,
      name: BOOTSTRAP_USER_NAME,
      role: 'user',
    });
  }

  if (targets.length === 0) {
    return;
  }

  for (const t of targets) {
    try {

      console.log(`🌱 Seeding bootstrap ${t.label}: ${t.email}`);
      const { user, created } = await userService.ensureUser(t);
      if (created) {
        logger.info(`🌱 Seeded bootstrap ${t.label}: ${user.email}`);
      } else {
        logger.info(`🌱 Bootstrap ${t.label} already exists: ${user.email}`);
      }
    } catch (err: any) {
      logger.error(`🌱 Failed to seed bootstrap ${t.label} (${t.email}): ${err?.message ?? err}`);
    }
  }
}
