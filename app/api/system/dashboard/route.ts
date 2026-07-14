import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const normalizeArabic = (str: string) => {
  return str
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[ىي]/g, "ي")
    .trim();
};

const getCarBrandAndModel = (carType: string) => {
  if (!carType) return { brand: "غير محدد", model: "عام" };
  
  const cleanText = carType.replace(/[-\/\\()]/g, " ").replace(/\s+/g, " ").trim();
  const words = cleanText.split(" ");
  const firstWordRaw = words[0] || "";
  const firstWord = normalizeArabic(firstWordRaw);
  
  // Known model mappings to company brands
  const modelToBrand: Record<string, string> = {
    "كامري": "تويوتا",
    "كورولا": "تويوتا",
    "يارس": "تويوتا",
    "هيلوكس": "تويوتا",
    "لاندكروزر": "تويوتا",
    "سوناتا": "هيونداي",
    "النترا": "هيونداي",
    "اكسنت": "هيونداي",
    "توسان": "هيونداي",
    "سنتافي": "هيونداي",
    "سبورتج": "كيا",
    "سيراتو": "كيا",
    "أوبتيما": "كيا",
    "سورينتو": "كيا",
    "تاهو": "شفروليه",
    "يوكن": "شفروليه",
    "كابتيفا": "شانجان",
    "دومينو": "جيتور",
    "X70": "جيتور",
  };

  // If first word is a known model
  if (modelToBrand[firstWord]) {
    return { brand: modelToBrand[firstWord], model: firstWordRaw };
  }

  // Check if second word is a known model
  const secondWordRaw = words[1] || "";
  const secondWord = normalizeArabic(secondWordRaw);
  if (secondWord && modelToBrand[secondWord]) {
    return { brand: modelToBrand[secondWord], model: secondWordRaw };
  }

  // Fallback
  let brand = firstWordRaw;
  const normalizedBrand = normalizeArabic(brand);
  if (normalizedBrand === "تويوتا" || normalizedBrand === "toyota") brand = "تويوتا";
  else if (normalizedBrand === "هيونداي" || normalizedBrand === "hyundai") brand = "هيونداي";
  else if (normalizedBrand === "كيا" || normalizedBrand === "kia") brand = "كيا";
  else if (normalizedBrand === "بي واي دي" || normalizedBrand === "byd" || normalizedBrand === "بي" || normalizedBrand === "بي_واي_دي") brand = "بي واي دي (BYD)";
  else if (normalizedBrand === "جيتور" || normalizedBrand === "jetour") brand = "جيتور";
  else if (normalizedBrand === "شانجان" || normalizedBrand === "changan") brand = "شانجان";
  else if (normalizedBrand === "مرسيدس" || normalizedBrand === "mercedes") brand = "مرسيدس";
  else if (normalizedBrand === "تسلا" || normalizedBrand === "tesla") brand = "تسلا";

  const model = secondWordRaw || "عام";
  return { brand, model };
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const dateFilter: any = {};
    if (start && end) {
      dateFilter.createdAt = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    // Fetch active and archived records concurrently
    const [customers, archived] = await Promise.all([
      prisma.customer.findMany({
        where: {
          ...dateFilter,
          is_not_worked_on: false,
        },
        include: { engineer: true },
      }),
      prisma.archivedCustomer.findMany({
        where: dateFilter,
      }),
    ]);

    // Financial KPI stats
    const financials = {
      YER: { total: 0, paid: 0, debt: 0 },
      SAR: { total: 0, paid: 0, debt: 0 },
      USD: { total: 0, paid: 0, debt: 0 },
    };

    // Branch metrics
    const branches: Record<string, { YER: number; SAR: number; USD: number; cars: number }> = {
      "الحسوة": { YER: 0, SAR: 0, USD: 0, cars: 0 },
      "الدرين": { YER: 0, SAR: 0, USD: 0, cars: 0 },
    };

    // Engineers performance
    const engineersMap: Record<string, { name: string; carsCount: number; YER: number; SAR: number; USD: number }> = {};

    // Brands / Models metrics
    const brandsMap: Record<string, { total: number; models: Record<string, number> }> = {};

    const allRecords = [
      ...customers.map(c => ({
        ...c,
        engineerName: c.engineer?.name || "غير محدد",
        isArchived: false,
      })),
      ...archived.map(c => ({
        ...c,
        engineerName: c.engineer_name || "غير محدد",
        isArchived: true,
      })),
    ];

    let totalCarsCount = allRecords.length;
    let injectorsTotalCount = 0;

    for (const record of allRecords) {
      const cur = record.currency as "YER" | "SAR" | "USD";
      if (!financials[cur]) continue;

      const required = record.required_amount || 0;
      const paid = record.paid_amount || 0;
      const injectors = record.injectors_amount || 0;
      const netRequired = Math.max(required - injectors, 0);
      const remaining = Math.max(netRequired - paid, 0);

      // Financials aggregation
      financials[cur].total += netRequired;
      financials[cur].paid += paid;
      financials[cur].debt += remaining;

      if (injectors > 0) {
        injectorsTotalCount++;
      }

      // Branch aggregation
      const branchName = record.branch || "الحسوة";
      if (branches[branchName]) {
        branches[branchName][cur] += paid;
        branches[branchName].cars++;
      }

      // Engineer performance
      const engId = record.engineer_id || "unassigned";
      const engName = record.engineerName;
      if (!engineersMap[engId]) {
        engineersMap[engId] = { name: engName, carsCount: 0, YER: 0, SAR: 0, USD: 0 };
      }
      engineersMap[engId].carsCount++;
      engineersMap[engId][cur] += paid;

      // Car Brand / Model classification
      const { brand, model } = getCarBrandAndModel(record.car_type);
      if (!brandsMap[brand]) {
        brandsMap[brand] = { total: 0, models: {} };
      }
      brandsMap[brand].total++;
      brandsMap[brand].models[model] = (brandsMap[brand].models[model] || 0) + 1;
    }

    // Format engineers performance
    const engineersData = Object.values(engineersMap).sort((a, b) => b.carsCount - a.carsCount);

    // Format brands data
    const brandsData = Object.entries(brandsMap).map(([brandName, data]) => {
      const modelsSorted = Object.entries(data.models)
        .map(([modelName, count]) => ({ name: modelName, count }))
        .sort((a, b) => b.count - a.count);

      return {
        brand: brandName,
        total: data.total,
        models: modelsSorted,
      };
    }).sort((a, b) => b.total - a.total);

    return NextResponse.json({
      totalCars: totalCarsCount,
      injectorsCount: injectorsTotalCount,
      financials,
      branches,
      engineers: engineersData,
      carBrands: brandsData,
    });
  } catch (error) {
    console.error("Dashboard analytics API error:", error);
    return NextResponse.json({ error: "Failed to generate dashboard statistics" }, { status: 500 });
  }
}
