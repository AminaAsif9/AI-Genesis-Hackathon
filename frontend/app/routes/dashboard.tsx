import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { Upload, PlayCircle, History, TrendingUp } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { apiClient } from "~/lib/api";
import { useToast } from "~/hooks/use-toast";

interface User {
  name: string;
  email: string;
  id: string;
  createdAt: string;
}

interface Interview {
  interview_id: string;
  job_title: string;
  completed_at: string;
  overall_score: number;
  scores: any;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Load real interview history
        try {
          const historyResponse = await apiClient.getInterviewHistory();
          setInterviews(historyResponse.interviews);
        } catch (error: any) {
          console.error("Failed to load interview history:", error);
          // Continue with empty interviews array
        }
      } else {
        navigate('/auth/login');
      }

      setLoading(false);
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
      path: "history",
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Welcome Banner */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {firstName}! 👋
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
                  <p className="text-muted-foreground mb-6 flex-grow">
                    {action.description}
                  </p>
                  <GradientButton
                    gradient={action.gradient}
                    onClick={() => {
                      if (action.path.startsWith('#') || action.path === 'history') {
                        // Scroll to history section
                        const historySection = document.querySelector('[data-history-section]');
                        historySection?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate(action.path);
                      }
                    }}
                    className="w-full"
                  >
                    Get Started
                  </GradientButton>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Recent Interviews */}
          <div className="mb-12" data-history-section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold">Recent Interviews</h2>
              {interviews.length === 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  No interviews yet
                </span>
              )}
            </div>
            {interviews.length > 0 ? (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <GlassCard key={interview.interview_id} hover>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          {interview.job_title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {new Date(interview.completed_at).toLocaleDateString()} •{" "}
                          Score: {interview.overall_score}/10
                        </p>
                      </div>
                      <GradientButton
                        gradient="primary"
                        onClick={() => navigate(`/interview/result/${interview.interview_id}`)}
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
                  <h3 className="text-xl font-semibold mb-2">No Interviews Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Complete your first interview to see your results here.
                  </p>
                  <GradientButton gradient="accent" onClick={() => navigate("/interview/setup")}>
                    Start Your First Interview
                  </GradientButton>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Stats Placeholder */}
          <GlassCard>
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-semold mb-2">
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

export default Dashboard;