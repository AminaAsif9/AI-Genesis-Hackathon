import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { useToast } from "~/hooks/use-toast";
import { DownloadIcon } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export default function InterviewResults() {
  const { id } = useParams();
  const [interview, setInterview] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock interview data - single demo entry
  const mockInterview = {
    job_title: 'Senior Software Engineer [Demo Result]',
    scores: [
      { skill: "Communication", score: 85 },
      { skill: "Technical", score: 78 },
      { skill: "Behavioral", score: 82 },
      { skill: "Confidence", score: 90 },
    ],
    feedback: "Great performance! Your technical answers were strong, but there's room for improvement in behavioral questions."
  };

  const isMockData = !id;
  const currentInterview = mockInterview; // Always show demo data for now

  useEffect(() => {
    setInterview(currentInterview);
  }, [id]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-center">Interview Results</h1>
            {isMockData && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Demo Data
              </span>
            )}
          </div>
          
          <GlassCard className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{interview?.job_title}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={interview?.scores || currentInterview.scores}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" stroke="hsl(var(--foreground))" />
                <Radar dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Feedback</h3>
            <p className="text-muted-foreground">{interview?.feedback || currentInterview.feedback}</p>
            {isMockData && (
              <p className="text-sm text-yellow-600 mt-2 italic">
                💡 This is demo feedback. Complete a real interview to get personalized AI-generated feedback.
              </p>
            )}
          </GlassCard>

          <div className="flex gap-4">
            <GradientButton gradient="accent" onClick={() => navigate("/interview/setup")} className="flex-1">
              Try Another Interview
            </GradientButton>
            <GradientButton
              gradient="primary"
              onClick={() => {
                toast({
                  title: "Report Download Coming Soon",
                  description: "PDF report generation and download features are under development. Check back soon!",
                  duration: 5000,
                });
              }}
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Report
            </GradientButton>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
