import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser,
  InsertDevelopmentProject,
  InsertProjectMilestone, 
  users, 
  sectors, 
  userSectors, 
  tasks, 
  dailyLogs, 
  reports,
  resources,
  sectorBudgets,
  developmentProjects,
  projectMilestones, 
  achievements, 
  userAchievements, 
  notifications,
  partnerships,
  Sector,
  UserSector,
  Task,
  Achievement,
  UserAchievement,
  Notification,
  DailyLog,
  Report,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ Sectors Functions ============

export async function getAllSectors(): Promise<Sector[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(sectors).orderBy(sectors.importanceOrder);
  return result;
}

export async function getSectorById(sectorId: number): Promise<Sector | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sectors).where(eq(sectors.id, sectorId)).limit(1);
  return result[0];
}

export async function getSectorByKey(sectorKey: string): Promise<Sector | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sectors).where(eq(sectors.sectorKey, sectorKey)).limit(1);
  return result[0];
}

// ============ User Sectors Functions ============

export async function getUserSectors(userId: number): Promise<UserSector[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(userSectors).where(eq(userSectors.userId, userId));
  return result;
}

export async function getUserSectorById(userId: number, sectorId: number): Promise<UserSector | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userSectors)
    .where(and(eq(userSectors.userId, userId), eq(userSectors.sectorId, sectorId)))
    .limit(1);
  return result[0];
}

export async function createUserSector(data: {
  userId: number;
  sectorId: number;
  isUnlocked: boolean;
  currentScore?: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(userSectors).values({
    userId: data.userId,
    sectorId: data.sectorId,
    isUnlocked: data.isUnlocked,
    currentScore: data.currentScore || 0,
    previousScore: 0,
    tasksCompleted: 0,
    tasksTotal: 0,
    daysActive: 0,
    targetScore: 80,
  });
}

export async function updateUserSectorScore(userId: number, sectorId: number, newScore: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const currentSector = await getUserSectorById(userId, sectorId);
  if (!currentSector) return;
  
  await db.update(userSectors)
    .set({
      previousScore: currentSector.currentScore,
      currentScore: newScore,
      lastUpdated: new Date(),
    })
    .where(and(eq(userSectors.userId, userId), eq(userSectors.sectorId, sectorId)));
}

export async function unlockUserSector(userId: number, sectorId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(userSectors)
    .set({
      isUnlocked: true,
      unlockedAt: new Date(),
    })
    .where(and(eq(userSectors.userId, userId), eq(userSectors.sectorId, sectorId)));
}

// ============ Tasks Functions ============

export async function getUserTasks(userId: number, filters?: {
  sectorId?: number;
  status?: string;
}): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (filters?.sectorId) {
    const result = await db.select().from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.sectorId, filters.sectorId)))
      .orderBy(desc(tasks.createdAt));
    return result;
  }
  
  const result = await db.select().from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
  return result;
}

export async function createTask(data: {
  userId: number;
  sectorId: number;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
  isRecurring?: boolean;
  recurrencePattern?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(tasks).values({
    userId: data.userId,
    sectorId: data.sectorId,
    title: data.title,
    description: data.description || null,
    priority: (data.priority as any) || "medium",
    status: "pending",
    progressPercentage: 0,
    dueDate: data.dueDate || null,
    isRecurring: data.isRecurring || false,
    recurrencePattern: data.recurrencePattern || null,
    pointsValue: 10,
  });
}

export async function updateTaskStatus(taskId: number, status: string, progressPercentage?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  
  if (progressPercentage !== undefined) {
    updateData.progressPercentage = progressPercentage;
  }
  
  if (status === "completed") {
    updateData.completedAt = new Date();
    updateData.progressPercentage = 100;
  }
  
  await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));
}

export async function deleteTask(taskId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

// ============ Daily Logs Functions ============

export async function createDailyLog(data: {
  userId: number;
  logDate: Date;
  dailyGdp: number;
  tasksCompleted: number;
  totalPointsEarned: number;
  activeSectorsCount: number;
  sectorsData: string;
  mood?: string;
  energyLevel?: number;
  userNotes?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(dailyLogs).values({
    userId: data.userId,
    logDate: data.logDate,
    dailyGdp: data.dailyGdp,
    tasksCompleted: data.tasksCompleted,
    totalPointsEarned: data.totalPointsEarned,
    activeSectorsCount: data.activeSectorsCount,
    sectorsData: data.sectorsData,
    mood: (data.mood as any) || "neutral",
    energyLevel: data.energyLevel || 5,
    userNotes: data.userNotes || null,
  });
}

export async function getUserDailyLogs(userId: number, startDate?: Date, endDate?: Date): Promise<DailyLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (startDate && endDate) {
    const result = await db.select().from(dailyLogs)
      .where(
        and(
          eq(dailyLogs.userId, userId),
          gte(dailyLogs.logDate, startDate),
          lte(dailyLogs.logDate, endDate)
        )
      )
      .orderBy(desc(dailyLogs.logDate));
    return result;
  }
  
  const result = await db.select().from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(desc(dailyLogs.logDate));
  return result;
}

// ============ Achievements Functions ============

export async function getAllAchievements(): Promise<Achievement[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(achievements);
  return result;
}

export async function getUserAchievements(userId: number): Promise<UserAchievement[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  return result;
}

export async function unlockAchievement(userId: number, achievementId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Check if already unlocked
  const existing = await db.select().from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(userAchievements).values({
      userId,
      achievementId,
    });
  }
}

// ============ Notifications Functions ============

