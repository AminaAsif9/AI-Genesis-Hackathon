import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { VoiceWaveAnimation } from "~/components/VoiceWaveAnimation";
import { LoadingDots } from "~/components/LoadingDots";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";

export default function InterviewLive() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
    const session = true;
      if (!session) {
        navigate("/auth");
        return;
      }
    };
    checkAuth();
  }, [id, navigate]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording started",
        description: "Speak your answer clearly",
      });
    }
  };

  const handleEndInterview = async () => {
    if (!interview) return;

    try {
      

      toast({
        title: "Interview ended",
        description: "Generating your results...",
      });

      navigate(`/interview/results/${interview.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
              {interview?.job_title} Interview
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

            {/* Current Question */}
            <div className="mb-8">
              <GlassCard className="max-w-2xl mx-auto">
                <h3 className="text-sm text-muted-foreground mb-2">Current Question:</h3>
                <p className="text-lg">{currentQuestion || <LoadingDots />}</p>
              </GlassCard>
            </div>

            {/* Microphone Button */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                size="lg"
                onClick={toggleRecording}
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
