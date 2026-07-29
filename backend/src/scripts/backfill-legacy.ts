/**
 * One-off migration: assign every existing Image and File record to a `legacy` user.
 * Run once after deploying the per-user schema. Safe to re-run — it only updates
 * records that don't yet have a `createdBy` field.
 *
 *   node dist/scripts/backfill-legacy.js
 * or (with ts-node):
 *   ts-node -r tsconfig-paths/register src/scripts/backfill-legacy.ts
 */
import 'reflect-metadata';
import mongoose from 'mongoose';
import { DB_URL } from '@config';
import { UserModel } from '@models/users.model';
import { ImageModel } from '@models/image.model';
import { FileModel } from '@models/files.model';

const LEGACY_NAME = 'legacy';
const LEGACY_EMAIL = 'legacy@local.invalid';
const LEGACY_FOLDER = 'legacy';

const main = async () => {
  await mongoose.connect(DB_URL);
  console.log('[backfill] connected to', DB_URL);

  let legacy = await UserModel.findOne({ folderSlug: LEGACY_FOLDER });
  if (!legacy) {
    legacy = await UserModel.create({
      email: LEGACY_EMAIL,
      password: '!legacy-no-login',
      name: LEGACY_NAME,
      username: LEGACY_NAME,
      role: 'user',
      status: true,
      active: false,
      folderSlug: LEGACY_FOLDER,
    });
    console.log('[backfill] created legacy user', legacy._id.toString());
  } else {
    console.log('[backfill] legacy user already exists', legacy._id.toString());
  }

  const legacyId = legacy._id;

  const imageRes = await ImageModel.updateMany(
    { createdBy: { $exists: false } },
    { $set: { createdBy: legacyId, folder: null } },
  );
  console.log('[backfill] images updated:', imageRes.modifiedCount);

  const fileRes = await FileModel.updateMany(
    { createdBy: { $exists: false } },
    { $set: { createdBy: legacyId, folder: null } },
  );
  console.log('[backfill] files updated:', fileRes.modifiedCount);

  await mongoose.disconnect();
  console.log('[backfill] done.');
};

main().catch(err => {
  console.error('[backfill] failed:', err);
  process.exit(1);
});
