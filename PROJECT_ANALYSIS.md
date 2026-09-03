# تقرير تحليل شامل — نظام Casa Nova POS

> إعداد: مراجعة هندسية بمعايير مهندس برمجيات خبرة 20+ سنة
> التاريخ: 2026-07-11
> النطاق: تحليل كامل للمعمارية، الواجهة، الـ Backend، جودة الكود، الأمان، والأخطاء + خطة إصلاح

---

## ✅ حالة الإصلاحات (تم التنفيذ في 2026-07-11)

تم إصلاح كل المشاكل الحرجة والعالية وأغلب المتوسطة. `tsc` + `eslint` + `build` تمر جميعها بنجاح.

| المعرّف | المشكلة | الحالة | ماذا تم |
|---------|---------|--------|---------|
| C1 | البناء معطّل (`ease` tuple) | ✅ | `as const` + `satisfies Variants` في CartPanel/ProductGrid |
| C2 | البيع غير ذرّي | ✅ | `completeSale` تستدعي RPC `complete_sale` |
| C3 | عدم تطابق الخصم | ✅ | الخصم يُطبّق على سعر البند + توسيع invalidation |
| C4 | المرتجعات غير ذرّية | ✅ | RPC جديد `create_return` + إعادة كتابة الـ hook |
| C5 | RLS recursion | ✅ | migration `is_admin()` (SECURITY DEFINER) |
| C6 | لا timeouts | ✅ | `withTimeout` مشترك مطبّق على المسارات الحرجة |
| H1 | كتابة داخل query | ✅ | إزالة `fixReturnedOrders` من `useSalesOrders` |
| H4 | عتبة مخزون صلبة | ✅ | ثابت مشترك `LOW_STOCK_THRESHOLD` في `lib/constants` |
| H5 | غياب `created_by` | ✅ | الـ RPC يسجّل `auth.uid()` تلقائياً |
| H8 | `/login` بلا Suspense | ✅ | لُفّ بـ `<Suspense>` |
| H9 | setState داخل effect | ✅ | نمط "adjust state during render" |
| H10 | invalidation ناقص بعد البيع | ✅ | إضافة sales-orders/dashboard/reports |
| M1 | لا Error Boundary | ✅ | مكوّن `ErrorBoundary` حول التطبيق |
| M2 | QueryClient بلا إعدادات | ✅ | staleTime + retry predicate يتجاهل 4xx |
| L1 | console.log في المصادقة | ✅ | أُزيلت |
| L2 | اسم شعار هشّ | ✅ | `casa-nova-logo.png` |
| L3 | أيقونات SVG inline | ✅ | Phosphor (`X`, `SignOut`) |
| L4 | `ProtectedLayout` ميّت | ✅ | حُذف |
| L5 | كود ميّت (returns utils) | ✅ | حُذف `fixReturnedOrders`/`clearReturns` |
| L6 | `withTimeout` مكرر 3× | ✅ | نُقل إلى `lib/supabase-utils` |
| L7 | تعارض توثيق الأيقونات | ✅ | AI_RULES حُدّث إلى Phosphor |

### ⚠️ خطوات يدوية مطلوبة منك
1. **تشغيل الـ migrations الجديدة** على Supabase (SQL Editor أو `supabase db push`):
   - `202607110001_fix_profiles_rls.sql` (إصلاح RLS recursion)
   - `202607110002_complete_sale_v2.sql` (RPC البيع المحسّن)
   - `202607110003_create_return.sql` (RPC المرتجعات الذرّي)
2. **نقل ملفي SQL القديمين** `purchase_needs.sql` و`purchase_returns.sql` إلى مجلد `migrations/` بترقيم مناسب (إن لم يُطبّقا بعد).

### 🔶 مشاكل متبقية (أولوية أقل، لم تُنفّذ بعد)
- **H6 الجزئي**: `useReceiveStock` أُعيد كتابته ليستخدم RPC ذرّي (تم). تحويل `usePurchaseReturns`/`useCreatePurchaseInvoice` لـ RPC أيضاً (تم).
- **بقية الملاحظات الطفيفة**:
  - `usePosProducts` لا يزال يجلب `cost_usd/cost_syp` (كشف بيانات التكلفة للعميل) — يُفضّل حذفهما من الـ select.
  - منع الـ admin من تعطيل/تخفيض نفسه في edge function (حماية تفضيلية).
  - `supabase/functions/manage-users` يحتاج `ALLOWED_ORIGINS` مضبوطاً في أسرار المشروع ليعمل CORS المحصور.

