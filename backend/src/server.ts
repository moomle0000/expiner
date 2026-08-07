import { App } from '@/app';
import { UPLOAD_ROOT, IMAGE_STORAGE_PATH } from '@config';
import { dbConnection } from '@database';
import fs from 'fs';
import path from 'path';
import { LocationRoute } from './routes/location.route';
import { FileRoute } from './routes/file.route';
import { AuthRoute } from './routes/auth.route';
import { UserRoute } from './routes/users.route';
import { ApiKeyRoute } from './routes/apiKey.route';
import { UserSelfRoute } from './routes/userSelf.route';
import { FolderRoute } from './routes/folder.route';
import { CategoryRoute } from './routes/category.route';
import { seedBootstrapUsers } from '@utils/seedBootstrap';

// Make sure the upload root + every sub-folder used by the upload middleware
// exist before the server starts accepting requests. Cross-platform safe
// (works on Windows and Linux).
function ensureUploadDirs() {
  const dirs = [
    UPLOAD_ROOT,
    IMAGE_STORAGE_PATH,
    path.join(UPLOAD_ROOT, 'images'),
    path.join(UPLOAD_ROOT, 'documents'),
    path.join(UPLOAD_ROOT, 'videos'),
    path.join(UPLOAD_ROOT, 'others'),
  ];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // eslint-disable-next-line no-console
  console.log(`📁  Upload root ready: ${UPLOAD_ROOT}`);
}

ensureUploadDirs();

const app = new App([
  new LocationRoute(),
  new FileRoute(),
  new AuthRoute(),
  new UserRoute(),
  new ApiKeyRoute(),
  new UserSelfRoute(),
  new FolderRoute(),
  new CategoryRoute(),
]);

(async () => {
  // Seed only after the DB connection is fully established — seeding queries
  // with bufferCommands=false fail (and were swallowed) before this.
  await dbConnection();
  await seedBootstrapUsers();
  app.listen();
})();
