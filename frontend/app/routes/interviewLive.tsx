import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { VoiceWaveAnimation } from "~/components/VoiceWaveAnimation";
import { LoadingDots } from "~/components/LoadingDots";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useInterviewStore } from "~/store/useInterviewStore";

export default function InterviewLive() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { questions, jobTitle } = useInterviewStore();

  useEffect(() => {
    const checkAuth = async () => {
    const session = true;
      if (!session) {
        navigate("/auth/login");
        return;
      }
    };
    checkAuth();
  }, [id, navigate]);

  useEffect(() => {
    if (questions.length > 0 && !currentQuestion) {
      setCurrentQuestion(questions[0]);
      setCurrentQuestionIndex(0);
      setStartTime(new Date());
    }
  }, [questions, currentQuestion]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestion(questions[nextIndex]);
      setCurrentQuestionIndex(nextIndex);
      toast({
        title: "Next Question",
        description: `Question ${nextIndex + 1} of ${questions.length}`,
      });
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestion(questions[prevIndex]);
      setCurrentQuestionIndex(prevIndex);
      toast({
        title: "Previous Question",
        description: `Question ${prevIndex + 1} of ${questions.length}`,
      });
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording started",
        description: "Speak your answer clearly",
      });
    } else {
      toast({
        title: "Recording stopped",
        description: "Processing your answer...",
      });
      // Simulate processing delay
      setTimeout(() => {
        toast({
          title: "Answer recorded",
          description: "AI analysis coming soon!",
        });
      }, 1000);
    }
  };

  const handleEndInterview = async () => {
    try {
      toast({
        title: "Interview Completed",
        description: "Generating your personalized results with AI analysis...",
        duration: 3000,
      });

      // Simulate interview completion with mock data
      // In a real implementation, this would save to backend
      const mockInterviewId = Date.now().toString();

      // Add a small delay to show the processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Results Ready!",
        description: "Your interview analysis is complete.",
      });

      navigate(`/interview/result/${mockInterviewId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to complete interview. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Main Interview Card */}
        <GlassCard className="mb-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-8">
              {jobTitle} Interview
            </h2>

            {/* AI Avatar / Wave Animation */}
            <div className="mb-8">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 bg-linear-to-r from-accent to-primary blur-3xl opacity-30 rounded-full" />
                <div className="relative w-full h-full rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  <Mic className="h-20 w-20 text-white" />
                </div>
              </div>
              <VoiceWaveAnimation isActive={isSpeaking} />
            </div>

            {/* Progress Indicator */}
            <div className="mb-6 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')} elapsed
                  </div>
                </div>
              </div>
              <Progress
                value={((currentQuestionIndex + 1) / questions.length) * 100}
                className="h-2"
              />
            </div>

            {/* Question Navigation */}
            <div className="flex justify-center gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                aria-label={`Go to previous question (${currentQuestionIndex} of ${questions.length})`}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                aria-label={`Go to next question (${currentQuestionIndex + 2} of ${questions.length})`}
              >
                Next →
              </Button>
            </div>

            {/* Current Question */}
            <div className="mb-8">
              <GlassCard className="max-w-2xl mx-auto">
                <h3 className="text-sm text-muted-foreground mb-2">Current Question:</h3>
                <p className="text-lg">{currentQuestion || <LoadingDots />}</p>
              </GlassCard>
            </div>

            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={toggleRecording}
                  aria-label={isRecording ? "Stop recording" : "Start voice recording (coming soon)"}
                  className={`rounded-full w-20 h-20 ${
                    isRecording
                      ? "bg-destructive hover:bg-destructive/90"
                      : "bg-linear-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>

              {/* Simulate Answer Button */}
              <GradientButton
                gradient="secondary"
                onClick={() => {
                  toast({
                    title: "Answer Simulated",
                    description: "Your response has been recorded for demo purposes. AI analysis coming soon!",
                    duration: 3000,
                  });
                }}
                aria-label="Simulate answering the current question"
                className="px-6"
              >
                Simulate Answer
              </GradientButton>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {isRecording ? "Recording your answer..." : "Click the microphone to answer"}
            </p>

            {/* End Interview Button */}
            <GradientButton
              gradient="primary"
              onClick={handleEndInterview}
              className="mt-4"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End Interview
            </GradientButton>
          </div>
        </GlassCard>

        {/* Conversation History */}
        {conversation.length > 1 && (
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4">Conversation</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl ${
                    msg.role === "assistant"
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-accent/10 border border-accent/20"
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {msg.role === "assistant" ? "Interviewer" : "You"}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
