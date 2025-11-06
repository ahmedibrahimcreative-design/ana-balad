import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { 
  Flag, 
  TrendingUp, 
  Target, 
  Award, 
  Users, 
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-2xl">
                  <Flag className="w-16 h-16 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white">
              <span className="block mb-2">🏴 أنا بلد</span>
              <span className="text-gradient text-4xl lg:text-5xl">I am Legend</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              حوّل حياتك إلى <span className="font-bold text-blue-600">دولة كاملة</span> تديرها بنفسك
              <br />
              <span className="text-lg">مع قطاعات، موارد، شراكات، وتقارير ربع سنوية</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
                onClick={() => window.location.href = getLoginUrl()}
              >
                <Sparkles className="ml-2 h-5 w-5" />
                ابدأ رحلتك الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                اكتشف المزيد
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">9</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">قطاعات حياة</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">GDP</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مؤشر قومي</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">∞</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">إمكانيات النمو</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              لماذا أنا بلد؟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              نظام ثوري لإدارة الحياة يحولك من شخص عادي إلى رئيس دولة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-6 card-hover bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="bg-blue-100 dark:bg-blue-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                نظام القطاعات المتدرج
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                ابدأ بـ 3 قطاعات أساسية وافتح 6 قطاعات إضافية كلما تقدمت في رحلتك
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>البنية التحتية والصحة والاقتصاد</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>التعليم والدفاع والعمل</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>العلاقات والإبداع والروحانيات</span>
                </li>
              </ul>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 card-hover bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="bg-green-100 dark:bg-green-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                مؤشر GDP القومي
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                مؤشر شامل يقيس أداءك عبر 4 مكونات رئيسية
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>BaseGDP: الأداء المرجح</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>GrowthBonus: مكافأة النمو</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>StreakBonus: مكافأة الاستمرارية</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>DiversityBonus: مكافأة التنوع</span>
                </li>
              </ul>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 card-hover bg-gradient-to-br from-yellow-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="bg-yellow-100 dark:bg-yellow-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                نظام الإنجازات والتلعيب
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                أوسمة، شارات، وإنجازات تحفزك على الاستمرار والتطور
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>12+ إنجاز قابل للفتح</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>نظام Streaks للتحفيز اليومي</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>نقاط ومكافآت</span>
                </li>
              </ul>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 card-hover bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="bg-purple-100 dark:bg-purple-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                التقارير الذكية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                تقارير تلقائية تساعدك على فهم تقدمك واتخاذ قرارات أفضل
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تقارير أسبوعية وشهرية</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تحليلات ربع سنوية وسنوية</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>توصيات مخصصة للتحسين</span>
                </li>
              </ul>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 card-hover bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="bg-pink-100 dark:bg-pink-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                نظام الشراكات
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                ابحث عن "دول" أخرى وابنِ شراكات استراتيجية معها
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>شراكات تعاونية ومبادلة موارد</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>برامج توجيه وإرشاد</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تقييم ومراجعة الشراكات</span>
                </li>
              </ul>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 card-hover bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 border-2">
              <div className="bg-indigo-100 dark:bg-indigo-900 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Flag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                الهوية الوطنية
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                صمم علمك الخاص واختر اسم وشعار دولتك
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>علم وطني مخصص</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>شعار ورؤية للدولة</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>تخصيص كامل للواجهة</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            جاهز لبناء دولتك؟
          </h2>
          <p className="text-xl lg:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            انضم الآن وابدأ رحلتك نحو التطور المستدام
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-10 py-6 shadow-2xl hover:shadow-3xl transition-all"
            onClick={() => window.location.href = getLoginUrl()}
          >
            <Sparkles className="ml-2 h-6 w-6" />
            ابدأ مجاناً الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <Flag className="w-12 h-12 mx-auto text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">أنا بلد - I am Legend</h3>
            <p className="text-gray-400">أنت لست مجرد شخص، أنت دولة كاملة!</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>© 2025 أنا بلد. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
