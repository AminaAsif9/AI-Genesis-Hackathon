import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { Upload, PlayCircle, History, TrendingUp } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

const DAshboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      const loggedIn = true;

      if (loggedIn) {
        setUser(null);
      } else {
        navigate('/auth/login')
      }
    };

    checkAuth();
  }, [navigate]);

  const quickActions = [
    {
      title: "Upload Résumé",
      description: "Upload your resume to get personalized questions",
      icon: Upload,
      path: "/resume",
      gradient: "primary" as const,
    },
    {
      title: "Start Interview",
      description: "Begin a new mock interview session",
      icon: PlayCircle,
      path: "/interview/setup",
      gradient: "accent" as const,
    },
    {
      title: "View History",
      description: "Review your past interview sessions",
      icon: History,
      path: "#history",
      gradient: "secondary" as const,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Welcome Banner */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to practice your interview skills?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {quickActions.map((action) => (
              <GlassCard key={action.title} hover>
                <div className="flex flex-col h-full">
                  <action.icon className="h-12 w-12 text-accent mb-4" />
                  <h3 className="text-2xl font-semibold mb-2">{action.title}</h3>
                  <p className="text-muted-foreground mb-6 grow">
                    {action.description}
                  </p>
                  <GradientButton
                    gradient={action.gradient}
                    onClick={() => navigate(action.path)}
                    className="w-full"
                  >
                    Get Started
                  </GradientButton>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Recent Interviews */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Recent Interviews</h2>
            {interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <GlassCard key={interview.id} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {interview.job_title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {new Date(interview.created_at).toLocaleDateString()} •{" "}
                          {interview.status}
                        </p>
                      </div>
                      <GradientButton
                        gradient="primary"
                        onClick={() => navigate(`/interview/results/${interview.id}`)}
                      >
                        View Results
                      </GradientButton>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard>
                <div className="text-center py-12">
                  <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-xl text-muted-foreground">
                    No interviews yet. Start your first practice session!
                  </p>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Stats Placeholder */}
          <GlassCard>
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">
                Track Your Progress
              </h3>
              <p className="text-muted-foreground">
                Complete more interviews to see your improvement over time
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default DAshboard;
