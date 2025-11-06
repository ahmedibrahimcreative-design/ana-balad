# 👨‍💻 دليل المطور - Developer Guide

دليل شامل للمطورين الذين يرغبون في المساهمة أو تطوير "أنا بلد".

---

## 📐 البنية المعمارية

### نظرة عامة

التطبيق مبني على **Full-stack TypeScript** مع:

- **Frontend**: React 19 + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB + Drizzle ORM
- **Authentication**: JWT + Manus OAuth

```
┌─────────────────────────────────────────────────┐
│                   Client (React)                │
│  ┌─────────────┐  ┌──────────────┐            │
│  │   Pages     │  │  Components  │            │
│  └─────────────┘  └──────────────┘            │
│         │                 │                     │
│         └────────┬────────┘                     │
│                  │                              │
│           ┌──────▼───────┐                      │
│           │  tRPC Client │                      │
│           └──────┬───────┘                      │
└──────────────────┼──────────────────────────────┘
                   │ HTTP/JSON
┌──────────────────▼──────────────────────────────┐
│           ┌──────────────┐                      │
│           │ tRPC Server  │                      │
│           └──────┬───────┘                      │
│                  │                              │
│     ┌────────────┼────────────┐                │
│     │            │            │                │
│ ┌───▼────┐  ┌───▼────┐  ┌───▼────┐           │
│ │Routers │  │  DB    │  │ Utils  │           │
│ └────────┘  └───┬────┘  └────────┘           │
│                 │                              │
│          Server (Express)                      │
└─────────────────┼──────────────────────────────┘
                  │
┌─────────────────▼──────────────────────────────┐
│          Database (MySQL/TiDB)                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │Users │ │Sectors│ │Tasks│ │Logs │ ...      │
│  └──────┘ └──────┘ └──────┘ └──────┘         │
└────────────────────────────────────────────────┘
```

---

## 🗂️ هيكل الملفات

### Frontend (`client/`)

```
client/
├── public/                 # Static files
│   └── logo.png           # App logo
├── src/
│   ├── _core/             # Core utilities (don't modify)
│   │   └── hooks/
│   │       └── useAuth.tsx
│   ├── components/        # Reusable components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── DashboardLayout.tsx
│   │   └── ErrorBoundary.tsx
│   ├── contexts/          # React contexts
│   │   └── ThemeContext.tsx
│   ├── pages/             # Page components
│   │   ├── Home.tsx      # Landing page
│   │   ├── Dashboard.tsx # Main dashboard
│   │   └── NotFound.tsx
│   ├── lib/               # Utilities
│   │   └── trpc.ts       # tRPC client setup
│   ├── const.ts           # Constants
│   ├── App.tsx            # Routes & layout
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
└── index.html             # HTML template
```

### Backend (`server/`)

```
server/
├── _core/                 # Framework core (don't modify)
│   ├── context.ts        # tRPC context
│   ├── trpc.ts           # tRPC setup
│   ├── cookies.ts        # Cookie handling
│   ├── env.ts            # Environment variables
│   ├── llm.ts            # LLM integration
│   ├── imageGeneration.ts
│   ├── voiceTranscription.ts
│   └── systemRouter.ts
├── utils/                 # Utilities
│   └── gdp.ts            # GDP calculation logic
├── db.ts                  # Database helpers
├── routers.ts             # tRPC routers
└── storage.ts             # S3 storage helpers
```

### Database (`drizzle/`)

```
drizzle/
├── schema.ts              # Database schema
└── migrations/            # Auto-generated migrations
```

### Scripts (`scripts/`)

```
scripts/
└── seed.ts                # Seed initial data
```

---

## 🔧 إضافة ميزة جديدة

### مثال: إضافة نظام "الموارد"

#### 1. تحديث Database Schema

```typescript
// drizzle/schema.ts

export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resourceType: varchar("resourceType", { length: 50 }).notNull(),
  amount: int("amount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
```

#### 2. تطبيق Migration

```bash
pnpm db:push
```

#### 3. إضافة Database Helpers

```typescript
// server/db.ts

export async function getUserResources(userId: number): Promise<Resource[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(resources)
    .where(eq(resources.userId, userId));
  
  return result;
}

export async function addResource(data: InsertResource): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(resources).values(data);
}
```

#### 4. إضافة tRPC Router

```typescript
// server/routers.ts

resources: router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserResources(ctx.user.id);
  }),
  
  add: protectedProcedure
    .input(z.object({
      resourceType: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.addResource({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true };
    }),
}),
```

#### 5. إنشاء Frontend Component

```typescript
// client/src/pages/Resources.tsx

import { trpc } from "@/lib/trpc";

export default function Resources() {
  const { data: resources, isLoading } = trpc.resources.list.useQuery();
  const addMutation = trpc.resources.add.useMutation();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>الموارد</h1>
      {resources?.map(resource => (
        <div key={resource.id}>
          {resource.resourceType}: {resource.amount}
        </div>
      ))}
    </div>
  );
}
```

#### 6. إضافة Route

```typescript
// client/src/App.tsx

<Route path="/resources" component={Resources} />
```

---

## 🎨 إرشادات التصميم

### نظام الألوان

```css
/* Primary: Royal Blue */
--primary: 221 83% 53%;

/* Secondary: Emerald Green */
--secondary: 142 76% 36%;

/* Accent: Golden Yellow */
--accent: 45 93% 47%;

/* GDP Colors */
--gdp-excellent: var(--color-green-600);
--gdp-good: var(--color-blue-600);
--gdp-warning: var(--color-yellow-600);
--gdp-danger: var(--color-red-600);
```

### Typography

