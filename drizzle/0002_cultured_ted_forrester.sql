CREATE TABLE `resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timeAvailable` int NOT NULL DEFAULT 168,
	`timeUsed` int NOT NULL DEFAULT 0,
	`moneyAvailable` int NOT NULL DEFAULT 1000,
	`moneyUsed` int NOT NULL DEFAULT 0,
	`energyAvailable` int NOT NULL DEFAULT 100,
	`energyUsed` int NOT NULL DEFAULT 0,
	`lastReset` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sectorBudgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sectorId` int NOT NULL,
	`timeAllocated` int NOT NULL DEFAULT 0,
	`moneyAllocated` int NOT NULL DEFAULT 0,
	`energyAllocated` int NOT NULL DEFAULT 0,
	`timeSpent` int NOT NULL DEFAULT 0,
	`moneySpent` int NOT NULL DEFAULT 0,
	`energySpent` int NOT NULL DEFAULT 0,
	`targetTimePerWeek` int,
	`targetBudgetPerMonth` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sectorBudgets_id` PRIMARY KEY(`id`)
);
