# تقرير شامل — نظام Casa Nova POS

> وثيقة مرجعية كاملة: الصفحات، الوظائف، قاعدة البيانات، البنية، والوضع الحالي
> آخر تحديث: 2026-07-11 (بعد اكتمال الإصلاحات)
> التقرير الفني المحدث: `PROJECT_ANALYSIS.md`

---

## 1. ما هو المشروع؟

**Casa Nova POS** هو نظام **نقاط بيع (Point of Sale) + إدارة مخزون** متكامل، موجّه لمحلات التجزئة في سوريا. يستبدل الأنظمة الورقية/القديمة بأداة رقمية سريعة ثنائية العملة وثنائية اللغة.

### المزايا الأساسية
- **ثنائية العملة**: كل منتج له أسعار وتكاليف بالدولار (USD) والليرة السورية (SYP)، مع **سعر صرف مركزي** قابل للتعديل يُعاد من خلاله حساب أسعار SYP لكل المنتجات دفعة واحدة.
- **ثنائية اللغة (عربي/إنجليزي)**: ترجمة كاملة عبر i18next + دعم RTL/LTR ديناميكي.
- **ثيم داكن افتراضي** + ثيم فاتح.
- **إدارة مستخدمين بصلاحيات** (admin / manager / cashier) عبر Edge Function.
- **عمليات مالية ومخزنية ذرّية** (بعد الإصلاحات): بيع، مرتجعات عملاء وموردين، استلام بضاعة.

### لمَن؟
أصحاب المحلات والكاشير في بيئة بيع سريعة على متصفح الحاسوب المكتبي.

---

## 2. المكدس التقني

| الطبقة | التقنية |
|--------|---------|
| الواجهة | React 19 + Vite 8 + TypeScript 6 (strict) |
| التنسيق | Tailwind CSS v4 (CSS-first، بلا config) |
| الحركة | Framer Motion 12 |
| حالة الواجهة | Zustand 5 (نمط Slices) |
| حالة الخادم | TanStack React Query 5 |
| النماذج | React Hook Form + Zod 3 |
| الأيقونات | Phosphor Icons |
| الـ Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| الاختبارات | Vitest + Testing Library + Playwright |

### بنية المشروع (Feature-Based)
```
src/
├── features/            # كل ميزة: components / hooks / services / validations
│   ├── admin/           # إدارة المستخدمين
│   ├── auth/            # تسجيل الدخول
│   ├── dashboard/       # مؤشرات الصفحة الرئيسية
│   ├── inventory/       # المنتجات والتصنيفات
│   ├── pos/             # نقطة البيع
│   ├── purchases/       # المشتريات (أوامر/فواتير/نواقص/مرتجعات موردين)
│   ├── reports/         # التقارير
│   ├── sales/           # المبيعات والمرتجعات
│   ├── settings/        # الإعدادات
│   └── shared/          # مكونات مشتركة (Toast, Skeleton, ErrorBoundary...)
├── layouts/             # RootLayout (هيكل + حارس مصادقة)
├── lib/                 # supabase client, admin-api, constants, supabase-utils
├── pages/               # الصفحات المربوطة بالراوتر
├── store/               # Zustand slices (authSlice + uiSlice)
├── types/               # الأنواع المعزولة
└── i18n/                # الترجمات
```

---

## 3. قاعدة البيانات (PostgreSQL)

### 3.1 الجداول (13 جدولاً)