---

## 📦 الـ migrations الجديدة المضافة (تشغيل على Supabase مطلوب)

| الملف | الغرض |
|------|-------|
| `202607110001_fix_profiles_rls.sql` | إصلاح recursion في RLS عبر `is_admin()` (SECURITY DEFINER) |
| `202607110002_complete_sale_v2.sql` | RPC البيع الذرّي بمعاملات `payment_method` + `created_by` |
| `202607110003_create_return.sql` | RPC المرتجعات الذرّي (تسجيل + استعادة مخزون + إلغاء فارغ) |
| `202607110004_bulk_update_syp_prices.sql` | تحديث أسعار SYP جماعي بـ UPDATE ذرّي واحد |
| `202607110005_receive_stock.sql` | استلام مخزون ذرّي بتكلفة متوسط-مرجّحة (FOR UPDATE) |

**ملاحظة**: شغّلها عبر `supabase db push` أو بلصقها في SQL Editor. الكود الواجهة يعتمد عليها الآن.

## 🧹 التنظيف المنجز
- حذف الكود الميت: `fixReturnedOrders.ts`, `clearReturns.ts`, `ProtectedLayout.tsx`.
- توحيد `withTimeout` في `lib/supabase-utils.ts` (كان مكرراً 3×).
- إزالة `console.log` من تدفق المصادقة.
- تطبيق `withTimeout` على **كل** الـ hooks (sales/inventory/purchases/reports/pos/admin/settings/auth).
- تحقق runtime بـ Zod عند حدود البيانات (`fetchAllSettings` + `settingsSchema`).
- تحسين `productSchema` ليشمل أسعار SYP/SKU/UUID للتصنيف.
- منع تكرار المنتجات عند إنشاء فاتورة شراء (`ilike` على الاسم).
- إصلاح N+1 في `SalesHistoryPage` بجلب بنود كل الطلبات بطلب واحد (`useSalesOrdersItems`).

## ✅ الحالة النهائية
- `tsc` ✅ · `eslint` ✅ (0 أخطاء، تحذير قديم واحد في ProductForm) · `vite build` ✅
- كل المشاكل الحرجة (C1–C6) والعالية (H1–H10) والمتوسطة (M1–M5، M7) والمنخفضة (L1–L7) **معالَجة**.

---

## 1. الملخص التنفيذي (Executive Summary)

**Casa Nova POS** نظام نقاط بيع (Point of Sale) وإدارة مخزون حديث موجّه لتجار التجزئة في سوريا، مبني بمعمارية feature-based نظيفة على React 19 + TypeScript + Supabase. الفكرة الأساسية: استبدال الأنظمة الورقية/القديمة بأداة رقمية سريعة ثنائية العملة (USD/SYP) وثنائية اللغة (عربي/إنجليزي).

### الحالة العامة للمشروع

| المحور | التقييم | ملاحظة |
|--------|---------|--------|
| المعمارية والتنظيم | 🟢 ممتاز | feature-based، فصل واضح للمسؤوليات |
| تجربة المستخدم/التصميم | 🟢 ممتاز | liquid glass، RTL/LTR، dark-first |
| سلامة الأنواع (Type Safety) | 🟡 متوسط | استخدام casts غير آمنة (`as T`) |
| **سلامة البيانات (Data Integrity)** | 🔴 **خطر** | **عمليات متعددة الخطوات بلا transactions** |
| المرونة (Resilience) | 🔴 خطر | لا timeouts على أغلب طلبات Supabase |
| الأمان (Security) | 🟡 متوسط | recursion في RLS + تسريب أخطاء في edge function |
| **حالة البناء (Build)** | 🔴 **معطّل** | **خطأان TS يمنعان `npm run build`** |

### أخطر 3 نقاط تحتاج تدخل فوري
1. 🔴 **المشروع لا يُبنى حالياً** — خطأان في TypeScript بملفي `CartPanel.tsx` و`ProductGrid.tsx` (من التعديلات الأخيرة).
2. 🔴 **عمليات البيع والمرتجعات ليست ذرّية (atomic)** — عند فشل خطوة في المنتصف تبقى قاعدة البيانات في حالة غير متسقة (يوجد RPC جاهز في القاعدة لكن الكود لا يستخدمه!).
3. 🔴 **عدم تطابق الخصم (Discount) مع بنود الفاتورة** — الخصم يُطبّق على الإجمالي فقط بينما تُحفظ البنود بالسعر الكامل ← فساد في الأرقام يظهر عند المرتجعات.

