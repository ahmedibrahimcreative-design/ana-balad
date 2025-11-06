import { drizzle } from "drizzle-orm/mysql2";
import { sectors, achievements } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 بدء إضافة البيانات الأولية...");

  // إضافة القطاعات الأساسية
  const sectorsData = [
    {
      sectorKey: "infrastructure",
      nameAr: "البنية التحتية",
      nameEn: "Infrastructure",
      icon: "🏗️",
      descriptionAr: "الروتين اليومي والعادات الأساسية",
      descriptionEn: "Daily routines and basic habits",
      requiredLevel: 1,
      gdpWeight: 150, // 1.5
      importanceOrder: 1,
    },
    {
      sectorKey: "health",
      nameAr: "الصحة",
      nameEn: "Health",
      icon: "🏥",
      descriptionAr: "الصحة البدنية والعقلية",
      descriptionEn: "Physical and mental health",
      requiredLevel: 1,
      gdpWeight: 130, // 1.3
      importanceOrder: 2,
    },
    {
      sectorKey: "economy",
      nameAr: "الاقتصاد القومي",
      nameEn: "National Economy",
      icon: "💰",
      descriptionAr: "الميزانية والادخار والاستثمار",
      descriptionEn: "Budget, savings, and investments",
      requiredLevel: 1,
      gdpWeight: 120, // 1.2
      importanceOrder: 3,
    },
    {
      sectorKey: "education",
      nameAr: "التعليم والتطوير",
      nameEn: "Education & Development",
      icon: "📚",
      descriptionAr: "التعلم المستمر وتطوير المهارات",
      descriptionEn: "Continuous learning and skill development",
      requiredLevel: 2,
      gdpWeight: 110, // 1.1
      importanceOrder: 4,
      unlockCondition: JSON.stringify({ avgScore: 70, gdpMin: 700 }),
    },
    {
      sectorKey: "defense",
      nameAr: "الدفاع",
      nameEn: "Defense",
      icon: "🛡️",
      descriptionAr: "حماية الإنجازات والحفاظ على التقدم",
      descriptionEn: "Protecting achievements and maintaining progress",
      requiredLevel: 2,
      gdpWeight: 120, // 1.2
      importanceOrder: 5,
      unlockCondition: JSON.stringify({ avgScore: 70, gdpMin: 700 }),
    },
    {
      sectorKey: "career",
      nameAr: "العمل والمهنة",
      nameEn: "Career",
      icon: "💼",
      descriptionAr: "التقدم المهني والإنجازات العملية",
      descriptionEn: "Professional advancement and work achievements",
      requiredLevel: 2,
      gdpWeight: 110, // 1.1
      importanceOrder: 6,
      unlockCondition: JSON.stringify({ avgScore: 70, gdpMin: 700 }),
    },
    {
      sectorKey: "relations",
      nameAr: "العلاقات والأسرة",
      nameEn: "Relations & Family",
      icon: "👨‍👩‍👧‍👦",
      descriptionAr: "العلاقات الاجتماعية والعائلية",
      descriptionEn: "Social and family relationships",
      requiredLevel: 3,
      gdpWeight: 100, // 1.0
      importanceOrder: 7,
      unlockCondition: JSON.stringify({ avgScore: 80, gdpMin: 850 }),
    },
    {
      sectorKey: "creativity",
      nameAr: "الإبداع والهوايات",
      nameEn: "Creativity & Hobbies",
      icon: "🎨",
      descriptionAr: "الإبداع والفنون والهوايات",
      descriptionEn: "Creativity, arts, and hobbies",
      requiredLevel: 3,
      gdpWeight: 90, // 0.9
      importanceOrder: 8,
      unlockCondition: JSON.stringify({ avgScore: 80, gdpMin: 850 }),
    },
    {
      sectorKey: "spirituality",
      nameAr: "الروحانيات",
      nameEn: "Spirituality",
      icon: "🧘",
      descriptionAr: "السلام النفسي والروحاني",
      descriptionEn: "Mental and spiritual peace",
      requiredLevel: 3,
      gdpWeight: 90, // 0.9
      importanceOrder: 9,
      unlockCondition: JSON.stringify({ avgScore: 80, gdpMin: 850 }),
    },
  ];

  console.log("📊 إضافة القطاعات...");
  for (const sector of sectorsData) {
    await db.insert(sectors).values(sector).onDuplicateKeyUpdate({
      set: {
        nameAr: sector.nameAr,
        nameEn: sector.nameEn,
        icon: sector.icon,
        descriptionAr: sector.descriptionAr,
        descriptionEn: sector.descriptionEn,
        requiredLevel: sector.requiredLevel,
        gdpWeight: sector.gdpWeight,
        importanceOrder: sector.importanceOrder,
        unlockCondition: sector.unlockCondition,
      },
    });
  }
  console.log("✅ تم إضافة القطاعات بنجاح");

  // إضافة الإنجازات الأساسية
  const achievementsData = [
    {
      achievementKey: "first_login",
      nameAr: "البداية",
      nameEn: "The Beginning",
      icon: "🌱",
      descriptionAr: "سجلت دخولك لأول مرة",
      descriptionEn: "You logged in for the first time",
      category: "special" as const,
      unlockConditions: JSON.stringify({ firstLogin: true }),
      pointsReward: 10,
    },
    {
      achievementKey: "emerging_nation",
      nameAr: "دولة ناشئة",
      nameEn: "Emerging Nation",
      icon: "🌱",
      descriptionAr: "وصلت إلى GDP 500+",
      descriptionEn: "Reached GDP 500+",
      category: "gdp" as const,
      unlockConditions: JSON.stringify({ gdpMin: 500 }),
      pointsReward: 50,
    },
    {
      achievementKey: "developing_nation",
      nameAr: "دولة نامية",
      nameEn: "Developing Nation",
      icon: "🏗️",
      descriptionAr: "وصلت إلى GDP 750+",
      descriptionEn: "Reached GDP 750+",
      category: "gdp" as const,
      unlockConditions: JSON.stringify({ gdpMin: 750 }),
      pointsReward: 100,
    },
    {
      achievementKey: "advanced_nation",
      nameAr: "دولة متقدمة",
      nameEn: "Advanced Nation",
      icon: "🏛️",
      descriptionAr: "وصلت إلى GDP 900+",
      descriptionEn: "Reached GDP 900+",
      category: "gdp" as const,
      unlockConditions: JSON.stringify({ gdpMin: 900 }),
      pointsReward: 200,
    },
    {
      achievementKey: "superpower",
      nameAr: "دولة عظمى",
      nameEn: "Superpower",
      icon: "👑",
      descriptionAr: "وصلت إلى GDP 1000+",
      descriptionEn: "Reached GDP 1000+",
      category: "gdp" as const,
      unlockConditions: JSON.stringify({ gdpMin: 1000 }),
      pointsReward: 500,
    },
    {
      achievementKey: "7_day_streak",
      nameAr: "أسبوع من الالتزام",
      nameEn: "7-Day Streak",
      icon: "🔥",
      descriptionAr: "حافظت على streak لمدة 7 أيام",
      descriptionEn: "Maintained a 7-day streak",
      category: "streak" as const,
      unlockConditions: JSON.stringify({ streakDays: 7 }),
      pointsReward: 30,
    },
    {
      achievementKey: "30_day_streak",
      nameAr: "شهر من الالتزام",
      nameEn: "30-Day Streak",
      icon: "🔥",
      descriptionAr: "حافظت على streak لمدة 30 يوم",
      descriptionEn: "Maintained a 30-day streak",
      category: "streak" as const,
      unlockConditions: JSON.stringify({ streakDays: 30 }),
      pointsReward: 75,
    },
    {
      achievementKey: "90_day_streak",
      nameAr: "ثلاثة أشهر من الالتزام",
      nameEn: "90-Day Streak",
      icon: "⚡",
      descriptionAr: "حافظت على streak لمدة 90 يوم",
      descriptionEn: "Maintained a 90-day streak",
      category: "streak" as const,
      unlockConditions: JSON.stringify({ streakDays: 90 }),
      pointsReward: 150,
    },
    {
      achievementKey: "365_day_streak",
      nameAr: "سنة كاملة من الالتزام",
      nameEn: "365-Day Streak",
      icon: "💎",
      descriptionAr: "حافظت على streak لمدة سنة كاملة",
      descriptionEn: "Maintained a full year streak",
      category: "streak" as const,
      unlockConditions: JSON.stringify({ streakDays: 365 }),
      pointsReward: 1000,
    },
    {
      achievementKey: "first_partnership",
      nameAr: "شراكة أولى",
      nameEn: "First Partnership",
      icon: "🤝",
      descriptionAr: "أكملت أول شراكة ناجحة",
      descriptionEn: "Completed your first successful partnership",
      category: "partnership" as const,
      unlockConditions: JSON.stringify({ partnerships: 1 }),
      pointsReward: 50,
    },
    {
      achievementKey: "master_all_sectors",
      nameAr: "إتقان جميع القطاعات",
      nameEn: "Master All Sectors",
      icon: "👑",
      descriptionAr: "حققت 85%+ في جميع القطاعات",
      descriptionEn: "Achieved 85%+ in all sectors",
      category: "sector" as const,
      unlockConditions: JSON.stringify({ allSectorsAbove: 85 }),
      pointsReward: 500,
    },
    {
      achievementKey: "perfect_sector",
      nameAr: "قطاع مثالي",
      nameEn: "Perfect Sector",
      icon: "⭐",
      descriptionAr: "حققت 100% في قطاع واحد",
      descriptionEn: "Achieved 100% in one sector",
      category: "sector" as const,
      unlockConditions: JSON.stringify({ perfectSector: 1 }),
      pointsReward: 100,
    },
    {
      achievementKey: "sustainable_nation",
      nameAr: "دولة مستدامة",
      nameEn: "Sustainable Nation",
      icon: "🏆",
      descriptionAr: "استمرارية 90 يوم في النشاط",
      descriptionEn: "90 days of continuous activity",
      category: "streak" as const,
      unlockConditions: JSON.stringify({ streakDays: 90 }),
      pointsReward: 200,
    },
    {
      achievementKey: "economic_renaissance",
      nameAr: "نهضة اقتصادية",
      nameEn: "Economic Renaissance",
      icon: "🌟",
      descriptionAr: "تحسن 40% في ربع سنوي",
      descriptionEn: "40% improvement in a quarter",
      category: "special" as const,
      unlockConditions: JSON.stringify({ growthRate: 40 }),
      pointsReward: 150,
    },
    {
      achievementKey: "trusted_partner",
      nameAr: "شريك موثوق",
      nameEn: "Trusted Partner",
      icon: "🤝",
      descriptionAr: "5 شراكات ناجحة",
      descriptionEn: "5 successful partnerships",
      category: "partnership" as const,
      unlockConditions: JSON.stringify({ partnerships: 5 }),
      pointsReward: 100,
    },
    {
      achievementKey: "emergency_rescue",
      nameAr: "إنقاذ طارئ",
      nameEn: "Emergency Rescue",
      icon: "⚡",
      descriptionAr: "إنقاذ قطاع من الانهيار",
      descriptionEn: "Rescue a sector from collapse",
      category: "special" as const,
      unlockConditions: JSON.stringify({ sectorRescue: 1 }),
      pointsReward: 250,
    },
  ];

  console.log("🏆 إضافة الإنجازات...");
  for (const achievement of achievementsData) {
    await db.insert(achievements).values(achievement).onDuplicateKeyUpdate({
      set: {
        nameAr: achievement.nameAr,
        nameEn: achievement.nameEn,
        icon: achievement.icon,
        descriptionAr: achievement.descriptionAr,
        descriptionEn: achievement.descriptionEn,
        category: achievement.category,
        unlockConditions: achievement.unlockConditions,
        pointsReward: achievement.pointsReward,
      },
    });
  }
  console.log("✅ تم إضافة الإنجازات بنجاح");

  console.log("✨ اكتملت عملية إضافة البيانات الأولية بنجاح!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ خطأ في إضافة البيانات:", error);
  process.exit(1);
});