export async function createNotification(data: {
  userId: number;
  notificationType: string;
  titleAr: string;
  titleEn: string;
  messageAr?: string;
  messageEn?: string;
  icon?: string;
  priority?: string;
  actionUrl?: string;
  actionLabelAr?: string;
  actionLabelEn?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(notifications).values({
    userId: data.userId,
    notificationType: data.notificationType as any,
    titleAr: data.titleAr,
    titleEn: data.titleEn,
    messageAr: data.messageAr || null,
    messageEn: data.messageEn || null,
    icon: data.icon || null,
    priority: (data.priority as any) || "medium",
    actionUrl: data.actionUrl || null,
    actionLabelAr: data.actionLabelAr || null,
    actionLabelEn: data.actionLabelEn || null,
    isRead: false,
  });
}

export async function getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (unreadOnly) {
    const result = await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
    return result;
  }
  
  const result = await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
  return result;
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

// ============ User Profile Functions ============

export async function updateUserProfile(userId: number, data: {
  countryName?: string;
  countryMotto?: string;
  flagColor1?: string;
  flagColor2?: string;
  flagColor3?: string;
  preferredLanguage?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  
  if (data.countryName !== undefined) updateData.countryName = data.countryName;
  if (data.countryMotto !== undefined) updateData.countryMotto = data.countryMotto;
  if (data.flagColor1 !== undefined) updateData.flagColor1 = data.flagColor1;
  if (data.flagColor2 !== undefined) updateData.flagColor2 = data.flagColor2;
  if (data.flagColor3 !== undefined) updateData.flagColor3 = data.flagColor3;
  if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage;
  
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function updateUserGDP(userId: number, gdp: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return;
  
  await db.update(users)
    .set({
      previousGdp: user[0].totalGdp,
      totalGdp: gdp,
    })
    .where(eq(users.id, userId));
}

export async function updateUserStreak(userId: number, streakDays: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users)
    .set({
      streakDays,
      lastActiveDate: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserLevel(userId: number, level: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users)
    .set({ currentLevel: level })
    .where(eq(users.id, userId));
}

/**
 * دوال الموارد
 * Resources functions
 */
export async function getUserResources(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(resources).where(eq(resources.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function initializeUserResources(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserResources(userId);
  if (existing) return existing;
  
  await db.insert(resources).values({
    userId,
    timeAvailable: 168, // 24 hours * 7 days
    timeUsed: 0,
    moneyAvailable: 1000,
    moneyUsed: 0,
    energyAvailable: 100,
    energyUsed: 0,
    lastReset: new Date(),
  });
  
  return await getUserResources(userId);
}

export async function updateResourceUsage(userId: number, data: {
  timeUsed?: number;
  moneyUsed?: number;
  energyUsed?: number;
}) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(resources)
    .set(data)
    .where(eq(resources.userId, userId));
}

export async function resetWeeklyResources(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(resources)
    .set({
      timeUsed: 0,
      moneyUsed: 0,
      energyUsed: 0,
      lastReset: new Date(),
    })
    .where(eq(resources.userId, userId));
}

/**
 * دوال ميزانية القطاعات
 * Sector budget functions
 */
export async function getSectorBudgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(sectorBudgets).where(eq(sectorBudgets.userId, userId));
  return result;
}

export async function getSectorBudget(userId: number, sectorId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(sectorBudgets)
    .where(and(eq(sectorBudgets.userId, userId), eq(sectorBudgets.sectorId, sectorId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateSectorBudget(userId: number, sectorId: number, data: {
  timeAllocated?: number;
  moneyAllocated?: number;
  energyAllocated?: number;
  timeSpent?: number;
  moneySpent?: number;
  energySpent?: number;
}) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getSectorBudget(userId, sectorId);
  
  if (existing) {
    await db.update(sectorBudgets)
      .set(data)
      .where(and(eq(sectorBudgets.userId, userId), eq(sectorBudgets.sectorId, sectorId)));
  } else {
    await db.insert(sectorBudgets).values({
      userId,
      sectorId,
      ...data,
    });
  }
}

/**
 * دوال المشروعات التنموية
 * Development Projects functions
 */
export async function getUserProjects(userId: number, sectorId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (sectorId) {
    const result = await db.select()
      .from(developmentProjects)
      .where(and(eq(developmentProjects.userId, userId), eq(developmentProjects.sectorId, sectorId)))
      .orderBy(desc(developmentProjects.createdAt));
    return result;
  } else {
    const result = await db.select()
      .from(developmentProjects)
      .where(eq(developmentProjects.userId, userId))
      .orderBy(desc(developmentProjects.createdAt));
    return result;
  }
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(developmentProjects)
    .where(eq(developmentProjects.id, projectId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createProject(data: InsertDevelopmentProject) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(developmentProjects).values(data);
  return result;
}

export async function updateProject(projectId: number, data: Partial<InsertDevelopmentProject>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(developmentProjects)
    .set(data)
    .where(eq(developmentProjects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Delete milestones first
  await db.delete(projectMilestones).where(eq(projectMilestones.projectId, projectId));
  
  // Then delete project
  await db.delete(developmentProjects).where(eq(developmentProjects.id, projectId));
}

export async function getProjectMilestones(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, projectId))
    .orderBy(projectMilestones.orderIndex);
  
  return result;
}

export async function createMilestone(data: InsertProjectMilestone) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(projectMilestones).values(data);
  return result;
}

export async function updateMilestone(milestoneId: number, data: Partial<InsertProjectMilestone>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(projectMilestones)
    .set(data)
    .where(eq(projectMilestones.id, milestoneId));
}

export async function completeMilestone(milestoneId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(projectMilestones)
    .set({
      isCompleted: true,
      completedAt: new Date(),
    })
    .where(eq(projectMilestones.id, milestoneId));
}
