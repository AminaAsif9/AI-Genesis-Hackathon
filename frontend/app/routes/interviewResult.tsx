import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { useToast } from "~/hooks/use-toast";
import { DownloadIcon } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { apiClient } from "~/lib/api";

export default function InterviewResults() {
  const { id } = useParams();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadInterviewResults = async () => {
      if (!id) {
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getInterviewResults(id);
        setInterview(response.interview);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load interview results",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadInterviewResults();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Interview results not found.</p>
          <GradientButton gradient="primary" onClick={() => navigate("/dashboard")} className="mt-4">
            Go to Dashboard
          </GradientButton>
        </div>
      </div>
    );
  }

  // Format scores for radar chart
  const radarData = interview ? [
    { skill: "Overall", score: interview.scores.overall },
    { skill: "Content", score: interview.scores.content },
    { skill: "Delivery", score: interview.scores.delivery },
    { skill: "Technical", score: interview.scores.technical },
    { skill: "Communication", score: interview.scores.communication },
  ] : [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-4xl font-bold text-center">Interview Results</h1>
          </div>
          
          <GlassCard className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{interview.job_title}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" stroke="hsl(var(--foreground))" />
                <Radar dataKey="score" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Detailed Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall:</span>
                  <span className="font-semibold">{interview.scores.overall}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Content:</span>
                  <span className="font-semibold">{interview.scores.content}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-semibold">{interview.scores.delivery}/10</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Technical:</span>
                  <span className="font-semibold">{interview.scores.technical}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Communication:</span>
                  <span className="font-semibold">{interview.scores.communication}/10</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Feedback</h3>
            <div className="space-y-2">
              {interview.feedback.map((item: string, index: number) => (
                <p key={index} className="text-muted-foreground">• {item}</p>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Your Answers</h3>
            <div className="space-y-4">
              {interview.questions_answers.map((qa: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Question {index + 1}:</h4>
                  <p className="text-muted-foreground mb-3">{qa.question}</p>
                  <h4 className="font-semibold mb-2">Your Answer:</h4>
                  <p className="text-muted-foreground">{qa.answer}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <div className="flex gap-4">
            <GradientButton gradient="accent" onClick={() => navigate("/interview/setup")} className="flex-1">
              Try Another Interview
            </GradientButton>
            <GradientButton
              gradient="primary"
              onClick={() => {
                // Simple data export - copy to clipboard
                const exportData = {
                  job_title: interview.job_title,
                  completed_at: interview.completed_at,
                  scores: interview.scores,
                  feedback: interview.feedback,
                  questions_answers: interview.questions_answers
                };
                
                navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
                toast({
                  title: "Data Exported",
                  description: "Interview data copied to clipboard",
                });
              }}
              className="flex-1"
            >
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export Data
            </GradientButton>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
