const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'manager@bawazir.com';
  const adminPassword = 'password123';

  // حذف الحساب القديم إن وُجد (لتجنب التكرار)
  await prisma.profile.deleteMany({
    where: { email: adminEmail }
  });

  // إنشاء حساب جديد بكلمة مرور مشفرة دائماً
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.profile.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      full_name: 'مدير النظام',
      role: 'manager'
    }
  });

  console.log(`==========================================`);
  console.log(`  تم إنشاء حساب المدير بنجاح`);
  console.log(`  البريد: ${adminEmail}`);
  console.log(`  كلمة المرور: ${adminPassword}`);
  console.log(`==========================================`);
  console.log(`  يرجى تسجيل الدخول باستخدام هذه البيانات`);
}

main()
  .catch(e => {
    console.error('خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
