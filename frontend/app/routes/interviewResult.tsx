import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { TrendingUp, Download } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

export default function InterviewResults() {
  const { id } = useParams();
  const [interview, setInterview] = useState<any>(null);
  const navigate = useNavigate();

  const mockScores = [
    { skill: "Communication", score: 85 },
    { skill: "Technical", score: 78 },
    { skill: "Behavioral", score: 82 },
    { skill: "Confidence", score: 90 },
  ];

  useEffect(() => {
    
  }, [id]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Interview Results</h1>
          
          <GlassCard className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{interview?.job_title}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={mockScores}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" stroke="hsl(var(--foreground))" />
                <Radar dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Feedback</h3>
            <p className="text-muted-foreground">Great performance! Keep practicing to improve further.</p>
          </GlassCard>

          <div className="flex gap-4">
            <GradientButton gradient="accent" onClick={() => navigate("/interview/setup")} className="flex-1">
              Try Another Interview
            </GradientButton>
            <GradientButton gradient="primary">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </GradientButton>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
