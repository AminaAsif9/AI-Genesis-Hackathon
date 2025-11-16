import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { Progress } from "~/components/ui/progress";
import { useInterviewStore } from "~/store/useInterviewStore";
import { apiClient } from "~/lib/api";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function Resume() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summary, setSummary] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setResumeId, setResumeUploaded } = useInterviewStore();

  useEffect(() => {
    const checkAuth = async () => {
      const session = true;
      if (!session) {
        navigate("/auth/login");
        return;
      }
      //setUser(session.user);
    };
    checkAuth();
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || 
          selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name and select a file",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      setUploadProgress(50);
      const response = await apiClient.uploadResume(name.trim(), file);
      setUploadProgress(100);

      setSummary(`Resume successfully uploaded! ${response.chunks_stored} chunks stored. You can now start practicing interviews.`);
      setResumeId(name.trim());
      setResumeUploaded(true);

      toast({
        title: "Success!",
        description: "Your resume has been uploaded and processed successfully.",
      });

      setTimeout(() => {
        navigate("/interview/setup");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Upload Your Résumé
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Help us personalize your interview questions based on your experience
          </p>

          <GlassCard>
            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50 border-border"
                />
              </div>
            </div>

            {!file ? (
              <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Drop your resume here
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse (PDF or DOCX)
                </p>
                <label htmlFor="file-upload">
                  <GradientButton gradient="accent" asChild>
                    <span className="cursor-pointer">
                      Select File
                    </span>
                  </GradientButton>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl">
                  <FileText className="h-12 w-12 text-accent" />
                  <div className="flex-1">
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadProgress === 100 && (
                    <CheckCircle className="h-8 w-8 text-accent" />
                  )}
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {summary && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl">
                    <p className="text-sm">{summary}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <GradientButton
                    gradient="accent"
                    onClick={handleUpload}
                    disabled={uploading || uploadProgress === 100}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : uploadProgress === 100 ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Uploaded
                      </>
                    ) : (
                      "Upload Resume"
                    )}
                  </GradientButton>
                  {!uploading && uploadProgress !== 100 && (
                    <GradientButton
                      gradient="primary"
                      onClick={() => {
                        setFile(null);
                        setSummary("");
                      }}
                    >
                      Cancel
                    </GradientButton>
                  )}
                </div>
              </div>
            )}
          </GlassCard>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Your resume is processed securely and used only to generate personalized interview questions
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
