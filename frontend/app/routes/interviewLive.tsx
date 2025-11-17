import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { VoiceWaveAnimation } from "~/components/VoiceWaveAnimation";
import { LoadingDots } from "~/components/LoadingDots";
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useInterviewStore } from "~/store/useInterviewStore";
import { apiClient } from "~/lib/api";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAnswer, setManualAnswer] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [microphone, setMicrophone] = useState<MediaStreamAudioSourceNode | null>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [recordingTimeout, setRecordingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<SpeechSynthesisUtterance | null>(null);

  // Use React Speech Recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Browser support checks
  const browserSupportsSpeechSynthesis = 'speechSynthesis' in window;

  // Volume monitoring functions
  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const analyserNode = audioCtx.createAnalyser();
      const microphoneNode = audioCtx.createMediaStreamSource(stream);

      analyserNode.fftSize = 256;
      microphoneNode.connect(analyserNode);

      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setMicrophone(microphoneNode);

      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

      const updateVolume = () => {
        if (analyserNode) {
          analyserNode.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolumeLevel(Math.min(average / 128, 1)); // Normalize to 0-1
          setAnimationFrame(requestAnimationFrame(updateVolume));
        }
      };

      updateVolume();
    } catch (error) {
      console.error('Error starting volume monitoring:', error);
    }
  };

  const stopVolumeMonitoring = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
    if (microphone) {
      microphone.disconnect();
      setMicrophone(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setAnalyser(null);
    setVolumeLevel(0);
  };

  // Check browser support on mount
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome, Edge, or Safari. Use text input instead.",
      });
      setShowManualInput(true);
    } else if (!isMicrophoneAvailable) {
      toast({
        title: "Microphone Not Available",
        description: "Please check your microphone permissions and try again.",
      });
      setShowManualInput(true);
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  const submitVoiceAnswer = async (voiceTranscript?: string) => {
    const finalTranscript = voiceTranscript || transcript;
    if (!sessionId || !finalTranscript.trim()) return;
    
    try {
      setIsProcessing(true);
      const answerResponse = await apiClient.submitAnswer(sessionId, transcript);
      
      toast({
        title: "Answer Recorded",
        description: `Question ${answerResponse.question_index + 1} completed`,
      });

      if (answerResponse.is_complete) {
        // Interview complete - analyze and then navigate
        setInterviewComplete(true);
        toast({
          title: "Interview Complete",
          description: "Generating your personalized results with AI analysis...",
          duration: 3000,
        });

        try {
          // Analyze the interview
          await apiClient.analyzeInterview(sessionId);
          
          toast({
            title: "Results Ready!",
            description: "Your interview analysis is complete.",
          });

          // Navigate to results
          navigate(`/interview/result/${sessionId}`);
        } catch (analyzeError: any) {
          toast({
            title: "Analysis Error",
            description: "Results generated but analysis may be incomplete.",
          });
          // Still navigate to results even if analysis fails
          navigate(`/interview/result/${sessionId}`);
        }
      } else {
        // Move to next question
        goToNextQuestion();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
    const startInterviewSession = async () => {
      if (questions.length > 0 && !sessionId) {
        try {
          const response = await apiClient.startInterview(jobTitle, questions);
          setSessionId(response.session_id);
          setCurrentQuestion(questions[0]);
          setCurrentQuestionIndex(0);
          setStartTime(new Date());
          toast({
            title: "Interview Started",
            description: "Your interview session has begun. Answer each question clearly.",
          });
          
          // Speak the first question
          speakQuestion(questions[0]);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to start interview session",
          });
          navigate("/interview/setup");
        }
      }
    };

    startInterviewSession();
  }, [questions, sessionId, jobTitle, navigate, toast]);

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

  const speakQuestion = async (question: string) => {
    if (!question.trim()) return;

    if (!browserSupportsSpeechSynthesis) {
      toast({
        title: "TTS Not Supported",
        description: "Your browser doesn't support text-to-speech. Please read the question text.",
      });
      return;
    }

    try {
      setIsLoadingTTS(true);

      // Stop any currently playing TTS
      if (currentAudio) {
        speechSynthesis.cancel();
        setCurrentAudio(null);
      }

      // Use browser's built-in Web Speech API for TTS
      const utterance = new SpeechSynthesisUtterance(question);

      // Configure voice settings for better quality
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 0.8; // Good volume level

      // Try to use a high-quality voice if available
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex') ||
        voice.lang.startsWith('en-')
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        toast({
          title: "TTS Error",
          description: "Failed to play question audio. Please read the text.",
        });
      };

      // Store reference for stopping
      setCurrentAudio(utterance as any);

      speechSynthesis.speak(utterance);
    } catch (error: any) {
      console.error('TTS failed:', error);
      setIsSpeaking(false);
      toast({
        title: "TTS Error",
        description: "Failed to generate speech. Please read the question text.",
      });
    } finally {
      setIsLoadingTTS(false);
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      speechSynthesis.cancel();
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      setCurrentQuestion(nextQuestion);
      setCurrentQuestionIndex(nextIndex);
      setShowManualInput(false);
      setManualAnswer("");
      
      toast({
        title: "Next Question",
        description: `Question ${nextIndex + 1} of ${questions.length}`,
      });
      
      // Speak the question
      speakQuestion(nextQuestion);
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

  const toggleRecording = async () => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome, Edge, or Safari. Use text input instead.",
      });
      setShowManualInput(true);
      return;
    }

    if (listening) {
      // Stop listening and submit if we have transcript
      SpeechRecognition.stopListening();
      stopVolumeMonitoring();
      
      // Clear any existing timeout
      if (recordingTimeout) {
        clearTimeout(recordingTimeout);
        setRecordingTimeout(null);
      }
      setTimeLeft(30); // Reset timer
      
      if (transcript.trim()) {
        toast({
          title: "Speech detected!",
          description: `"${transcript.trim()}" - Submitting answer...`,
        });
        submitVoiceAnswer(transcript.trim());
      } else {
        toast({
          title: "No speech detected",
          description: "Please try again or use text input.",
        });
        setShowManualInput(true);
      }
    } else {
      // Start listening
      resetTranscript();
      setTimeLeft(30); // Reset timer display
      await startVolumeMonitoring();
      SpeechRecognition.startListening({
        continuous: true,  // Keep listening even after speech ends
        language: 'en-US'
      });

      // Start countdown timer
      const timeout = setTimeout(() => {
        if (listening) {
          SpeechRecognition.stopListening();
          stopVolumeMonitoring();
          setRecordingTimeout(null);
          setTimeLeft(30); // Reset for next time
          
          if (transcript.trim()) {
            toast({
              title: "Auto-submitted",
              description: `"${transcript.trim()}" - Answer submitted after 30 seconds`,
            });
            submitVoiceAnswer(transcript.trim());
          } else {
            toast({
              title: "Timeout - No speech detected",
              description: "Please try again or use text input.",
            });
            setShowManualInput(true);
          }
        }
      }, 30000); // 30 seconds timeout
      
      setRecordingTimeout(timeout);

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const submitManualAnswer = async () => {
    if (!manualAnswer.trim() || !sessionId) return;
    
    try {
      setIsProcessing(true);
      const answerResponse = await apiClient.submitAnswer(sessionId, manualAnswer.trim());
      
      toast({
        title: "Answer Recorded",
        description: `Question ${answerResponse.question_index + 1} completed`,
      });
      
      if (answerResponse.is_complete) {
        // Interview complete - analyze and then navigate
        setInterviewComplete(true);
        toast({
          title: "Interview Complete",
          description: "Generating your personalized results with AI analysis...",
          duration: 3000,
        });

        try {
          // Analyze the interview
          await apiClient.analyzeInterview(sessionId);
          
          toast({
            title: "Results Ready!",
            description: "Your interview analysis is complete.",
          });

          // Navigate to results
          navigate(`/interview/result/${sessionId}`);
        } catch (analyzeError: any) {
          toast({
            title: "Analysis Error",
            description: "Results generated but analysis may be incomplete.",
          });
          // Still navigate to results even if analysis fails
          navigate(`/interview/result/${sessionId}`);
        }
      } else {
        // Move to next question
        goToNextQuestion();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active interview session",
      });
      return;
    }

    try {
      setIsProcessing(true);
      toast({
        title: "Generating Results",
        description: "Creating your personalized analysis...",
        duration: 3000,
      });

      // Analysis should already be complete from natural interview completion
      // No need to call analyzeInterview again

      toast({
        title: "Results Ready!",
        description: "Your interview analysis is complete.",
      });

      navigate(`/interview/result/${sessionId}`);
    } catch (error: any) {
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to generate results",
      });
    } finally {
      setIsProcessing(false);
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
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm text-muted-foreground">Current Question:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isSpeaking) {
                        stopSpeaking();
                      } else if (currentQuestion) {
                        speakQuestion(currentQuestion);
                      }
                    }}
                    disabled={!currentQuestion || isLoadingTTS || !browserSupportsSpeechSynthesis}
                    className="h-8 w-8 p-0"
                    aria-label={isSpeaking ? "Stop speaking" : "Speak question"}
                  >
                    {isLoadingTTS ? (
                      <LoadingDots />
                    ) : isSpeaking ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-lg">{currentQuestion || <LoadingDots />}</p>
              </GlassCard>
            </div>

            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={toggleRecording}
                  disabled={isProcessing}
                  aria-label={listening ? "Stop voice recognition" : "Start voice recognition"}
                  className={`rounded-full w-20 h-20 transition-all duration-300 ${
                    listening
                      ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                      : "bg-linear-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                  }`}
                >
                  {isProcessing ? (
                    <LoadingDots />
                  ) : listening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>

              {/* Volume Meter - Only show when listening */}
              {listening && (
                <div className="w-full max-w-xs mx-auto">
                  <GlassCard className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Listening...</span>
                    </div>

                    {/* Volume Bars */}
                    <div className="flex items-end justify-center gap-1 h-12 mb-2">
                      {Array.from({ length: 10 }, (_, i) => {
                        const barHeight = volumeLevel > i * 0.1 ? Math.max(0.1, volumeLevel * 100) : 4;
                        const isActive = volumeLevel > i * 0.1;
                        return (
                          <div
                            key={i}
                            className={`w-2 rounded-t transition-all duration-150 ${
                              isActive
                                ? volumeLevel > 0.7
                                  ? "bg-red-500"
                                  : volumeLevel > 0.4
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-gray-300"
                            }`}
                            style={{
                              height: `${barHeight}%`,
                              minHeight: "4px"
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Volume Level Text */}
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">
                        Volume: {Math.round(volumeLevel * 100)}%
                      </span>
                    </div>

                    {/* Countdown Timer */}
                    <div className="text-center mt-2">
                      <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                        }`}></div>
                        <span className={`text-xs font-medium ${
                          timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {timeLeft}s remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-1000 ${
                            timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${(timeLeft / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Speech Detection Indicator */}
                    {transcript && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-700">Speech detected</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1 italic">"{transcript}"</p>
                      </div>
                    )}
                  </GlassCard>
                </div>
              )}

              {/* Manual Stop Button - Only show when listening */}
              {listening && (
                <div className="w-full max-w-xs mx-auto mb-4">
                  <Button
                    onClick={toggleRecording}
                    variant="outline"
                    size="sm"
                    className="w-full text-sm"
                  >
                    Stop & Submit Answer Early
                  </Button>
                </div>
              )}

              {/* Manual Input Toggle Button */}
              <GradientButton
                gradient="secondary"
                onClick={() => {
                  setShowManualInput(!showManualInput);
                  if (!showManualInput) {
                    setManualAnswer("");
                  }
                }}
                disabled={isRecording || isProcessing}
                aria-label="Toggle manual answer input"
                className="px-6"
              >
                {showManualInput ? "Hide Text Input" : "Type Answer"}
              </GradientButton>
            </div>

            {/* Manual Input - Show when toggled or when STT fails */}
            {listening && (
              <div className="w-full max-w-xs mx-auto mb-4">
                <Button
                  onClick={toggleRecording}
                  variant="outline"
                  size="sm"
                  className="w-full text-sm"
                >
                  Stop & Submit Answer Early
                </Button>
              </div>
            )}

            {/* Manual Input - Show when toggled or when STT fails */}
            {showManualInput && (
              <div className="w-full max-w-md mx-auto mb-4">
                <GlassCard>
                  <h4 className="text-sm font-semibold mb-2">Type your answer:</h4>
                  <textarea
                    value={manualAnswer}
                    onChange={(e) => setManualAnswer(e.target.value)}
                    placeholder="Enter your answer here..."
                    className="w-full p-3 border border-border rounded-md bg-background text-foreground resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={submitManualAnswer}
                      disabled={!manualAnswer.trim() || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? <LoadingDots /> : "Submit Answer"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowManualInput(false);
                        setManualAnswer("");
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                  </div>
                </GlassCard>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-4">
              {isProcessing ? "Processing your answer..." : listening ? "Listening for your answer..." : "Click the microphone to speak or use text input below"}
            </p>

            {/* End Interview Button - Only show when interview is complete */}
            {interviewComplete && (
              <GradientButton
                gradient="primary"
                onClick={handleEndInterview}
                disabled={isRecording || isProcessing}
                className="mt-4"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Interview
              </GradientButton>
            )}
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