| الجدول | الوصف | الأعمدة الرئيسية |
|--------|-------|-----------------|
| `profiles` | ملفات المستخدمين | id (FK→auth.users), email, display_name, role, is_active |
| `settings` | إعدادات المتجر | key (فريد), value, updated_at |
| `categories` | تصنيفات المنتجات | name, created_at |
| `products` | المنتجات | name, sku, category_id, price_usd/syp, cost_usd/syp, quantity |
| `suppliers` | الموردون | name, contact_info |
| `purchase_orders` | أوامر الشراء | supplier_id, order_date, total_usd/syp, status, created_by |
| `purchase_order_items` | بنود أوامر الشراء | po_id, product_id, quantity, unit_price_usd/syp, line_total_* (محسوب) |
| `sales_orders` | طلبات البيع | order_date, total_usd/syp, payment_method, status, created_by |
| `sales_order_items` | بنود البيع | so_id, product_id, quantity, unit_price_usd/syp, line_total_* (محسوب) |
| `returns` | مرتجعات العملاء | so_id, product_id, quantity, unit_price_usd/syp, reason |
| `purchase_returns` | مرتجعات الموردين | product_id, po_id, quantity, unit_price_usd/syp, reason, created_by |
| `purchase_needs` | قائمة النواقص | name, quantity, notes, status (pending/ordered), created_by |
| *(أعمدة محسوبة)* | | `line_total_usd/syp` = `GENERATED ALWAYS AS (quantity × unit_price)` |

### 3.2 العلاقات (Foreign Keys)
- `profiles.id → auth.users.id` (CASCADE)
- `products.category_id → categories.id` (SET NULL)
- `purchase_orders.supplier_id → suppliers.id` (SET NULL) · `created_by → auth.users`
- `purchase_order_items.po_id → purchase_orders.id` (CASCADE) · `product_id → products.id` (SET NULL)
- `sales_order_items.so_id → sales_orders.id` (CASCADE) · `product_id → products.id` (SET NULL)
- `returns.so_id → sales_orders.id` (CASCADE) · `returns.product_id → products.id` (CASCADE)
- `purchase_returns.product_id → products.id` (SET NULL) · `po_id → purchase_orders.id` (SET NULL)

### 3.3 الأمان (RLS)
- RLS **مفعّل على كل الجداول**.
- سياسة عامة: كل المصادقين (`auth.role() = 'authenticated'`) يقرؤون ويكتبون (جداول الأعمال).
- `profiles`: سياسات خاصة — قراءة ذاتية لكل مستخدم + صلاحيات admin عبر دالة `is_admin()` (SECURITY DEFINER) **بعد إصلاح مشكلة الـ recursion**.

### 3.4 الدوال (RPC Functions) — الذرّية
| الدالة | الوظيفة | ميزتها |
|--------|---------|--------|
| `complete_sale(p_total_usd, p_total_syp, p_items, p_payment_method)` | إتمام البيع | ذرّية: `FOR UPDATE` على المخزون، فحص الكمية، إدراج الطلب+البنود، خصم المخزون، rollback تلقائي على أي خطأ، يسجّل `created_by` |
| `create_return(p_so_id, p_reason, p_items)` | مرتجعات العملاء | ذرّية: تسجيل المرتجع + استعادة المخزون + تخفيض الإجماليات + إلغاء الطلب الفارغ |
| `receive_stock(p_product_id, p_quantity, p_unit_cost_usd, p_unit_cost_syp)` | استلام مخزون | ذرّية: قفل الصف + إعادة حساب **متوسط التكلفة المرجّح** |
| `bulk_update_syp_prices(p_rate)` | تحديث أسعار SYP | UPDATE واحد ذرّي لكل المنتجات من USD |
| `is_admin()` | فحص صلاحية admin | SECURITY DEFINER تكسر recursion |

### 3.5 الـ Migrations (11 ملفاً)
- **الأساسية**: `initial_schema`, `pos_sale_function`, `enable_rls`, `profiles`, `add_created_by`, `returns_table`.
- **الإصلاحية (2026-07-11)**: `fix_profiles_rls`, `complete_sale_v2`, `create_return`, `bulk_update_syp`, `receive_stock`.

> ⚠️ **مطلوب من المستخدم**: تشغيل الـ migrations الخمسة الأخيرة على Supabase (SQL Editor أو `supabase db push`).

