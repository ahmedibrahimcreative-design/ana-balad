CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`achievementKey` varchar(50) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`icon` varchar(10) NOT NULL,
	`category` enum('sector','gdp','streak','partnership','special') NOT NULL,
	`unlockConditions` text,
	`pointsReward` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_achievementKey_unique` UNIQUE(`achievementKey`)
);
--> statement-breakpoint
CREATE TABLE `dailyLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`logDate` datetime NOT NULL,
	`dailyGdp` int,
	`tasksCompleted` int NOT NULL DEFAULT 0,
	`totalPointsEarned` int NOT NULL DEFAULT 0,
	`activeSectorsCount` int NOT NULL DEFAULT 0,
	`sectorsData` text,
	`userNotes` text,
	`mood` enum('excellent','good','neutral','poor') DEFAULT 'neutral',
	`energyLevel` int NOT NULL DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` enum('alert','achievement','partnership','report','reminder') NOT NULL,
	`titleAr` varchar(200),
	`titleEn` varchar(200),
	`messageAr` text,
	`messageEn` text,
	`icon` varchar(10),
	`isRead` boolean NOT NULL DEFAULT false,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`actionUrl` varchar(255),
	`actionLabelAr` varchar(50),
	`actionLabelEn` varchar(50),
	`readAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId1` int NOT NULL,
	`userId2` int NOT NULL,
	`partnershipType` enum('collaboration','mentorship','resource_exchange') NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`status` enum('pending','active','completed','cancelled') NOT NULL DEFAULT 'pending',
	`sectorsInvolved` text,
	`goals` text,
	`mutualBenefits` text,
	`ratingUser1` int,
	`ratingUser2` int,
	`feedbackUser1` text,
	`feedbackUser2` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partnerships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportType` enum('weekly','monthly','quarterly','annual') NOT NULL,
	`periodStart` datetime NOT NULL,
	`periodEnd` datetime NOT NULL,
	`avgGdp` int,
	`gdpGrowthRate` int,
	`bestSector` varchar(50),
	`worstSector` varchar(50),
	`totalTasksCompleted` int,
	`totalPointsEarned` int,
	`streakMaintained` boolean,
	`sectorsPerformance` text,
	`achievementsUnlocked` text,
	`recommendations` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorKey` varchar(50) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`icon` varchar(10) NOT NULL,
	`descriptionAr` text,
	`descriptionEn` text,
	`requiredLevel` int NOT NULL DEFAULT 1,
	`unlockCondition` text,
	`gdpWeight` int NOT NULL DEFAULT 100,
	`importanceOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sectors_id` PRIMARY KEY(`id`),
	CONSTRAINT `sectors_sectorKey_unique` UNIQUE(`sectorKey`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sectorId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`dueDate` datetime,
	`estimatedHours` int,
	`actualHours` int,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurrencePattern` varchar(50),
	`pointsValue` int NOT NULL DEFAULT 10,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSectors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sectorId` int NOT NULL,
	`isUnlocked` boolean NOT NULL DEFAULT false,
	`currentScore` int NOT NULL DEFAULT 0,
	`previousScore` int NOT NULL DEFAULT 0,
	`tasksCompleted` int NOT NULL DEFAULT 0,
	`tasksTotal` int NOT NULL DEFAULT 0,
	`daysActive` int NOT NULL DEFAULT 0,
	`lastUpdated` datetime,
	`targetScore` int NOT NULL DEFAULT 80,
	`quarterlyTarget` int,
	`annualTarget` int,
	`unlockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSectors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `countryName` varchar(100) DEFAULT 'جمهوريتي';--> statement-breakpoint
ALTER TABLE `users` ADD `countryMotto` varchar(200);--> statement-breakpoint
ALTER TABLE `users` ADD `flagColor1` varchar(7) DEFAULT '#2ecc71';--> statement-breakpoint
ALTER TABLE `users` ADD `flagColor2` varchar(7) DEFAULT '#3498db';--> statement-breakpoint
ALTER TABLE `users` ADD `flagColor3` varchar(7) DEFAULT '#e74c3c';--> statement-breakpoint
ALTER TABLE `users` ADD `currentLevel` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalGdp` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `previousGdp` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `streakDays` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastActiveDate` datetime;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` varchar(2) DEFAULT 'ar';--> statement-breakpoint
ALTER TABLE `users` ADD `timezone` varchar(50) DEFAULT 'UTC';