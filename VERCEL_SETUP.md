# ⚙️ إعدادات Vercel - Environment Variables

## 📝 المتغيرات المطلوبة

بعد رفع التعديلات على GitHub، اذهب إلى **Vercel Dashboard** واتبع الخطوات التالية:

### الخطوة 1: افتح Project Settings

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع `ana-balad`
3. اضغط على **Settings**
4. اختر **Environment Variables** من القائمة الجانبية

### الخطوة 2: أضف المتغيرات التالية

#### 🗄️ قاعدة البيانات - TiDB Cloud

```
DATABASE_URL=mysql://your-user:your-password@your-host:4000/your-database
```

**مثال:**
```
DATABASE_URL=mysql://4vT8xYz.root:MyPassword123@gateway-region.aws.tidbcloud.com:4000/test
```

**كيف تحصل على DATABASE_URL:**
1. اذهب إلى [TiDB Cloud Console](https://tidbcloud.com)
2. اختر الـ cluster الخاص بك
3. اضغط **Connect**
4. انسخ الـ connection string

---

#### 🔐 JWT Secret

```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-here
```

**مثال:**
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

---

#### 👤 Manus OAuth

```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=Your Name
```

**استبدل:**
- `your-manus-open-id` بالـ Open ID الخاص بك من Manus
- `Your Name` باسمك

---

#### 🎨 معلومات التطبيق

```
VITE_APP_TITLE=أنا بلد - I am Legend
VITE_APP_LOGO=/logo.png
VITE_APP_ID=your-app-id
```

---

### الخطوة 3: احفظ المتغيرات

1. بعد إضافة كل متغير، اضغط **Add**
2. تأكد من تطبيق المتغيرات على **Production**, **Preview**, و **Development**

### الخطوة 4: أعد النشر (Redeploy)

1. اذهب إلى **Deployments** tab
2. اضغط على آخر deployment
3. اضغط على الـ 3 نقاط (...)
4. اختر **Redeploy**

---

## ✅ التحقق من النجاح

بعد إعادة النشر:

1. افتح رابط التطبيق على Vercel
2. جرب تسجيل الدخول أو أي عملية
3. يجب أن يعمل كل شيء بشكل طبيعي!

---

## 🆘 إذا استمرت المشكلة

### تحقق من Logs

1. في Vercel Dashboard، اذهب إلى **Deployments**
2. اضغط على آخر deployment
3. اضغط **View Function Logs**
4. ابحث عن أي أخطاء

### المشاكل الشائعة

#### ❌ Database Connection Error

**الحل:**
- تأكد من صحة `DATABASE_URL`
- تأكد من أن TiDB Cluster شغال (ليس في sleep mode)
- جرب الاتصال من جهازك المحلي أولاً

#### ❌ Authentication Error

**الحل:**
- تحقق من `JWT_SECRET` (يجب أن يكون 32+ حرف)
- تأكد من صحة `OAUTH_SERVER_URL`

---

## 📞 تواصل

إذا واجهت أي مشكلة، لا تتردد في طلب المساعدة!

**حظاً موفقاً! 🚀**
