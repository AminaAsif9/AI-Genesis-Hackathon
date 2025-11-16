import { Link } from "react-router-dom";
import { Mic } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="glass-card border-t border-glass-border/50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <Mic className="h-5 w-5 text-accent" />
              <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                VoiceMock
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              AI-powered voice interview practice to help you ace your next job interview.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link to="/resume" className="hover:text-foreground transition-colors">Upload Resume</Link></li>
              <li><Link to="/interview/setup" className="hover:text-foreground transition-colors">Start Interview</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-glass-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VoiceMock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
