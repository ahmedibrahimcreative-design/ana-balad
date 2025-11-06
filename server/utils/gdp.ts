/**
 * خوارزمية حساب الناتج القومي
 * National GDP Calculation Algorithm
 */

interface SectorData {
  sectorKey: string;
  score: number;
  weight: number; // stored as int (1.5 = 150)
  isUnlocked: boolean;
}

interface GDPCalculationResult {
  totalGdp: number;
  baseGdp: number;
  growthBonus: number;
  streakBonus: number;
  diversityBonus: number;
  growthRate: number;
}

/**
 * حساب الـ GDP الأساسي (BaseGDP)
 * Calculate Base GDP
 */
export function calculateBaseGDP(sectors: SectorData[]): number {
  const activeSectors = sectors.filter(s => s.isUnlocked);
  
  if (activeSectors.length === 0) {
    return 0;
  }
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const sector of activeSectors) {
    const actualWeight = sector.weight / 100; // convert 150 to 1.5
    weightedSum += sector.score * actualWeight;
    totalWeight += actualWeight;
  }
  
  const avgScore = weightedSum / totalWeight;
  const baseGdp = avgScore * 10;
  
  return Math.round(baseGdp);
}

/**
 * حساب مكافأة النمو (GrowthBonus)
 * Calculate Growth Bonus
 */
export function calculateGrowthBonus(currentBaseGdp: number, previousGdp: number): number {
  if (previousGdp === 0) {
    return 0;
  }
  
  const growthRate = ((currentBaseGdp - previousGdp) / previousGdp) * 100;
  const growthBonus = Math.max(0, growthRate * 2);
  
  return Math.round(growthBonus);
}

/**
 * حساب مكافأة الاستمرارية (StreakBonus)
 * Calculate Streak Bonus
 */
export function calculateStreakBonus(streakDays: number): number {
  return Math.min(streakDays * 2, 100);
}

/**
 * حساب مكافأة التنوع (DiversityBonus)
 * Calculate Diversity Bonus
 */
export function calculateDiversityBonus(activeSectorsCount: number, totalAvailableSectors: number): number {
  if (totalAvailableSectors === 0) {
    return 0;
  }
  
  return Math.round((activeSectorsCount / totalAvailableSectors) * 50);
}

/**
 * حساب الناتج القومي الكامل
 * Calculate Complete National GDP
 */
export function calculateNationalGDP(params: {
  sectors: SectorData[];
  previousGdp: number;
  streakDays: number;
  totalAvailableSectors: number;
}): GDPCalculationResult {
  const { sectors, previousGdp, streakDays, totalAvailableSectors } = params;
  
  // 1. BaseGDP
  const baseGdp = calculateBaseGDP(sectors);
  
  // 2. GrowthBonus
  const growthBonus = calculateGrowthBonus(baseGdp, previousGdp);
  const growthRate = previousGdp > 0 ? ((baseGdp - previousGdp) / previousGdp) * 100 : 0;
  
  // 3. StreakBonus
  const streakBonus = calculateStreakBonus(streakDays);
  
  // 4. DiversityBonus
  const activeSectorsCount = sectors.filter(s => s.isUnlocked).length;
  const diversityBonus = calculateDiversityBonus(activeSectorsCount, totalAvailableSectors);
  
  // النتيجة النهائية
  const totalGdp = baseGdp + growthBonus + streakBonus + diversityBonus;
  
  return {
    totalGdp: Math.round(totalGdp),
    baseGdp: Math.round(baseGdp),
    growthBonus: Math.round(growthBonus),
    streakBonus,
    diversityBonus,
    growthRate: Math.round(growthRate * 10) / 10, // round to 1 decimal
  };
}

/**
 * تصنيف الدولة بناءً على GDP
 * Classify nation based on GDP
 */
export function classifyNation(gdp: number): {
  classification: string;
  classificationAr: string;
  color: string;
  icon: string;
} {
  if (gdp >= 1000) {
    return {
      classification: "Superpower",
      classificationAr: "دولة عظمى",
      color: "#FFD700",
      icon: "👑",
    };
  }
  
  if (gdp >= 901) {
    return {
      classification: "Outstanding Nation",
      classificationAr: "دولة متفوقة",
      color: "#9B59B6",
      icon: "⭐",
    };
  }
  
  if (gdp >= 751) {
    return {
      classification: "Advanced Nation",
      classificationAr: "دولة متقدمة",
      color: "#3498DB",
      icon: "🏛️",
    };
  }
  
  if (gdp >= 601) {
    return {
      classification: "Developing Nation",
      classificationAr: "دولة نامية",
      color: "#2ECC71",
      icon: "🏗️",
    };
  }
  
  if (gdp >= 401) {
    return {
      classification: "Emerging Nation",
      classificationAr: "دولة ناشئة",
      color: "#F39C12",
      icon: "🌱",
    };
  }
  
  return {
    classification: "Struggling Nation",
    classificationAr: "دولة متعثرة",
    color: "#E74C3C",
    icon: "🚨",
  };
}

/**
 * حساب متطلبات الانتقال للمستوى التالي
 * Calculate requirements for next level
 */
export function getNextLevelRequirements(currentLevel: number): {
  requiredGdp: number;
  requiredAvgScore: number;
  additionalRequirements?: string;
} | null {
  if (currentLevel === 1) {
    return {
      requiredGdp: 700,
      requiredAvgScore: 70,
      additionalRequirements: "حقق 70%+ في جميع القطاعات الأساسية",
    };
  }
  
  if (currentLevel === 2) {
    return {
      requiredGdp: 850,
      requiredAvgScore: 80,
      additionalRequirements: "حقق 80%+ في جميع القطاعات المفتوحة",
    };
  }
  
  return null; // Max level reached
}

/**
 * التحقق من إمكانية فتح قطاع جديد
 * Check if a sector can be unlocked
 */
export function canUnlockSector(params: {
  currentGdp: number;
  avgScore: number;
  requiredLevel: number;
  userLevel: number;
  unlockCondition?: string;
}): boolean {
  const { currentGdp, avgScore, requiredLevel, userLevel, unlockCondition } = params;
  
  // Check level requirement
  if (userLevel < requiredLevel) {
    return false;
  }
  
  // Check unlock conditions if specified
  if (unlockCondition) {
    try {
      const conditions = JSON.parse(unlockCondition);
      
      if (conditions.gdpMin && currentGdp < conditions.gdpMin) {
        return false;
      }
      
      if (conditions.avgScore && avgScore < conditions.avgScore) {
        return false;
      }
    } catch (error) {
      console.error("Error parsing unlock condition:", error);
      return false;
    }
  }
  
  return true;
}