```css
/* Arabic */
font-family: 'Cairo', system-ui, sans-serif;

/* English */
font-family: 'Inter', system-ui, sans-serif;
```

### Spacing

استخدم Tailwind spacing scale:
- `p-4` = 1rem = 16px
- `p-6` = 1.5rem = 24px
- `p-8` = 2rem = 32px

### Components

استخدم shadcn/ui components:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

---

## 🧪 الاختبار

### Unit Tests (قريباً)

```bash
pnpm test
```

### E2E Tests (قريباً)

```bash
pnpm test:e2e
```

### Manual Testing

1. تشغيل المشروع محلياً
2. اختبار كل ميزة يدوياً
3. التحقق من responsive design
4. اختبار على متصفحات مختلفة

---

## 📊 خوارزمية GDP

### الصيغة الكاملة

```typescript
PersonalGDP = BaseGDP + GrowthBonus + StreakBonus + DiversityBonus

// 1. BaseGDP
BaseGDP = (Σ(Score_i × Weight_i) / ΣWeight_i) × 10

// 2. GrowthBonus
GrowthRate = ((CurrentBaseGDP - PreviousGDP) / PreviousGDP) × 100
GrowthBonus = max(0, GrowthRate × 2)  // max +40

// 3. StreakBonus
StreakBonus = min(StreakDays × 2, 100)  // max +100

// 4. DiversityBonus
DiversityBonus = (ActiveSectors / TotalAvailableSectors) × 50  // max +50
```

### مثال عملي

```typescript
// User has:
// - Infrastructure: 80% (weight 1.5)
// - Health: 70% (weight 1.5)
// - Economy: 60% (weight 1.0)
// - Previous GDP: 650
// - Streak: 15 days

// 1. BaseGDP
BaseGDP = ((80×1.5 + 70×1.5 + 60×1.0) / (1.5+1.5+1.0)) × 10
        = ((120 + 105 + 60) / 4) × 10
        = (285 / 4) × 10
        = 71.25 × 10
        = 712.5

// 2. GrowthBonus
GrowthRate = ((712.5 - 650) / 650) × 100 = 9.6%
GrowthBonus = 9.6 × 2 = 19.2

// 3. StreakBonus
StreakBonus = min(15 × 2, 100) = 30

// 4. DiversityBonus
DiversityBonus = (3 / 3) × 50 = 50

// Total
PersonalGDP = 712.5 + 19.2 + 30 + 50 = 811.7 ≈ 812
// Classification: دولة متقدمة 🏛️
```

---

## 🔐 الأمان

### Best Practices

1. **Never expose secrets** في Frontend
2. **Validate all inputs** باستخدام Zod
3. **Use protectedProcedure** للـ endpoints الحساسة
4. **Sanitize user input** قبل حفظه في DB
5. **Use HTTPS** دائماً في Production

### مثال: Input Validation

```typescript
// ❌ Bad
.input(z.object({
  score: z.number(),
}))

// ✅ Good
.input(z.object({
  score: z.number().min(0).max(100),
  sectorId: z.number().positive(),
}))
```

---

## 🚀 الأداء

### Frontend Optimization

1. **Code Splitting**
   ```tsx
   const Dashboard = lazy(() => import("./pages/Dashboard"));
   ```

2. **Memoization**
   ```tsx
   const expensiveValue = useMemo(() => calculate(), [deps]);
   ```

3. **Optimistic Updates**
   ```tsx
   const mutation = trpc.tasks.create.useMutation({
     onMutate: async (newTask) => {
       // Update cache immediately
       await utils.tasks.list.cancel();
       const prev = utils.tasks.list.getData();
       utils.tasks.list.setData(undefined, (old) => [...old, newTask]);
       return { prev };
     },
   });
   ```

### Backend Optimization

1. **Database Indexes**
   ```typescript
   .index("userId_idx").on(tasks.userId)
   ```

2. **Query Optimization**
   ```typescript
   // ❌ Bad: N+1 queries
   for (const user of users) {
     const tasks = await getUserTasks(user.id);
   }
   
   // ✅ Good: Single query
   const tasks = await db.select()
     .from(tasks)
     .where(inArray(tasks.userId, userIds));
   ```

---

## 📚 موارد مفيدة

### Documentation

- [React](https://react.dev)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

### Tools

- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio)

---

## 🐛 Debugging

### Frontend Debugging

```tsx
// React DevTools
console.log("User:", user);

// tRPC DevTools
const utils = trpc.useUtils();
console.log("Cache:", utils.tasks.list.getData());
```

### Backend Debugging

```typescript
// Add logging
console.log("[GDP] Calculating for user:", userId);
console.log("[GDP] Result:", gdpResult);

// Check database
const db = await getDb();
const result = await db.select().from(users).limit(10);
console.log("Users:", result);
```

---

## 🤝 المساهمة

### Workflow

1. Fork المشروع
2. أنشئ branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. افتح Pull Request

### Code Style

- استخدم **TypeScript** دائماً
- اتبع **ESLint** rules
- اكتب **comments** بالعربية للمنطق المعقد
- استخدم **meaningful names** للمتغيرات

### Commit Messages

```
✨ feat: إضافة نظام الموارد
🐛 fix: إصلاح حساب GDP
📝 docs: تحديث README
🎨 style: تحسين UI القطاعات
♻️ refactor: إعادة هيكلة routers
⚡ perf: تحسين أداء queries
```

---

## 📞 الدعم

إذا كان لديك أسئلة:

1. راجع [FAQ](./FAQ.md)
2. افتح [Issue](https://github.com/your-username/ana-balad/issues)
3. تواصل: dev@ana-balad.com

---

<div align="center">

**Happy Coding! 💻**

</div>