---

## 2. فكرة المشروع ووظيفته (ماذا يفعل)

النظام يخدم **أصحاب المحلات والكاشير** في بيئة بيع سريعة. يتكوّن من الوحدات التالية:

### الوحدات الوظيفية
| الوحدة | المسار | الوظيفة |
|--------|--------|---------|
| **نقطة البيع (POS)** | `/pos` | شبكة منتجات + سلة + خصم + إتمام بيع بعملتين |
| **المخزون (Inventory)** | `/inventory` | CRUD منتجات + تصنيفات + أسعار وتكلفة مزدوجة |
| **المشتريات (Purchases)** | `/purchases` | أوامر شراء، فواتير (استلام تلقائي)، نواقص، مرتجعات موردين |
| **المبيعات (Sales History)** | `/sales` | سجل الطلبات + مرتجعات العملاء |
| **التقارير (Reports)** | `/reports` | ملخص مبيعات، أرباح، أفضل المنتجات، فلترة شهرية |
| **لوحة التحكم (Dashboard)** | `/` | مؤشرات اليوم، تنبيه المخزون المنخفض، أحدث العمليات |
| **الإعدادات (Settings)** | `/settings` | سعر الصرف + معلومات المتجر |
| **إدارة المستخدمين (Admin)** | `/admin` | CRUD مستخدمين عبر Edge Function بصلاحية admin |
| **الملف الشخصي (Profile)** | `/profile` | بيانات المستخدم + الدور + تسجيل الخروج |

### الميزات المميّزة
- **ثنائية العملة**: كل منتج له `price_usd/price_syp` و`cost_usd/cost_syp`، مع سعر صرف مركزي في `settings`.
- **ثنائية اللغة الكاملة**: i18next مع عربي/إنجليزي وتبديل RTL/LTR ديناميكي.
- **متوسط التكلفة المرجّح (Weighted-Average Cost)**: عند استلام بضاعة تُعاد حسبة التكلفة تلقائياً.
- **نظام مرتجعات متكامل**: مرتجعات عملاء (إعادة للمخزون) + مرتجعات موردين (خصم من المخزون).

---

## 3. المكدس التقني (Tech Stack)

```
Frontend:      React 19.2 + Vite 8 + TypeScript 6 (strict)
Styling:       Tailwind CSS v4 (CSS-first، بلا tailwind.config.js)
Animation:     Framer Motion 12
State (UI):    Zustand 5 (Slices Pattern)
State (Server):TanStack React Query 5
Forms:         React Hook Form 7 + Zod 3
Icons:         @phosphor-icons/react  ⚠️ (AI_RULES يذكر Lucide — تعارض توثيقي)
i18n:          i18next + react-i18next
Backend:       Supabase (PostgreSQL + Auth + Edge Functions/Deno)
Testing:       Vitest + Testing Library + Playwright
```

> ⚠️ **ملاحظة توثيقية**: `AI_RULES.md` ينص على `Icons: Lucide React` لكن المشروع فعلياً يستخدم `@phosphor-icons/react` في 38 ملفاً. يجب تحديث القاعدة لتطابق الواقع.

---

## 4. المعمارية (Architecture)

المشروع يلتزم بشكل ممتاز بقاعدة **feature-based architecture** المذكورة في `AI_RULES.md`:

```
src/
├── features/          # كل ميزة معزولة: components / hooks / services / validations
│   ├── admin/  auth/  dashboard/  inventory/  pos/
│   ├── purchases/  reports/  sales/  settings/  shared/
├── layouts/           # RootLayout (يحرس المصادقة) + ProtectedLayout (غير مستخدم!)
├── lib/               # supabase client, admin-api, utils
├── pages/             # صفحات مربوطة بالراوتر
├── store/             # Zustand slices (authSlice + uiSlice → rootStore)
├── types/             # أنواع معزولة (database, pos, sales, ...)
└── i18n/              # الترجمات
```

### نقاط القوة المعمارية
- ✅ فصل واضح: `services` (وصول بيانات) ← `hooks` (React Query) ← `components` (عرض).
- ✅ Zustand بنمط Slices (`authSlice` + `uiSlice`) كما تنص القاعدة.
- ✅ أنواع معزولة في `src/types/`.
- ✅ استخدام `@/` alias بثبات.

