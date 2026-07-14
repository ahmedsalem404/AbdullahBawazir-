import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const carTypes = ['تويوتا كامري', 'هيونداي إلنترا', 'نيسان باترول', 'كيا سبورتج', 'فورد تورس', 'مازدا 6', 'تويوتا لاندكروزر', 'هوندا أكورد', 'لكزس ES', 'شيفروليه تاهو'];
const customerNames = [
  'أحمد محمد باوزير', 'سالم علوي الحبشي', 'عبدالله عمر العطاس', 'خالد حسين العمودي',
  'صالح سعيد بن عفيف', 'فهد كرامة بن طالب', 'حسن سالم باقران', 'محمد عمر بلعفير',
  'يسلم عوض بن غانم', 'علي حسين الجفري', 'سعيد أحمد باديب', 'عادل صالح باوزير',
  'ماجد سالم الكاف', 'محمد علي السقاف', 'عبدالرحمن سالم العيدروس', 'حسين عمر فدعق',
  'عمر عبدالله بن شهاب', 'مبارك صالح بن حيدرة', 'سامي حسين بن دحمان', 'سعيد هادي العولقي'
];
const notes = [
  'فحص شامل للمحرك وتغيير الزيت والفلتر.',
  'إصلاح تهريب مياه التبريد وتغيير الرديتر.',
  'خرط هوبات أمامية وخلفية وتغيير الفحمات.',
  'برمجة حساسات الإطارات وفحص ضغط الهواء.',
  'تنظيف البخاخات وفحص طرمبة البنزين.',
  'تغيير مساعدات أمامية ووزن أذرعة ومقاصات.',
  'فحص وبرمجة كمبيوتر السيارة وتصفية المحرك.',
  'تغيير شمعات الاحتراق (البواجي) وتنظيف الثروتل.'
];

async function main() {
  console.log('جاري مسح بيانات العملاء والمهندسين القديمة للتجربة...');
  await prisma.customer.deleteMany({});
  await prisma.engineer.deleteMany({});

  console.log('جاري إنشاء مهندسين تجريبيين للفروع...');
  // مهندسين فرع الحسوة
  const engHaswa1 = await prisma.engineer.create({ data: { name: 'المهندس حسام الحسوة', phone: '0501112233', address: 'الحسوة', branch: 'الحسوة' } });
  const engHaswa2 = await prisma.engineer.create({ data: { name: 'المهندس فهد الحسوة', phone: '0504445566', address: 'الحسوة', branch: 'الحسوة' } });
  const engHaswa3 = await prisma.engineer.create({ data: { name: 'المهندس صالح الحسوة', phone: '0507778899', address: 'الحسوة', branch: 'الحسوة' } });

  // مهندسين فرع الدرين
  const engDurein1 = await prisma.engineer.create({ data: { name: 'المهندس مروان الدرين', phone: '0561112233', address: 'الدرين', branch: 'الدرين' } });
  const engDurein2 = await prisma.engineer.create({ data: { name: 'المهندس سالم الدرين', phone: '0564445566', address: 'الدرين', branch: 'الدرين' } });
  const engDurein3 = await prisma.engineer.create({ data: { name: 'المهندس مبارك الدرين', phone: '0567778899', address: 'الدرين', branch: 'الدرين' } });

  const haswaEngineers = [engHaswa1.id, engHaswa2.id, engHaswa3.id];
  const dureinEngineers = [engDurein1.id, engDurein2.id, engDurein3.id];

  console.log('جاري توليد 60 عميلاً تجريبياً (30 لفرع الحسوة و30 لفرع الدرين)...');

  // توليد بيانات فرع الحسوة
  for (let i = 0; i < 30; i++) {
    const reqAmount = Math.floor(Math.random() * 2000) + 500;
    const discount = Math.random() > 0.5 ? (Math.random() > 0.5 ? 10 : 5) : 0;
    const injectors = Math.random() > 0.7 ? 200 : 0;
    
    const totalWithDeductions = Math.max(reqAmount - injectors, 0);
    const totalAfterDiscount = totalWithDeductions - (totalWithDeductions * discount / 100);
    const paid = Math.random() > 0.3 ? totalAfterDiscount : Math.floor(totalAfterDiscount * 0.6);

    const name = customerNames[Math.floor(Math.random() * customerNames.length)] + ` (حسوة #${i+1})`;
    const car = carTypes[Math.floor(Math.random() * carTypes.length)];
    const engId = haswaEngineers[Math.floor(Math.random() * haswaEngineers.length)];

    await prisma.customer.create({
      data: {
        customer_name: name,
        phone: '050' + Math.floor(Math.random() * 90000000 + 10000000).toString(),
        car_type: car,
        car_year: Math.floor(Math.random() * 10) + 2015,
        engineer_id: engId,
        work_notes: notes[Math.floor(Math.random() * notes.length)],
        required_amount: reqAmount,
        discount_percent: discount,
        paid_amount: paid,
        injectors_amount: injectors,
        branch: 'الحسوة',
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000) // تواريخ متدرجة بالساعات
      }
    });
  }

  // توليد بيانات فرع الدرين
  for (let i = 0; i < 30; i++) {
    const reqAmount = Math.floor(Math.random() * 2500) + 600;
    const discount = Math.random() > 0.6 ? 10 : 0;
    const injectors = Math.random() > 0.8 ? 200 : 0;

    const totalWithDeductions = Math.max(reqAmount - injectors, 0);
    const totalAfterDiscount = totalWithDeductions - (totalWithDeductions * discount / 100);
    const paid = Math.random() > 0.4 ? totalAfterDiscount : Math.floor(totalAfterDiscount * 0.5);

    const name = customerNames[Math.floor(Math.random() * customerNames.length)] + ` (درين #${i+1})`;
    const car = carTypes[Math.floor(Math.random() * carTypes.length)];
    const engId = dureinEngineers[Math.floor(Math.random() * dureinEngineers.length)];

    await prisma.customer.create({
      data: {
        customer_name: name,
        phone: '056' + Math.floor(Math.random() * 90000000 + 10000000).toString(),
        car_type: car,
        car_year: Math.floor(Math.random() * 12) + 2012,
        engineer_id: engId,
        work_notes: notes[Math.floor(Math.random() * notes.length)],
        required_amount: reqAmount,
        discount_percent: discount,
        paid_amount: paid,
        injectors_amount: injectors,
        branch: 'الدرين',
        createdAt: new Date(Date.now() - i * 45 * 60 * 1000) // تواريخ متدرجة
      }
    });
  }

  console.log(`==========================================`);
  console.log('  تم إنشاء البيانات التجريبية بنجاح!');
  console.log('  - تم مسح البيانات القديمة لضمان التنظيم.');
  console.log('  - تم إنشاء 6 مهندسين (3 للحسوة و3 للدرين).');
  console.log('  - تم إنشاء 60 عميلاً تجريبياً (30 للحسوة و30 للدرين).');
  console.log('  - تم إدخال مبالغ بخاخات وخصومات متنوعة لفحص الحسابات.');
  console.log(`==========================================`);
}

main()
  .catch(e => {
    console.error('خطأ أثناء توليد البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
