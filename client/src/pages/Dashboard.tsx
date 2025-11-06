import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  Flag,
  Target,
  CheckCircle2,
  AlertCircle,
  Bell,
  Award,
  Flame,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = trpc.dashboard.overview.useQuery(undefined, {
    enabled: !!user,
  });

  // Initialize user if needed
  const initMutation = trpc.init.setupUser.useMutation();

  useEffect(() => {
    if (user && dashboardData?.sectors) {
      const hasAnySector = dashboardData.sectors.some(s => s.userProgress !== null);
      if (!hasAnySector) {
        initMutation.mutate();
      }
    }
  }, [user, dashboardData]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { gdp, classification, stats, sectors } = dashboardData;
  const activeSectors = sectors.filter(s => s.userProgress?.isUnlocked);

  // Get GDP color based on value
  const getGDPColor = (value: number) => {
    if (value >= 850) return "text-green-600 dark:text-green-400";
    if (value >= 700) return "text-blue-600 dark:text-blue-400";
    if (value >= 550) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getSectorColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Flag className="w-10 h-10 text-blue-600" />
                {user?.countryName || "جمهوريتي"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                "{user?.countryMotto || "نحو التطور المستدام"}"
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setLocation("/settings")}>
                الإعدادات
              </Button>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4 ml-2" />
                الإشعارات
                {stats.unreadNotifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                    {stats.unreadNotifications}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* GDP Card - Hero */}
        <Card className="mb-8 bg-gradient-to-br from-blue-600 to-green-600 text-white border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/80 text-sm font-medium">الناتج القومي</span>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-7xl font-black">{gdp.totalGdp}</span>
                  {gdp.growthRate !== 0 && (
                    <div className="flex items-center gap-1">
                      {gdp.growthRate > 0 ? (
                        <TrendingUp className="w-6 h-6 text-green-300" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-300" />
                      )}
                      <span className="text-2xl font-bold">
                        {gdp.growthRate > 0 ? "+" : ""}{gdp.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-3xl">{classification.icon}</span>
                  <span className="text-xl font-bold">{classification.classificationAr}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-white/70 text-xs mb-1">Streak</div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-300" />
                      <span className="text-2xl font-bold">{user?.streakDays || 0}</span>
                      <span className="text-sm">يوم</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-white/70 text-xs mb-1">المستوى</div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-300" />
                      <span className="text-2xl font-bold">{user?.currentLevel || 1}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold mb-4 text-white/90">تفاصيل GDP</h3>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">BaseGDP</span>
                    <span className="font-bold text-xl">{gdp.baseGdp}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">مكافأة النمو</span>
                    <span className="font-bold text-xl text-green-300">+{gdp.growthBonus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">مكافأة الاستمرارية</span>
                    <span className="font-bold text-xl text-orange-300">+{gdp.streakBonus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">مكافأة التنوع</span>
                    <span className="font-bold text-xl text-yellow-300">+{gdp.diversityBonus}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">الإجمالي</span>
                      <span className="font-black text-2xl">{gdp.totalGdp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المهام المعلقة</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">المهام المكتملة</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">القطاعات النشطة</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeSectors.length}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الإنجازات</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.achievementsUnlocked}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sectors Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">القطاعات</h2>
            <Button variant="outline" size="sm" onClick={() => setLocation("/sectors")}>
              عرض الكل
              <ArrowRight className="mr-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSectors.map((sector) => {
              const score = sector.userProgress?.currentScore || 0;
              const colorClass = getSectorColor(score);

              return (
                <Card 
                  key={sector.id} 
                  className="card-hover cursor-pointer"
                  onClick={() => setLocation(`/sectors/${sector.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{sector.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{sector.nameAr}</CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{sector.nameEn}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getGDPColor(score)}`}>
                          {score}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={score} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {sector.userProgress?.tasksCompleted || 0} / {sector.userProgress?.tasksTotal || 0} مهام
                      </span>
                      <span className={`font-medium ${colorClass.replace('bg-', 'text-')}`}>
                        {score >= 85 ? "ممتاز" : score >= 70 ? "جيد" : score >= 50 ? "مقبول" : "يحتاج تحسين"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Locked Sectors */}
          {sectors.filter(s => !s.userProgress?.isUnlocked && s.requiredLevel <= (user?.currentLevel || 1)).length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                قطاعات متاحة للفتح
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sectors
                  .filter(s => !s.userProgress?.isUnlocked && s.requiredLevel <= (user?.currentLevel || 1))
                  .map((sector) => (
                    <Card key={sector.id} className="opacity-60 hover:opacity-100 transition-opacity">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl grayscale">{sector.icon}</span>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">{sector.nameAr}</p>
                            <p className="text-xs text-gray-500">مقفل - متطلبات الفتح غير محققة</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" onClick={() => setLocation("/resources")}>
                <TrendingUp className="ml-2 w-5 h-5" />
                الموارد والميزانية
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => setLocation("/projects")}>
                <CheckCircle2 className="ml-2 w-5 h-5" />
                المشروعات التنموية
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => setLocation("/achievements")}>
                <Award className="ml-2 w-5 h-5" />
                الإنجازات
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نصائح للتحسين</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gdp.totalGdp < 700 && (
                <div className="flex gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    ركز على تحسين القطاعات الأساسية للوصول إلى GDP 700+
                  </p>
                </div>
              )}
              {user && user.streakDays < 7 && (
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    حافظ على نشاطك اليومي للحصول على مكافأة Streak
                  </p>
                </div>
              )}
              {activeSectors.length < 3 && (
                <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    افتح المزيد من القطاعات لزيادة مكافأة التنوع
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