### مخالفات معمارية
- 🟡 `ProtectedLayout.tsx` **كود ميّت** — الحراسة تتم فعلياً في `RootLayout` والراوتر لا يستدعيه إطلاقاً.
- 🟡 دالة `withTimeout` **مكررة 3 مرات** (`authSlice.ts`, `useAuth.ts`, `useSettingsQuery.ts`) — تخالف مبدأ DRY.
- 🟡 كود ميّت آخر: `createSalesOrder`, `clearAllReturns`, `CheckoutPayload`, `RpcSaleResponse`.

---

## 5. قاعدة البيانات والـ Backend

### الجداول
`settings, categories, products, suppliers, purchase_orders, purchase_order_items, sales_orders, sales_order_items, returns, purchase_returns, purchase_needs, profiles`

نقاط جيدة: استخدام `GENERATED ALWAYS AS` للأعمدة المحسوبة (`line_total`)، مفاتيح أجنبية مع `ON DELETE` مناسب، و RLS مفعّل على كل الجداول.

### 🔴 مشاكل حرجة في الـ Backend

**5.1 — Recursion لا نهائي في RLS للـ profiles** (`202606130002_profiles.sql:56-59`)
```sql
CREATE POLICY "profiles_read_admin" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')  -- ❌ يستعلم profiles داخل سياسة على profiles
  );
```
هذه المشكلة الكلاسيكية `infinite recursion detected in policy`. **الحل**: استخدام دالة `SECURITY DEFINER` تتجاوز RLS:
```sql
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;
-- ثم: USING (is_admin())
```

**5.2 — دالة `complete_sale` موجودة لكن غير مستخدمة!** (`202606010002_pos_sale_function.sql`)
يوجد RPC ذرّي كامل يتعامل مع البيع بشكل صحيح (`FOR UPDATE`، فحص المخزون، خصم ذرّي، rollback تلقائي عبر `EXCEPTION`) — لكن كود الواجهة (`completeSale` في `sales/services/api.ts`) **يتجاهله** ويقوم بالعملية يدوياً بطريقة غير آمنة. هذا أكبر مصدر خطر على البيانات وحله جاهز أصلاً.

**5.3 — جداول SQL خارج مجلد migrations**: `purchase_needs.sql` و`purchase_returns.sql` في جذر `supabase/` وليست مُرقّمة كـ migrations، ما يخلق خطر عدم تطبيقها على البيئات.

**5.4 — Edge Function `manage-users`**:
- 🔴 CORS مفتوح `Access-Control-Allow-Origin: "*"` على دالة إدارية حساسة.
- 🟡 تسريب رسائل أخطاء Postgres الخام للعميل (`err.message`) — كشف تفاصيل داخلية.
- 🟡 كل الأخطاء تُرجَع كـ HTTP 400 (حتى Unauthorized/Forbidden يجب أن تكون 401/403).
- 🟡 لا حماية من أن يقوم admin بتعطيل/تخفيض admin آخر أو نفسه (self-lockout).

---

## 6. الأخطاء والمشاكل مصنّفة حسب الخطورة

### 🔴 حرجة (Critical) — تتطلب تدخلاً فورياً

| # | المشكلة | الموقع | الأثر |
|---|---------|--------|-------|
| C1 | **البناء معطّل**: `ease: [..]` مُستنتج كـ `number[]` بدل tuple في Framer Motion v12 | `ProductGrid.tsx:21`, `CartPanel.tsx:~50` | `npm run build` يفشل تماماً |
| C2 | **عملية البيع غير ذرّية** + N+1 (select ثم update لكل بند) + سباق على المخزون (race condition) بلا rollback | `sales/services/api.ts:44-101` | بيع زائد (oversell)/طلب بلا بنود |
| C3 | **عدم تطابق الخصم**: الإجمالي مخصوم لكن البنود بالسعر الكامل | `pos/PosPage.tsx:72-83` | فساد الأرقام + مرتجعات تُرجِع أكثر من اللازم |
| C4 | **المرتجعات غير ذرّية** (5+ خطوات بلا transaction/rollback) + تجاهل صامت لو حُذف المنتج | `sales/hooks/useCreateReturn.ts` | تناقض المخزون والإجماليات |
| C5 | **Recursion في RLS للـ profiles** | `202606130002_profiles.sql:56` | تعطّل قراءة profiles للأدمن |
| C6 | **لا timeouts على أغلب طلبات Supabase** (موجود helper لكن يُستخدم في auth/settings فقط) | كل الـ hooks تقريباً | تعليق التطبيق عند بطء الشبكة |

