import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { calculateNationalGDP, classifyNation, canUnlockSector } from "./utils/gdp";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ User Profile Router ============
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
    
    update: protectedProcedure
      .input(z.object({
        countryName: z.string().optional(),
        countryMotto: z.string().optional(),
        flagColor1: z.string().optional(),
        flagColor2: z.string().optional(),
        flagColor3: z.string().optional(),
        preferredLanguage: z.enum(["ar", "en"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============ Sectors Router ============
  sectors: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllSectors();
    }),
    
    getUserSectors: protectedProcedure.query(async ({ ctx }) => {
      const userSectors = await db.getUserSectors(ctx.user.id);
      const allSectors = await db.getAllSectors();
      
      // Combine sector info with user progress
      return allSectors.map(sector => {
        const userSector = userSectors.find(us => us.sectorId === sector.id);
        return {
          ...sector,
          userProgress: userSector || null,
        };
      });
    }),
    
    updateScore: protectedProcedure
      .input(z.object({
        sectorId: z.number(),
        newScore: z.number().min(0).max(100),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserSectorScore(ctx.user.id, input.sectorId, input.newScore);
        
        // Recalculate GDP after score update
        const userSectors = await db.getUserSectors(ctx.user.id);
        const allSectors = await db.getAllSectors();
        
        const sectorsData = userSectors.map(us => {
          const sector = allSectors.find(s => s.id === us.sectorId);
          return {
            sectorKey: sector?.sectorKey || "",
            score: us.currentScore,
            weight: sector?.gdpWeight || 100,
            isUnlocked: us.isUnlocked,
          };
        });
        
        const gdpResult = calculateNationalGDP({
          sectors: sectorsData,
          previousGdp: ctx.user.previousGdp,
          streakDays: ctx.user.streakDays,
          totalAvailableSectors: allSectors.filter(s => s.requiredLevel <= ctx.user.currentLevel).length,
        });
        
        await db.updateUserGDP(ctx.user.id, gdpResult.totalGdp);
        
        return { success: true, gdp: gdpResult };
      }),
    
    unlock: protectedProcedure
      .input(z.object({
        sectorId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sector = await db.getSectorById(input.sectorId);
        if (!sector) {
          throw new Error("Sector not found");
        }
        
        // Check if user already has this sector
        let userSector = await db.getUserSectorById(ctx.user.id, input.sectorId);
        
        if (!userSector) {
          // Create new user sector
          await db.createUserSector({
            userId: ctx.user.id,
            sectorId: input.sectorId,
            isUnlocked: true,
            currentScore: 0,
          });
        } else {
          // Unlock existing sector
          await db.unlockUserSector(ctx.user.id, input.sectorId);
        }
        
        return { success: true };
      }),
  }),

  // ============ Tasks Router ============
  tasks: router({
    list: protectedProcedure
      .input(z.object({
        sectorId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserTasks(ctx.user.id, input);
      }),
    
    create: protectedProcedure
      .input(z.object({
        sectorId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        dueDate: z.date().optional(),
        isRecurring: z.boolean().optional(),
        recurrencePattern: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createTask({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
        progressPercentage: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTaskStatus(input.taskId, input.status, input.progressPercentage);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        taskId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTask(input.taskId);
        return { success: true };
      }),
  }),

  // ============ GDP Router ============
  gdp: router({
    current: protectedProcedure.query(async ({ ctx }) => {
      const userSectors = await db.getUserSectors(ctx.user.id);
      const allSectors = await db.getAllSectors();
      
      const sectorsData = userSectors.map(us => {
        const sector = allSectors.find(s => s.id === us.sectorId);
        return {
          sectorKey: sector?.sectorKey || "",
          score: us.currentScore,
          weight: sector?.gdpWeight || 100,
          isUnlocked: us.isUnlocked,
        };
      });
      
      const gdpResult = calculateNationalGDP({
        sectors: sectorsData,
        previousGdp: ctx.user.previousGdp,
        streakDays: ctx.user.streakDays,
        totalAvailableSectors: allSectors.filter(s => s.requiredLevel <= ctx.user.currentLevel).length,
      });
      
      const classification = classifyNation(gdpResult.totalGdp);
      
      return {
        ...gdpResult,
        classification,
      };
    }),
    
    history: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserDailyLogs(ctx.user.id, input.startDate, input.endDate);
      }),
  }),

  // ============ Achievements Router ============
  achievements: router({
    getAll: publicProcedure.query(async () => {
      return await db.getAllAchievements();
    }),
    
    getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
      const userAchievements = await db.getUserAchievements(ctx.user.id);
      const allAchievements = await db.getAllAchievements();
      
      return allAchievements.map(achievement => {
        const unlocked = userAchievements.find(ua => ua.achievementId === achievement.id);
        return {
          ...achievement,
          unlocked: !!unlocked,
          unlockedAt: unlocked?.unlockedAt || null,
        };
      });
    }),
  }),

  // ============ Notifications Router ============
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        unreadOnly: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input.unreadOnly);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),
  }),

  // ============ Dashboard Router ============
  dashboard: router({
    overview: protectedProcedure.query(async ({ ctx }) => {
      // Get user sectors
      const userSectors = await db.getUserSectors(ctx.user.id);
      const allSectors = await db.getAllSectors();
      
      // Calculate GDP
      const sectorsData = userSectors.map(us => {
        const sector = allSectors.find(s => s.id === us.sectorId);
        return {
          sectorKey: sector?.sectorKey || "",
          score: us.currentScore,
          weight: sector?.gdpWeight || 100,
          isUnlocked: us.isUnlocked,
        };
      });
      
      const gdpResult = calculateNationalGDP({
        sectors: sectorsData,
        previousGdp: ctx.user.previousGdp,
        streakDays: ctx.user.streakDays,
        totalAvailableSectors: allSectors.filter(s => s.requiredLevel <= ctx.user.currentLevel).length,
      });
      
      const classification = classifyNation(gdpResult.totalGdp);
      
      // Get recent tasks
      const recentTasks = await db.getUserTasks(ctx.user.id);
      const pendingTasks = recentTasks.filter(t => t.status === "pending").length;
      const completedTasks = recentTasks.filter(t => t.status === "completed").length;
      
      // Get unread notifications
      const unreadNotifications = await db.getUserNotifications(ctx.user.id, true);
      
      // Get user achievements
      const userAchievements = await db.getUserAchievements(ctx.user.id);
      
      return {
        user: ctx.user,
        gdp: gdpResult,
        classification,
        stats: {
          pendingTasks,
          completedTasks,
          unreadNotifications: unreadNotifications.length,
          achievementsUnlocked: userAchievements.length,
        },
        sectors: allSectors.map(sector => {
          const userSector = userSectors.find(us => us.sectorId === sector.id);
          return {
            ...sector,
            userProgress: userSector || null,
          };
        }),
      };
    }),
  }),

  // ============ Resources Router ============
  resources: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      let resources = await db.getUserResources(ctx.user.id);
      
      if (!resources) {
        await db.initializeUserResources(ctx.user.id);
        resources = await db.getUserResources(ctx.user.id);
      }
      
      return resources;
    }),
    
    allocateBudget: protectedProcedure
      .input(z.object({
        sectorId: z.number(),
        timeAllocated: z.number().min(0),
        moneyAllocated: z.number().min(0),
        energyAllocated: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSectorBudget(ctx.user.id, input.sectorId, {
          timeAllocated: input.timeAllocated,
          moneyAllocated: input.moneyAllocated,
          energyAllocated: input.energyAllocated,
        });
        
        return { success: true };
      }),
    
    getSectorBudgets: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSectorBudgets(ctx.user.id);
    }),
  }),

  // ============ Development Projects Router ============
  projects: router({
    list: protectedProcedure
      .input(z.object({
        sectorId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserProjects(ctx.user.id, input?.sectorId);
      }),
    
    get: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        
        const milestones = await db.getProjectMilestones(input.projectId);
        
        return {
          ...project,
          milestones,
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        sectorId: z.number(),
        titleAr: z.string(),
        titleEn: z.string(),
        descriptionAr: z.string().optional(),
        descriptionEn: z.string().optional(),
        requiredTime: z.number().default(0),
        requiredMoney: z.number().default(0),
        requiredEnergy: z.number().default(0),
        expectedImpactOnScore: z.number().default(5),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createProject({
          userId: ctx.user.id,
          ...input,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        status: z.enum(["planned", "in_progress", "completed", "paused", "cancelled"]).optional(),
        progressPercentage: z.number().min(0).max(100).optional(),
        timeSpent: z.number().optional(),
        moneySpent: z.number().optional(),
        energySpent: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { projectId, ...data } = input;
        
        const project = await db.getProjectById(projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        
        await db.updateProject(projectId, data);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        
        await db.deleteProject(input.projectId);
        
        return { success: true };
      }),
  }),

  // ============ Initialization Router ============
  init: router({
    setupUser: protectedProcedure.mutation(async ({ ctx }) => {
      // Initialize user with basic sectors (Level 1)
      const allSectors = await db.getAllSectors();
      const level1Sectors = allSectors.filter(s => s.requiredLevel === 1);
      
      for (const sector of level1Sectors) {
        const existing = await db.getUserSectorById(ctx.user.id, sector.id);
        if (!existing) {
          await db.createUserSector({
            userId: ctx.user.id,
            sectorId: sector.id,
            isUnlocked: true,
            currentScore: 0,
          });
        }
      }
      
      // Create welcome notification
      await db.createNotification({
        userId: ctx.user.id,
        notificationType: "alert",
        titleAr: "مرحباً في أنا بلد!",
        titleEn: "Welcome to I am Legend!",
        messageAr: "ابدأ رحلتك في بناء دولتك الشخصية",
        messageEn: "Start your journey building your personal nation",
        icon: "🎉",
        priority: "high",
      });
      
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
