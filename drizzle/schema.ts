import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime } from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين الأساسي
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // معلومات البلد الوطنية
  countryName: varchar("countryName", { length: 100 }).default("جمهوريتي"),
  countryMotto: varchar("countryMotto", { length: 200 }),
  flagColor1: varchar("flagColor1", { length: 7 }).default("#2ecc71"),
  flagColor2: varchar("flagColor2", { length: 7 }).default("#3498db"),
  flagColor3: varchar("flagColor3", { length: 7 }).default("#e74c3c"),
  
  // المستوى والتقدم
  currentLevel: int("currentLevel").default(1).notNull(), // 1: Emerging, 2: Developing, 3: Advanced
  totalGdp: int("totalGdp").default(0).notNull(),
  previousGdp: int("previousGdp").default(0).notNull(),
  streakDays: int("streakDays").default(0).notNull(),
  lastActiveDate: datetime("lastActiveDate"),
  
  // إعدادات
  preferredLanguage: varchar("preferredLanguage", { length: 2 }).default("ar"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول القطاعات الأساسية
 * Sectors configuration table
 */
export const sectors = mysqlTable("sectors", {
  id: int("id").autoincrement().primaryKey(),
  sectorKey: varchar("sectorKey", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  
  // متطلبات الفتح
  requiredLevel: int("requiredLevel").default(1).notNull(),
  unlockCondition: text("unlockCondition"), // JSON format
  
  // الأوزان للحسابات
  gdpWeight: int("gdpWeight").default(100).notNull(), // stored as int (1.5 = 150)
  importanceOrder: int("importanceOrder").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sector = typeof sectors.$inferSelect;
export type InsertSector = typeof sectors.$inferInsert;

/**
 * جدول قطاعات المستخدم
 * User sectors progress tracking
 */
export const userSectors = mysqlTable("userSectors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sectorId: int("sectorId").notNull(),
  
  // الحالة
  isUnlocked: boolean("isUnlocked").default(false).notNull(),
  currentScore: int("currentScore").default(0).notNull(), // 0-100
  previousScore: int("previousScore").default(0).notNull(),
  
  // الإحصائيات
  tasksCompleted: int("tasksCompleted").default(0).notNull(),
  tasksTotal: int("tasksTotal").default(0).notNull(),
  daysActive: int("daysActive").default(0).notNull(),
  lastUpdated: datetime("lastUpdated"),
  
  // الأهداف
  targetScore: int("targetScore").default(80).notNull(),
  quarterlyTarget: int("quarterlyTarget"),
  annualTarget: int("annualTarget"),
  
  unlockedAt: timestamp("unlockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSector = typeof userSectors.$inferSelect;
export type InsertUserSector = typeof userSectors.$inferInsert;

/**
 * جدول المهام
 * Tasks table
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sectorId: int("sectorId").notNull(),
  
  // معلومات المهمة
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // الحالة
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(),
  
  // التوقيت
  dueDate: datetime("dueDate"),
  estimatedHours: int("estimatedHours"),
  actualHours: int("actualHours"),
  
  // التكرار
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurrencePattern: varchar("recurrencePattern", { length: 50 }), // 'daily', 'weekly', 'monthly'
  
  // النقاط
  pointsValue: int("pointsValue").default(10).notNull(),
  
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * جدول السجلات اليومية
 * Daily logs for tracking
 */
export const dailyLogs = mysqlTable("dailyLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logDate: datetime("logDate").notNull(),
  
  // المؤشرات اليومية
  dailyGdp: int("dailyGdp"),
  tasksCompleted: int("tasksCompleted").default(0).notNull(),
  totalPointsEarned: int("totalPointsEarned").default(0).notNull(),
  
  // القطاعات النشطة
  activeSectorsCount: int("activeSectorsCount").default(0).notNull(),
  sectorsData: text("sectorsData"), // JSON format
  
  // الملاحظات
  userNotes: text("userNotes"),
  mood: mysqlEnum("mood", ["excellent", "good", "neutral", "poor"]).default("neutral"),
  energyLevel: int("energyLevel").default(5).notNull(), // 1-10
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

/**
 * جدول التقارير
 * Reports table
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // نوع التقرير
  reportType: mysqlEnum("reportType", ["weekly", "monthly", "quarterly", "annual"]).notNull(),
  periodStart: datetime("periodStart").notNull(),
  periodEnd: datetime("periodEnd").notNull(),
  
  // المؤشرات
  avgGdp: int("avgGdp"),
  gdpGrowthRate: int("gdpGrowthRate"), // stored as int (5.5% = 550)
  bestSector: varchar("bestSector", { length: 50 }),
  worstSector: varchar("worstSector", { length: 50 }),
  
  // الإحصائيات
  totalTasksCompleted: int("totalTasksCompleted"),
  totalPointsEarned: int("totalPointsEarned"),
  streakMaintained: boolean("streakMaintained"),
  
  // البيانات التفصيلية
  sectorsPerformance: text("sectorsPerformance"), // JSON format
  achievementsUnlocked: text("achievementsUnlocked"), // JSON format
  recommendations: text("recommendations"),
  
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * جدول الشراكات
 * Partnerships table
 */
export const partnerships = mysqlTable("partnerships", {
  id: int("id").autoincrement().primaryKey(),
  
  // الأطراف
  userId1: int("userId1").notNull(),
  userId2: int("userId2").notNull(),
  
  // معلومات الشراكة
  partnershipType: mysqlEnum("partnershipType", ["collaboration", "mentorship", "resource_exchange"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  
  // الحالة
  status: mysqlEnum("status", ["pending", "active", "completed", "cancelled"]).default("pending").notNull(),
  
  // القطاعات المشتركة
  sectorsInvolved: text("sectorsInvolved"), // JSON format
  
  // الأهداف
  goals: text("goals"),
  mutualBenefits: text("mutualBenefits"),
  
  // التقييم
  ratingUser1: int("ratingUser1"), // 1-5
  ratingUser2: int("ratingUser2"), // 1-5
  feedbackUser1: text("feedbackUser1"),
  feedbackUser2: text("feedbackUser2"),
  
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = typeof partnerships.$inferInsert;

/**
 * جدول الإنجازات
 * Achievements configuration table
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات الإنجاز
  achievementKey: varchar("achievementKey", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  icon: varchar("icon", { length: 10 }).notNull(),
  
  // الفئة
  category: mysqlEnum("category", ["sector", "gdp", "streak", "partnership", "special"]).notNull(),
  
  // شروط الحصول
  unlockConditions: text("unlockConditions"), // JSON format
  pointsReward: int("pointsReward").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * جدول إنجازات المستخدم
 * User achievements tracking
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * جدول الإشعارات
 * Notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // نوع الإشعار
  notificationType: mysqlEnum("notificationType", ["alert", "achievement", "partnership", "report", "reminder"]).notNull(),
  
  // المحتوى
  titleAr: varchar("titleAr", { length: 200 }),
  titleEn: varchar("titleEn", { length: 200 }),
  messageAr: text("messageAr"),
  messageEn: text("messageEn"),
  icon: varchar("icon", { length: 10 }),
  
  // الحالة
  isRead: boolean("isRead").default(false).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  
  // الإجراء
  actionUrl: varchar("actionUrl", { length: 255 }),
  actionLabelAr: varchar("actionLabelAr", { length: 50 }),
  actionLabelEn: varchar("actionLabelEn", { length: 50 }),
  
  readAt: timestamp("readAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * جدول الموارد القومية
 * National Resources table - tracks time, money, and energy
 */
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // الموارد الثلاثة الأساسية
  timeAvailable: int("timeAvailable").default(168).notNull(), // hours per week
  timeUsed: int("timeUsed").default(0).notNull(),
  
  moneyAvailable: int("moneyAvailable").default(1000).notNull(), // budget units
  moneyUsed: int("moneyUsed").default(0).notNull(),
  
  energyAvailable: int("energyAvailable").default(100).notNull(), // energy points
  energyUsed: int("energyUsed").default(0).notNull(),
  
  // التحديث
  lastReset: datetime("lastReset").notNull(), // weekly reset
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

/**
 * جدول توزيع الميزانية على القطاعات
 * Budget allocation per sector
 */
export const sectorBudgets = mysqlTable("sectorBudgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sectorId: int("sectorId").notNull(),
  
  // توزيع الموارد
  timeAllocated: int("timeAllocated").default(0).notNull(), // hours
  moneyAllocated: int("moneyAllocated").default(0).notNull(), // budget
  energyAllocated: int("energyAllocated").default(0).notNull(), // energy
  
  // الاستخدام الفعلي
  timeSpent: int("timeSpent").default(0).notNull(),
  moneySpent: int("moneySpent").default(0).notNull(),
  energySpent: int("energySpent").default(0).notNull(),
  
  // الأهداف
  targetTimePerWeek: int("targetTimePerWeek"),
  targetBudgetPerMonth: int("targetBudgetPerMonth"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SectorBudget = typeof sectorBudgets.$inferSelect;
export type InsertSectorBudget = typeof sectorBudgets.$inferInsert;

/**
 * جدول المشروعات التنموية
 * Development Projects table
 */
export const developmentProjects = mysqlTable("developmentProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sectorId: int("sectorId").notNull(),
  
  // معلومات المشروع
  titleAr: varchar("titleAr", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  
  // الحالة
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "paused", "cancelled"]).default("planned").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  
  // التكلفة والموارد المطلوبة
  requiredTime: int("requiredTime").default(0).notNull(), // hours
  requiredMoney: int("requiredMoney").default(0).notNull(), // budget units
  requiredEnergy: int("requiredEnergy").default(0).notNull(), // energy points
  
  // التقدم
  progressPercentage: int("progressPercentage").default(0).notNull(), // 0-100
  timeSpent: int("timeSpent").default(0).notNull(),
  moneySpent: int("moneySpent").default(0).notNull(),
  energySpent: int("energySpent").default(0).notNull(),
  
  // التأثير المتوقع
  expectedImpactOnScore: int("expectedImpactOnScore").default(0).notNull(), // +points to sector score
  actualImpactOnScore: int("actualImpactOnScore").default(0).notNull(),
  
  // التواريخ
  startDate: datetime("startDate"),
  targetCompletionDate: datetime("targetCompletionDate"),
  actualCompletionDate: datetime("actualCompletionDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DevelopmentProject = typeof developmentProjects.$inferSelect;
export type InsertDevelopmentProject = typeof developmentProjects.$inferInsert;

/**
 * جدول معالم المشروع (Milestones)
 * Project Milestones table
 */
export const projectMilestones = mysqlTable("projectMilestones", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  titleAr: varchar("titleAr", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  
  isCompleted: boolean("isCompleted").default(false).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  
  completedAt: datetime("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = typeof projectMilestones.$inferInsert;