**تفصيل C1 (الأسرع إصلاحاً)** — أضف `as const` لتحويل المصفوفة إلى tuple:
```ts
const cardVariant = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
} satisfies Variants;
```

**تفصيل C2/C3/C4 — الحل الجذري**: استبدال المنطق اليدوي باستدعاء `supabase.rpc('complete_sale', ...)` الموجود أصلاً، وإنشاء RPC مماثل للمرتجعات، وتطبيق الخصم **على مستوى البند** (unit price) لا الإجمالي فقط.

---

### 🟠 عالية (High)

| # | المشكلة | الموقع |
|---|---------|--------|
| H1 | كتابة داخل query: `fixReturnedOrders()` يُنفّذ UPDATE داخل `queryFn` عند كل جلب للمبيعات (تضخيم كتابة) | `sales/hooks/useSalesOrders.ts:11` |
| H2 | N+1: كل `OrderCard` يستدعي `useSalesOrderItems` حتى وهو مطوي | `sales/SalesHistoryPage.tsx:448` |
| H3 | فاتورة الشراء تُنشئ منتجات من إدخال المستخدم الخام بلا تأكيد/إزالة تكرار | `purchases/hooks/useCreatePurchaseInvoice.ts:40-62` |
| H4 | `payment_method: 'cash'` وقيمة عتبة المخزون `3`/`5` مبرمجة صلبة (hardcoded) | `api.ts:54`, `useDashboard.ts:41`, `ProductGrid.tsx:6` |
| H5 | غياب `created_by` عن المبيعات والمرتجعات ومنتجات الفواتير (رغم وجود العمود) | متعدد |
| H6 | استلام المخزون read-then-write بلا transaction (فقدان تحديثات متزامنة) | `purchases/hooks/useReceiveStock.ts:19-42` |
| H7 | تحديث أسعار كل المنتجات بـ N تحديثات منفصلة بلا ذرّية | `settings/services/api.ts:29-43` |
| H8 | `/login` مكوّن lazy بلا `<Suspense>` (بقية المسارات ملفوفة) | `routes.tsx:29` |
| H9 | eslint error: `setState` متزامن داخل useEffect | `RootLayout.tsx:63` |
| H10 | invalidation ناقص بعد البيع (لا يحدّث sales-orders/dashboard/reports) | `PosPage.tsx:93` |

---

### 🟡 متوسطة (Medium)

| # | المشكلة | الموقع |
|---|---------|--------|
| M1 | لا Error Boundary في التطبيق كله ← أي خطأ render = شاشة بيضاء | `main.tsx` |
| M2 | `QueryClient` بلا إعدادات (`staleTime:0` + `retry:3` حتى على 4xx) | `main.tsx:9` |
| M3 | `toArray/toSingle` مجرد `as T` بلا تحقق runtime = أمان أنواع زائف | `lib/supabase-utils.ts` |
| M4 | `useProfile` يتجاهل `error` من `.single()` (يخلط بين خطأ DB و"لا يوجد") | `admin/hooks/useUsers.ts:27` |
| M5 | خطأ نوع (copy-paste): `useCreatePurchaseNeed` يُرجع `as PurchaseReturn` بدل `PurchaseNeed` | `usePurchaseNeeds.ts:30` |
| M6 | تجاهل صامت لـ `error` في select داخل مرتجعات الموردين | `usePurchaseReturns.ts:36,72` |
| M7 | `productSchema` لا يتحقق من أسعار SYP ولا SKU/category | `inventory/validations/productSchema.ts` |
| M8 | over-fetch: جلب كل المنتجات لبناء خريطة أسماء فقط | `SalesHistoryPage.tsx`, `ReturnsHistoryPage.tsx` |
| M9 | خطر منطقة زمنية في `today` (UTC مقابل local) على الداشبورد | `useDashboard.ts:21` |
| M10 | لا pagination على قوائم المنتجات/الطلبات (نمو غير محدود) | متعدد |
| M11 | `usePosProducts` يجلب `cost_usd/cost_syp` (كشف بيانات التكلفة للعميل) | `usePosProducts.ts:12` |

