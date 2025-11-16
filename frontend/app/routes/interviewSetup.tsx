import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useInterviewStore } from "~/store/useInterviewStore";
import { useToast } from "~/hooks/use-toast";
import { Briefcase, Loader2 } from "lucide-react";
import { apiClient } from "~/lib/api";

export default function InterviewSetup() {
  const [user, setUser] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    jobTitle,
    jobDescription,
    seniorityLevel,
    difficultyLevel,
    resumeId,
    setJobTitle,
    setJobDescription,
    setSeniorityLevel,
    setDifficultyLevel,
    setQuestions,
  } = useInterviewStore();

  useEffect(() => {
    const checkAuth = async () => {
      const session = true;
      if (!session) {
        navigate("/auth/login");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  const handleStartInterview = async () => {
    if (!jobTitle || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }

    if (!resumeId) {
      toast({
        title: "Resume required",
        description: "Please upload your resume first",
      });
      navigate("/resume");
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: "Generating questions...",
        description: "AI is creating personalized interview questions based on your resume",
      });

      const response = await apiClient.generateQuestions(resumeId, jobTitle, 5);
      setQuestions(response.questions);

      toast({
        title: "Interview starting!",
        description: "Questions generated successfully. Starting your interview session...",
      });

      // Navigate to live interview
      navigate(`/interview/live/${Date.now()}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Briefcase className="h-16 w-16 text-accent mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Set Up Your Interview
            </h1>
            <p className="text-xl text-muted-foreground">
              Customize your practice session to match your target role
            </p>
          </div>

          <GlassCard>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description *</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description or key requirements here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="bg-background/50 border-border resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority Level</Label>
                  <Select value={seniorityLevel} onValueChange={setSeniorityLevel}>
                    <SelectTrigger id="seniority" className="bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-glass-border">
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead / Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                    <SelectTrigger id="difficulty" className="bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-glass-border">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-6">
                <GradientButton
                  gradient="accent"
                  size="lg"
                  onClick={handleStartInterview}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Start Voice Interview
                    </>
                  )}
                </GradientButton>
              </div>
            </div>
          </GlassCard>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              The interview will use voice AI to simulate a real conversation
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
