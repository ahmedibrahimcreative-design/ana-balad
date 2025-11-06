# 🚀 دليل النشر - Deployment Guide

هذا الدليل يشرح كيفية نشر تطبيق "أنا بلد" على منصات مختلفة.

---

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من توفر:

- ✅ حساب على [GitHub](https://github.com)
- ✅ حساب على [Vercel](https://vercel.com)
- ✅ قاعدة بيانات MySQL (يُنصح بـ TiDB Cloud أو PlanetScale)
- ✅ حساب Manus OAuth (للمصادقة)

---

## 🌐 النشر على Vercel

### الخطوة 1: إعداد قاعدة البيانات

#### استخدام TiDB Cloud (مُوصى به)

1. افتح [TiDB Cloud](https://tidbcloud.com)
2. أنشئ cluster جديد (Free Tier متاح)
3. انتظر حتى يصبح الـ cluster جاهزاً
4. اذهب إلى "Connect" واحصل على `DATABASE_URL`
5. احفظ الـ URL بصيغة:
   ```
   mysql://username:password@host:port/database?ssl={"rejectUnauthorized":true}
   ```

#### استخدام PlanetScale (بديل)

1. افتح [PlanetScale](https://planetscale.com)
2. أنشئ database جديد
3. احصل على connection string
4. احفظ الـ URL

### الخطوة 2: رفع المشروع على GitHub

```bash
# إذا لم تكن قد أنشأت repository بعد
git init
git add .
git commit -m "Initial commit: أنا بلد v1.0"

# أنشئ repository جديد على GitHub ثم:
git remote add origin https://github.com/YOUR_USERNAME/ana-balad.git
git branch -M main
git push -u origin main
```

### الخطوة 3: ربط المشروع مع Vercel

1. **افتح Vercel Dashboard**
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل دخول أو أنشئ حساب جديد

2. **استيراد المشروع**
   - اضغط "New Project"
   - اختر repository "ana-balad" من GitHub
   - اضغط "Import"

3. **إعداد المشروع**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (الافتراضي)
   - **Build Command**: `pnpm build` (الافتراضي)
   - **Output Directory**: `dist` (الافتراضي)

### الخطوة 4: إضافة متغيرات البيئة

في صفحة إعدادات المشروع على Vercel، أضف المتغيرات التالية:

#### متغيرات قاعدة البيانات
```
DATABASE_URL=mysql://user:pass@host:port/dbname
```

#### متغيرات المصادقة
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Your Name
```

#### متغيرات التطبيق
```
VITE_APP_TITLE=أنا بلد - I am Legend
VITE_APP_LOGO=/logo.png
VITE_APP_ID=your-app-id
```

#### متغيرات Manus APIs (إذا كنت تستخدم Manus)
```
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api.manus.im
```

### الخطوة 5: النشر

1. اضغط "Deploy"
2. انتظر حتى يكتمل البناء (2-3 دقائق)
3. بعد النجاح، ستحصل على رابط مثل: `https://ana-balad.vercel.app`

### الخطوة 6: إعداد قاعدة البيانات

بعد النشر الأول، يجب تشغيل migrations:

```bash
# استخدم Vercel CLI
npm i -g vercel
vercel login
vercel link

# شغل migrations
vercel env pull .env.production
pnpm db:push

# أضف البيانات الأولية
npx tsx scripts/seed.ts
```

---

## 🎨 تخصيص النطاق (Domain)

### إضافة نطاق مخصص

1. في Vercel Dashboard، اذهب إلى "Settings" → "Domains"
2. أضف نطاقك (مثل: `ana-balad.com`)
3. اتبع التعليمات لإعداد DNS records
4. انتظر حتى يتم التحقق (قد يستغرق حتى 48 ساعة)

### إعداد DNS Records

أضف هذه السجلات في مزود النطاق الخاص بك:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔧 التحديثات المستقبلية

### نشر تحديثات جديدة

```bash
# عدل الكود كما تريد
git add .
git commit -m "وصف التحديث"
git push origin main
```

Vercel سيكتشف التغييرات تلقائياً وينشر النسخة الجديدة!

### Rollback لنسخة سابقة

1. في Vercel Dashboard، اذهب إلى "Deployments"
2. اختر النسخة التي تريد العودة إليها
3. اضغط "..." → "Promote to Production"

---

## 📊 المراقبة والتحليلات

### Vercel Analytics

1. في Vercel Dashboard، اذهب إلى "Analytics"
2. فعّل Analytics (مجاني للاستخدام الأساسي)
3. راقب:
   - عدد الزوار
   - أداء الصفحات
   - معدل الارتداد

### Logs والأخطاء

1. في Vercel Dashboard، اذهب إلى "Logs"
2. راقب:
   - Runtime Logs
   - Build Logs
   - Function Logs

---

## 🔐 الأمان

### أفضل الممارسات

1. **لا تشارك متغيرات البيئة** أبداً
2. **استخدم HTTPS** دائماً (Vercel يوفره تلقائياً)
3. **حدّث التبعيات** بانتظام:
   ```bash
   pnpm update
   ```
4. **راقب الأخطاء** باستمرار
5. **احتفظ بنسخ احتياطية** من قاعدة البيانات

---

## 🆘 حل المشاكل الشائعة

### المشكلة: Build Failed

**الحل:**
1. تحقق من Logs في Vercel
2. تأكد من أن جميع التبعيات موجودة في `package.json`
3. جرب البناء محلياً: `pnpm build`

### المشكلة: Database Connection Error

**الحل:**
1. تحقق من `DATABASE_URL` في Environment Variables
2. تأكد من أن قاعدة البيانات تقبل اتصالات من Vercel
3. تحقق من SSL settings

### المشكلة: Authentication Not Working

**الحل:**
1. تحقق من `JWT_SECRET` و OAuth settings
2. تأكد من أن redirect URLs صحيحة
3. راجع Manus OAuth configuration

---

## 📚 موارد إضافية

- [Vercel Documentation](https://vercel.com/docs)
- [TiDB Cloud Docs](https://docs.pingcap.com/tidbcloud)
- [Manus Platform](https://manus.im)

---

## 💬 الدعم

إذا واجهت أي مشاكل:

1. راجع [Issues على GitHub](https://github.com/your-username/ana-balad/issues)
2. افتح issue جديد مع وصف المشكلة
3. تواصل عبر البريد: support@ana-balad.com

---

<div align="center">

**نتمنى لك نشراً موفقاً! 🚀**

</div>