---

### 🔵 منخفضة (Low) / تحسينات

| # | المشكلة | الموقع |
|---|---------|--------|
| L1 | `console.log` متروكة في تدفق المصادقة (تسريب تفاصيل) | `authSlice.ts:29-40`, `useAuth.ts:23-40` |
| L2 | شعار باسم ملف عربي + مسافات (هشّ) بدل اسم ASCII ثابت | `RootLayout.tsx:1` |
| L3 | أيقونات SVG inline بدل `@phosphor-icons/react` (تعارض مع بقية الكود) | `RootLayout.tsx:27-46` |
| L4 | `ProtectedLayout` كود ميّت | `layouts/ProtectedLayout.tsx` |
| L5 | كود ميّت: `createSalesOrder`, `clearAllReturns`, `clearReturns.ts` | متعدد |
| L6 | تكرار `withTimeout` 3 مرات (يجب نقله لـ shared util) | متعدد |
| L7 | تعارض توثيق: AI_RULES يذكر Lucide بينما المستخدم Phosphor | `AI_RULES.md:14` |
| L8 | `dir` غير متسق (LoginPage نعم، ProfilePage لا) | متعدد |
| L9 | SW registration يبتلع كل الأخطاء بصمت | `main.tsx:20` |

---

## 7. خطة الإصلاح المقترحة (Roadmap)

### المرحلة 0 — إصلاح عاجل (اليوم)
1. **C1**: إصلاح أخطاء `ease` بإضافة `as const` + `satisfies Variants` ← لإعادة البناء للعمل.
2. **H9**: نقل `setMobileOpen(false)` خارج التأثير المتزامن.
3. **C5**: تطبيق دالة `is_admin()` لإصلاح recursion في RLS.

### المرحلة 1 — سلامة البيانات (الأسبوع 1)
4. **C2**: تحويل `completeSale` لاستخدام `supabase.rpc('complete_sale', ...)` الموجود.
5. **C3**: تطبيق الخصم على مستوى البند قبل الإرسال.
6. **C4**: إنشاء RPC `create_return` ذرّي واستبدال المنطق اليدوي.
7. **H6/H7**: تحويل استلام المخزون وتحديث الأسعار الجماعي إلى RPCs ذرّية.

### المرحلة 2 — المرونة والأمان (الأسبوع 2)
8. **C6/L6**: إنشاء `withTimeout` مشترك في `lib/` وتطبيقه على كل الـ hooks.
9. **M1**: إضافة Error Boundary حول `Outlet`.
10. **M2**: ضبط `QueryClient` (staleTime معقول + retry predicate يتجاهل 4xx).
11. **5.4**: تقييد CORS + تعقيم رسائل الأخطاء + رموز HTTP صحيحة في edge function.

### المرحلة 3 — الجودة والتنظيف (مستمر)
12. **H1/H2**: نقل `fixReturnedOrders` لـ migration لمرة واحدة + join البنود بدل N+1.
13. **H4/H5**: نقل العتبات لـ settings + إضافة `created_by`.
14. **M3**: استبدال `as T` بتحقق Zod عند حدود البيانات.
15. **L1-L9**: تنظيف console.log، إعادة تسمية الشعار، توحيد الأيقونات، حذف الكود الميت، تحديث AI_RULES.

---

## 8. الخلاصة

المشروع **مبني على أساس معماري ممتاز** (feature-based، فصل مسؤوليات، تصميم راقٍ ثنائي اللغة)، وهذا رأس المال الأهم. لكنه يعاني من **فجوة حرجة في سلامة البيانات**: العمليات المالية والمخزنية (بيع، مرتجعات، استلام) تُنفَّذ كخطوات منفصلة بلا transactions، بينما يوجد في قاعدة البيانات RPC ذرّي جاهز لا يُستخدم. هذه أولوية قصوى لأن أي فشل جزئي = أرقام مالية ومخزنية خاطئة.

**الأولوية الآن**: (1) إعادة البناء للعمل [دقائق]، (2) تفعيل الـ RPC الذرّي للبيع [ساعات]، (3) إصلاح recursion في RLS [دقائق]. هذه الثلاثة تعالج أخطر المخاطر بأقل جهد.

بعد معالجة الطبقة الحرجة، المشروع مؤهل جداً للتوسّع نحو منصة E-commerce كما هو مخطط.
