import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { GlassCard } from "~/components/GlassCard";
import { useToast } from "~/hooks/use-toast";
import { Loader2, Mic } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        throw new Error("No account found. Please sign up first.");
      }
      const user = JSON.parse(storedUser);
      
      if (user.email !== email) {
        throw new Error("Invalid email or password.");
      }
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold mb-4">
            <Mic className="h-8 w-8 text-accent" />
            <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              VoiceMock
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your practice
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleAuth} className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background/50 border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className="bg-background/50 border-border"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-linear-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="text-accent hover:underline"
              disabled={loading}
            >
              Don't have an account? Sign up
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default Login;