import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Resources() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user && !authLoading) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: resources, isLoading: resourcesLoading } = trpc.resources.get.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: budgets, isLoading: budgetsLoading } = trpc.resources.getSectorBudgets.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: sectors } = trpc.dashboard.overview.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading || resourcesLoading || budgetsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!resources) return null;

  const timePercentage = (resources.timeUsed / resources.timeAvailable) * 100;
  const moneyPercentage = (resources.moneyUsed / resources.moneyAvailable) * 100;
  const energyPercentage = (resources.energyUsed / resources.energyAvailable) * 100;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="ml-2 w-4 h-4" />
            العودة للوحة التحكم
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            💰 الموارد القومية
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            إدارة الوقت والمال والطاقة المتاحة
          </p>
        </div>

        {/* Resources Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Time */}
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  الوقت
                </CardTitle>
                <Badge variant={timePercentage >= 90 ? "destructive" : "default"}>
                  {timePercentage.toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resources.timeAvailable - resources.timeUsed}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {resources.timeAvailable} ساعة
                  </span>
                </div>
                <Progress 
                  value={timePercentage} 
                  className="h-2"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  متبقي: {resources.timeAvailable - resources.timeUsed} ساعة هذا الأسبوع
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Money */}
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  الميزانية
                </CardTitle>
                <Badge variant={moneyPercentage >= 90 ? "destructive" : "default"}>
                  {moneyPercentage.toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resources.moneyAvailable - resources.moneyUsed}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {resources.moneyAvailable} وحدة
                  </span>
                </div>
                <Progress 
                  value={moneyPercentage} 
                  className="h-2"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  متبقي: {resources.moneyAvailable - resources.moneyUsed} وحدة ميزانية
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Energy */}
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  الطاقة
                </CardTitle>
                <Badge variant={energyPercentage >= 90 ? "destructive" : "default"}>
                  {energyPercentage.toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {resources.energyAvailable - resources.energyUsed}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {resources.energyAvailable} نقطة
                  </span>
                </div>
                <Progress 
                  value={energyPercentage} 
                  className="h-2"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  متبقي: {resources.energyAvailable - resources.energyUsed} نقطة طاقة
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Allocation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">توزيع الميزانية على القطاعات</CardTitle>
          </CardHeader>
          <CardContent>
            {budgets && budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const sector = sectors?.sectors.find(s => s.id === budget.sectorId);
                  if (!sector) return null;

                  return (
                    <div key={budget.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{sector.icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {sector.nameAr}
                            </h3>
                            <p className="text-sm text-gray-500">{sector.nameEn}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">الوقت</span>
                          </div>
                          <p className="text-lg font-bold">
                            {budget.timeSpent} / {budget.timeAllocated} ساعة
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">المال</span>
                          </div>
                          <p className="text-lg font-bold">
                            {budget.moneySpent} / {budget.moneyAllocated} وحدة
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">الطاقة</span>
                          </div>
                          <p className="text-lg font-bold">
                            {budget.energySpent} / {budget.energyAllocated} نقطة
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  لم يتم توزيع الميزانية بعد
                </p>
                <Button onClick={() => setLocation("/dashboard")}>
                  <TrendingUp className="ml-2 w-4 h-4" />
                  ابدأ بتوزيع الموارد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 نصائح لإدارة الموارد</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>وزّع مواردك بحكمة على القطاعات الأكثر أهمية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>احرص على عدم استنزاف كل الطاقة في يوم واحد</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>الموارد تتجدد أسبوعياً، خطط بناءً على ذلك</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span>استثمر في المشروعات التنموية لزيادة كفاءة استخدام الموارد</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