### 3.6 Edge Function `manage-users`
دالة Deno لإدارة المستخدمين عبر `service_role`:
- `GET /users` — قائمة المستخدمين + ملفاتهم.
- `POST /create-user` — إنشاء مستخدم (تحقق Zod، تفعيل تلقائي).
- `PATCH /update-user` — تحديث بريد/كلمة مرور/دور/حالة.
- **بعد التحسين الأمني**: CORS محصور بـ `ALLOWED_ORIGINS`، رموز HTTP صحيحة (401/403/404)، تعقيم رسائل الأخطاء.

---

## 4. الصفحات (14 صفحة)

### 4.1 تسجيل الدخول — `/login` (LoginPage)
- نموذج بريد/كلمة مرور مع تحقق وأخطاء.
- موجه RTL/LTR، autoFocus، لُفّ بـ `<Suspense>` بعد الإصلاح.

### 4.2 لوحة التحكم — `/` (DashboardPage)
- **مؤشرات اليوم**: مبيعات USD، مبيعات SYP، عدد الطلبات (المكتملة فقط)، عدد المنتجات، عدد المنتجات منخفضة المخزون (عتبة مشتركة `LOW_STOCK_THRESHOLD`).
- **قوائم النشاط**: آخر 5 مبيعات + آخر 5 أوامر شراء.
- 5 استعلامات متوازية بطلب واحد مع timeout، تصميم StatCard + ActivityItem.

### 4.3 نقطة البيع — `/pos` (PosPage)
- **شبكة منتجات** (بحث + بطاقات بالأسعار الثنائية + شارات مخزون).
- **سلة جانبية** (CartPanel): تعديل كمية، تعديل سعر مخصص بالعملتين، خصم، إجماليات.
- **إتمام بيع**: الخصم يُطبّق **على مستوى البند** (بعد الإصلاح) فيتطابق الإجمالي مع البنود، ثم `complete_sale` RPC ذرّي.
- **بعد البيع**: مسح السلة + تحديث cache للمنتجات/المبيعات/الداشبورد/التقارير.
- زر عائم للسلة + مؤشرات أعلى الصفحة (عدد منتجات، مخزون، قيمة السلة).

### 4.4 المخزون — `/inventory` (InventoryPage)
- **منتجات**: جدول/قائمة CRUD مع تصنيفات، أسعار وتكاليف مزدوجة، بحث.
- **تصنيفات**: إدارة CRUD (CategoryManager).
- تحقق Zod لـ `productSchema` (يتضمن أسعار SYP الآن).
- واجهة تفاعلية كاملة (فورم مودال، تأكيد حذف، حالات تحميل/خطأ/فارغ).

### 4.5 المشتريات — `/purchases` (PurchaseOrdersPage)
قسم تابلز متعدد:
- **أوامر الشراء**: إنشاء أمر بمورد + بنود، عرض التفاصيل، تغيير الحالة (pending/received/cancelled).
- **فواتير الشراء**: إنشاء فاتورة بـ **استلام تلقائي** للمخزون (RPC ذرّي `receive_stock` + متوسط التكلفة) + **منع تكرار المنتجات** (بحث `ilike` بالاسم).
- **النواقص (Purchase Needs)**: قائمة شراء يدوية (اسم/كمية/ملاحظات/حالة) بلا أثر مخزني.
- **مرتجعات الموردين**: إرجاع بضاعة للمورد مع **خصم ذرّي** من المخزون واسترداد نقدي.

### 4.6 الموردون — `/purchases/suppliers` (SuppliersPage)
- CRUD كامل للموردين (اسم + معلومات تواصل)، قائمة/فورم، تأكيد حذف.

### 4.7 سجل المبيعات — `/sales` (SalesHistoryPage)
- قائمة طلبات بيع قابلة للتوسيع مع بحث وفلترة (مكتملة/ملغاة).
- **مرتجعات**: اختيار بنود + سبب + إرجاع دفعة واحدة أو منفردة.
- **بعد الإصلاح**: بنود كل الطلبات تُجلب بطلب واحد (`useSalesOrdersItems`) بدل N+1.

