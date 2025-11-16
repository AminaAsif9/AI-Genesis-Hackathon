import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { User, Mail, Calendar, Trophy, Settings, LogOut } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate("/auth/login");
        return;
      }
      setUser(JSON.parse(storedUser));
    };
    checkAuth();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Profile</h1>
            <p className="text-xl text-muted-foreground">
              Manage your account and view your interview progress
            </p>
          </div>

          {/* Profile Header */}
          <GlassCard className="mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary/20">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                <div className="flex flex-col md:flex-row gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <GradientButton
                  gradient="primary"
                  onClick={() => {
                    toast({
                      title: "Settings Coming Soon",
                      description: "Profile customization features are under development.",
                      duration: 4000,
                    });
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </GradientButton>
                <GradientButton
                  gradient="secondary"
                  variant="outline"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </GradientButton>
              </div>
            </div>
          </GlassCard>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">0</div>
                <div className="text-muted-foreground">Interviews Completed</div>
                <Badge variant="secondary" className="mt-2">Demo Data</Badge>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">0</div>
                <div className="text-muted-foreground">Average Score</div>
                <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">0</div>
                <div className="text-muted-foreground">Practice Hours</div>
                <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
              </div>
            </GlassCard>
          </div>

          {/* Recent Activity */}
          <GlassCard className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Activity
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Welcome to InterviewMind!</p>
                  <p className="text-sm text-muted-foreground">
                    Account created • {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">Demo Interview Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Senior Software Engineer position • Coming Soon: Real interviews
                  </p>
                </div>
                <Badge variant="outline">Demo</Badge>
              </div>
            </div>
          </GlassCard>

          {/* Coming Soon Features */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                <h4 className="font-medium mb-2">📊 Detailed Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Track your progress with comprehensive interview analytics and performance insights.
                </p>
              </div>

              <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Personalized Coaching</h4>
                <p className="text-sm text-muted-foreground">
                  Get AI-powered feedback and coaching tips tailored to your interview performance.
                </p>
              </div>

              <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                <h4 className="font-medium mb-2">📈 Skill Development</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on specific areas for improvement with targeted practice sessions.
                </p>
              </div>

              <div className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                <h4 className="font-medium mb-2">🏆 Achievement System</h4>
                <p className="text-sm text-muted-foreground">
                  Unlock badges and track milestones as you improve your interview skills.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
      <Footer />
    </div>
  );
}