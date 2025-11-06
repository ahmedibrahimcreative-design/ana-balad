import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket,
  Clock,
  DollarSign,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Projects() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user && !authLoading) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: projects, isLoading } = trpc.projects.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: sectors } = trpc.dashboard.overview.useQuery(undefined, {
    enabled: !!user,
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Play className="w-4 h-4 text-blue-600" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "paused":
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "planned":
        return "مخطط";
      case "in_progress":
        return "جاري التنفيذ";
      case "completed":
        return "مكتمل";
      case "paused":
        return "متوقف";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "عاجل";
      case "high":
        return "عالي";
      case "medium":
        return "متوسط";
      case "low":
        return "منخفض";
      default:
        return priority;
    }
  };

  const groupedProjects = {
    in_progress: projects?.filter(p => p.status === "in_progress") || [],
    planned: projects?.filter(p => p.status === "planned") || [],
    completed: projects?.filter(p => p.status === "completed") || [],
    paused: projects?.filter(p => p.status === "paused") || [],
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Rocket className="w-10 h-10 text-blue-600" />
                المشروعات التنموية
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                تتبع وإدارة مشروعاتك لتطوير القطاعات
              </p>
            </div>
            <Button size="lg">
              <Plus className="ml-2 w-5 h-5" />
              مشروع جديد
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">جاري التنفيذ</p>
                  <p className="text-2xl font-bold text-blue-600">{groupedProjects.in_progress.length}</p>
                </div>
                <Play className="w-8 h-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مخطط</p>
                  <p className="text-2xl font-bold text-gray-600">{groupedProjects.planned.length}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">مكتمل</p>
                  <p className="text-2xl font-bold text-green-600">{groupedProjects.completed.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">متوقف</p>
                  <p className="text-2xl font-bold text-yellow-600">{groupedProjects.paused.length}</p>
                </div>
                <Pause className="w-8 h-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        {projects && projects.length > 0 ? (
          <div className="space-y-8">
            {/* In Progress */}
            {groupedProjects.in_progress.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Play className="w-6 h-6 text-blue-600" />
                  جاري التنفيذ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedProjects.in_progress.map((project) => {
                    const sector = sectors?.sectors.find(s => s.id === project.sectorId);
                    return (
                      <Card key={project.id} className="card-hover">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-3xl">{sector?.icon || "📊"}</span>
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-1">{project.titleAr}</CardTitle>
                                <p className="text-sm text-gray-500">{sector?.nameAr}</p>
                              </div>
                            </div>
                            <Badge variant={getPriorityColor(project.priority)}>
                              {getPriorityText(project.priority)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>التقدم</span>
                                <span className="font-bold">{project.progressPercentage}%</span>
                              </div>
                              <Progress value={project.progressPercentage} className="h-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{project.timeSpent}/{project.requiredTime}س</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span>{project.moneySpent}/{project.requiredMoney}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-600" />
                                <span>{project.energySpent}/{project.requiredEnergy}</span>
                              </div>
                            </div>

                            {project.descriptionAr && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {project.descriptionAr}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Planned */}
            {groupedProjects.planned.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  مخطط
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedProjects.planned.map((project) => {
                    const sector = sectors?.sectors.find(s => s.id === project.sectorId);
                    return (
                      <Card key={project.id} className="card-hover opacity-75">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-3xl grayscale">{sector?.icon || "📊"}</span>
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-1">{project.titleAr}</CardTitle>
                                <p className="text-sm text-gray-500">{sector?.nameAr}</p>
                              </div>
                            </div>
                            <Badge variant={getPriorityColor(project.priority)}>
                              {getPriorityText(project.priority)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{project.requiredTime}س</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-green-600" />
                                <span>{project.requiredMoney}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-600" />
                                <span>{project.requiredEnergy}</span>
                              </div>
                            </div>

                            {project.descriptionAr && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {project.descriptionAr}
                              </p>
                            )}

                            <Button size="sm" className="w-full">
                              <Play className="ml-2 w-4 h-4" />
                              بدء المشروع
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed */}
            {groupedProjects.completed.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  مكتمل
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groupedProjects.completed.map((project) => {
                    const sector = sectors?.sectors.find(s => s.id === project.sectorId);
                    return (
                      <Card key={project.id} className="card-hover">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{sector?.icon || "📊"}</span>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                                {project.titleAr}
                              </h3>
                              <p className="text-xs text-gray-500 mb-2">{sector?.nameAr}</p>
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="w-3 h-3 ml-1" />
                                مكتمل
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                لا توجد مشروعات بعد
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ابدأ بإنشاء مشروع تنموي لتطوير قطاعاتك
              </p>
              <Button size="lg">
                <Plus className="ml-2 w-5 h-5" />
                إنشاء مشروع جديد
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