### 4.8 سجل المرتجعات — `/returns` (ReturnsHistoryPage)
- جدول/قائمة قراءة فقط لكل مرتجعات العملاء مع تاريخ الطلب الأصلي (متوافق مع الموبايل).

### 4.9 التقارير — `/reports` (ReportsPage)
- **بطاقات Bento**: إجمالي مبيعات USD/SYP + عدد المعاملات، الأرباح (USD/SYP)، أفضل المنتجات (مدمج).
- **فلترة شهرية** (DatePresets): سنة/شهر فقط، قائمة منسدلة أو bottom sheet للموبايل.
- **جدول أفضل المنتجات** الكامل، مؤشر تحديث، skeletons.

### 4.10 الإعدادات — `/settings` (SettingsPage)
- **سعر الصرف**: تعديل → إعادة حساب أسعار SYP لكل المنتجات بـ RPC ذرّي.
- **معلومات المتجر**: الاسم والعنوان.

### 4.11 إدارة المستخدمين — `/admin/users` (UsersPage)
- جدول مستخدمين (بريد، دور، حالة، آخر دخول) عبر Edge Function.
- إنشاء/تعديل مستخدم (مودال) — **admin فقط**.

### 4.12 الملف الشخصي — `/profile` (ProfilePage)
- بيانات المستخدم، شارة الدور، تاريخ الانضمام، تسجيل الخروج.

### 4.13 الهيكل العام — `RootLayout`
- شريط تنقل (ديسكتوب + درج موبايل)، مبدّل لغة، مبدّل ثيم، أيقونات Phosphor.
- **حارس مصادقة**: توجيه غير المصرّح لـ `/login`.
- **بعد الإصلاح**: إصلاح `setState` في effect، استبدال الأيقونات SVG بـ Phosphor، تسمية الشعار ASCII.

---

## 5. الحالة الحالية (بعد الإصلاحات)

### ✅ ما تم إصلاحه (من الموجز الكامل في PROJECT_ANALYSIS.md)
- **البناء يعمل**: `tsc` ✅ · `eslint` ✅ (0 أخطاء) · `vite build` ✅
- **الذرّية**: بيع (`complete_sale`)، مرتجعات عملاء (`create_return`)، استلام مخزون (`receive_stock`)، تسعير جماعي (`bulk_update_syp_prices`).
- **أمان**: إصلاح recursion في RLS، تقوية Edge Function، تحقق Zod عند حدود البيانات.
- **أداء**: إزالة N+1 في سجل المبيعات، إزالة الكتابة داخل query، توحيد `withTimeout` في كل الـ hooks.
- **جودة**: Error Boundary، ضبط QueryClient، إزالة الكود الميت وconsole.log، توحيد الأيقونات.

### 📌 خطوات يدوية مطلوبة
1. تشغيل الـ migrations الخمسة الجديدة على Supabase.
2. نقل `purchase_needs.sql` و`purchase_returns.sql` إلى `migrations/` إن لم يُطبّقا.
3. ضبط `ALLOWED_ORIGINS` في أسرار المشروع لتفعيل CORS المحصور في edge function.

### 🔶 تحسينات مستقبلية (اختيارية)
- حذف `cost_usd/cost_syp` من استعلام POS (منع كشف التكلفة).
- منع admin من تعطيل/تخفيض نفسه.
- إضافة معاملة ذرّية شاملة لفواتير الشراء (الجدول + البنود + المخزون كوحدة واحدة).

---

## 6. الخلاصة

المشروع **متكامل ووظيفي**: 14 صفحة تغطي دورة حياة التجارة كاملة (شراء ← مخزون ← بيع ← مرتجعات ← تقارير)، وقاعدة بيانات مصممة جيداً بأعمدة محسوبة وعلاقات صحيحة وRLS، وواجهة راقية ثنائية اللغة/العملة. بعد الإصلاحات أصبحت العمليات المالية **ذرّية وآمنة**، والبنية **نظيفة وقابلة للتوسّع** نحو منصة E-commerce كما هو مخطط.
