import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const arabicNames = [
  "محمد اليافعي", "صالح الحريبي", "أحمد باوزير", "عبدالرحمن العمودي",
  "خالد الكلدي", "سعيد العولقي", "علي ناصر", "مازن الكازمي",
  "حسن القعيطي", "عوض الحضرمي", "سالم الكثيري", "فهد اليماني",
  "عادل الضالعي", "ياسر اليافعي", "طارق العنتري", "منير السعدي"
];

const carTypes = [
  "تويوتا كامري", "تويوتا كورولا", "تويوتا لاندكروزر", "تويوتا هيلوكس", "تويوتا يارس",
  "هيونداي سوناتا", "هيونداي النترا", "هيونداي توسان", "هيونداي سنتافي",
  "كيا سبورتج", "كيا سيراتو", "كيا أوبتيما",
  "بي واي دي S25", "بي واي دي F3",
  "جيتور X70", "جيتور Dashing",
  "شانجان كابتيفا", "شفروليه تاهو", "مرسيدس E300", "تسلا"
];

const paymentMethods = ["Cash", "Transfer", "Manager_Hand"];
const transferTypes = ["بنك القطيبي", "بنك الكريمي", "الشبكة الموحدة"];
const currencies = ["YER", "SAR", "USD"];

async function main() {
  console.log("جاري مسح فواتير العملاء والمهندسين القديمة لبدء التوليد النظيف...");
  
  await prisma.customer.deleteMany({});
  await prisma.archivedCustomer.deleteMany({});
  await prisma.engineer.deleteMany({});

  console.log("جاري إنشاء المهندسين للفروع...");

  // Create mock engineers for Haswa branch
  const engHaswa1 = await prisma.engineer.create({
    data: { name: "أحمد فريد (الحسوة)", branch: "الحسوة", phone: "777111222" }
  });
  const engHaswa2 = await prisma.engineer.create({
    data: { name: "علاء السعدي (الحسوة)", branch: "الحسوة", phone: "777222333" }
  });

  // Create mock engineers for Durein branch
  const engDurein1 = await prisma.engineer.create({
    data: { name: "صالح العولقي (الدرين)", branch: "الدرين", phone: "777333444" }
  });
  const engDurein2 = await prisma.engineer.create({
    data: { name: "خالد الحضرمي (الدرين)", branch: "الدرين", phone: "777444555" }
  });

  const engineersHaswa = [engHaswa1.id, engHaswa2.id];
  const engineersDurein = [engDurein1.id, engDurein2.id];

  console.log("جاري توليد 250 فاتورة صيانة موزعة على الفروع والتواريخ والعملات لخدمة الفحص...");

  // Generate 250 mock records
  for (let i = 0; i < 250; i++) {
    const branch = i % 2 === 0 ? "الحسوة" : "الدرين";
    const engineerId = branch === "الحسوة" 
      ? engineersHaswa[i % engineersHaswa.length] 
      : engineersDurein[i % engineersDurein.length];

    const customerName = `${arabicNames[i % arabicNames.length]} ${i + 1}`;
    const phone = `777${Math.floor(100000 + Math.random() * 900000)}`;
    const carType = carTypes[i % carTypes.length];
    const carYear = 2015 + (i % 11); // 2015 to 2025
    const currency = currencies[i % currencies.length];
    
    // Choose financial values based on currency
    let required = 0;
    let injectors = 0;
    
    if (currency === "YER") {
      required = 40000 + Math.floor(Math.random() * 200000);
      injectors = i % 4 === 0 ? 20000 : 0;
    } else if (currency === "SAR") {
      required = 200 + Math.floor(Math.random() * 1200);
      injectors = i % 4 === 0 ? 100 : 0;
    } else {
      required = 50 + Math.floor(Math.random() * 300);
      injectors = i % 4 === 0 ? 25 : 0;
    }

    // Determine status and paid amount
    const isUnworked = i % 12 === 0; // 1 out of 12 not worked on
    let paid = 0;
    let isNotWorkedOn = false;

    if (isUnworked) {
      isNotWorkedOn = true;
      paid = 0;
    } else {
      isNotWorkedOn = false;
      const isFullyPaid = i % 3 !== 0; // 2 out of 3 fully paid
      const netRequired = Math.max(required - injectors, 0);
      if (isFullyPaid) {
        paid = netRequired;
      } else {
        paid = Math.floor(netRequired * 0.6); // Paid 60%
      }
    }

    const payMethod = paymentMethods[i % paymentMethods.length];
    const transferType = payMethod === "Transfer" ? transferTypes[i % transferTypes.length] : null;

    // Distribute records across dates in May, June, July of 2026
    const date = new Date("2026-05-01T08:00:00.000Z");
    date.setDate(date.getDate() + (i * 0.3)); // Spread over weeks (closer together for high density)

    // Randomize some as archived and some as active
    const shouldArchive = i < 100; // 100 archived, 150 active

    if (shouldArchive) {
      const engName = branch === "الحسوة"
        ? (engineerId === engHaswa1.id ? engHaswa1.name : engHaswa2.name)
        : (engineerId === engDurein1.id ? engDurein1.name : engDurein2.name);

      await prisma.archivedCustomer.create({
        data: {
          customer_name: customerName,
          phone,
          car_type: carType,
          car_year: carYear,
          engineer_id: engineerId,
          engineer_name: engName,
          work_notes: "صيانة دورية متكاملة لسيارة العميل وتجهيزها بالكامل",
          required_amount: required,
          injectors_amount: injectors,
          paid_amount: paid,
          currency,
          payment_method: payMethod,
          transfer_type: transferType,
          is_not_worked_on: isNotWorkedOn,
          branch,
          createdAt: date
        }
      });
    } else {
      await prisma.customer.create({
        data: {
          customer_name: customerName,
          phone,
          car_type: carType,
          car_year: carYear,
          engineer_id: engineerId,
          work_notes: "فحص وبرمجة كمبيوتر شاملة مع صيانة المحرك وإصلاح الخلل",
          required_amount: required,
          injectors_amount: injectors,
          paid_amount: paid,
          currency,
          payment_method: payMethod,
          transfer_type: transferType,
          is_not_worked_on: isNotWorkedOn,
          branch,
          createdAt: date
        }
      });
    }
  }

  console.log("=========================================================");
  console.log(" تم توليد وإدراج البيانات التجريبية الضخمة بنجاح! 🚀");
  console.log(" - عدد السيارات الإجمالي: 250 سيارة (100 مؤرشفة و 150 نشطة)");
  console.log(" - الموزعة على فروع الحسوة والدرين بالتساوي.");
  console.log(" - العملات المتاحة: YER, SAR, USD.");
  console.log(" - المهندسون المسؤولون تم توليدهم وربطهم بكل فرع.");
  console.log("=========================================================");
}

main()
  .catch(e => {
    console.error("خطأ أثناء توليد البيانات:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
