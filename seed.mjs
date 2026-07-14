import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // حذف الحسابات القديمة إن وُجدت
  await prisma.profile.deleteMany({
    where: {
      username: {
        in: ['superadmin', 'r3lr', 'admin_haswa', 'admin_durein', 'worker_haswa', 'worker_durein']
      }
    }
  });

  // تشفير كلمات المرور
  const superPassword = await bcrypt.hash('r3lr123', 10);
  const regularPassword = await bcrypt.hash('123456', 10); // كلمة مرور موحدة للتسهيل

  // 1. حساب السوبر أدمن (SUPER_ADMIN) - يرى كافة الفروع
  await prisma.profile.create({
    data: {
      username: 'r3lr',
      password: superPassword,
      full_name: 'المدير العام (السوبر أدمن)',
      role: 'SUPER_ADMIN',
      branch: 'الحسوة',
      isActive: true
    }
  });

  // 2. حسابات مدير فرع (ADMIN)
  await prisma.profile.create({
    data: {
      username: 'admin_haswa',
      password: regularPassword,
      full_name: 'مدير فرع الحسوة',
      role: 'ADMIN',
      branch: 'الحسوة',
      isActive: true
    }
  });

  await prisma.profile.create({
    data: {
      username: 'admin_durein',
      password: regularPassword,
      full_name: 'مدير فرع الدرين',
      role: 'ADMIN',
      branch: 'الدرين',
      isActive: true
    }
  });

  // 3. حسابات موظف عادي (WORKER)
  await prisma.profile.create({
    data: {
      username: 'worker_haswa',
      password: regularPassword,
      full_name: 'موظف الحسوة',
      role: 'WORKER',
      branch: 'الحسوة',
      isActive: true
    }
  });

  await prisma.profile.create({
    data: {
      username: 'worker_durein',
      password: regularPassword,
      full_name: 'موظف الدرين',
      role: 'WORKER',
      branch: 'الدرين',
      isActive: true
    }
  });

  console.log(`========================================================================`);
  console.log(`  تم تفعيل هيكلة الصلاحيات الجديدة وإعادة توليد الحسابات بنجاح:`);
  console.log(`  1. السوبر أدمن (SUPER_ADMIN): r3lr | r3lr123`);
  console.log(`  2. مدير الحسوة (ADMIN):        admin_haswa | 123456`);
  console.log(`  3. مدير الدرين (ADMIN):        admin_durein | 123456`);
  console.log(`  4. موظف الحسوة (WORKER):       worker_haswa | 123456`);
  console.log(`  5. موظف الدرين (WORKER):       worker_durein | 123456`);
  console.log(`========================================================================`);
}

main()
  .catch(e => {
    console.error('خطأ أثناء التهيئة:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
