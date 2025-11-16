import type { Route } from "./+types/home";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "~/components/Navbar";
import { Footer } from "~/components/Footer";
import { GlassCard } from "~/components/GlassCard";
import { GradientButton } from "~/components/GradientButton";
import { Mic, Brain, Target, TrendingUp, CheckCircle } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const Home = () => {
  const features = [
    {
      icon: Mic,
      title: "Voice Interview Simulation",
      description: "Practice with AI-powered voice interviews that feel like the real thing",
    },
    {
      icon: Brain,
      title: "Resume-Aware Questions",
      description: "Get personalized questions based on your actual resume and experience",
    },
    {
      icon: Target,
      title: "Job-Tailored Assessment",
      description: "Customize difficulty and focus areas for your target position",
    },
    {
      icon: TrendingUp,
      title: "AI-Generated Feedback",
      description: "Receive detailed feedback and improvement suggestions after each session",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Ace Any Interview
              </span>
              <br />
              With AI-Powered Voice Practice
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Upload your résumé, choose a job, and train with a smart voice interviewer powered by advanced AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientButton size="lg" gradient="accent" asChild>
                <Link to="/auth/register">
                  Start for Free
                </Link>
              </GradientButton>
              <GradientButton size="lg" gradient="primary" asChild>
                <Link to="/auth/login">
                  Sign In
                </Link>
              </GradientButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20"
          >
            <GlassCard className="max-w-4xl mx-auto p-12">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-r from-accent to-primary blur-3xl opacity-30 rounded-full" />
                  <Mic className="h-32 w-32 text-accent relative" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Everything You Need to Succeed
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard hover className="h-full">
                  <feature.icon className="h-12 w-12 text-accent mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <GlassCard className="max-w-4xl mx-auto text-center p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Interview Skills?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who have improved their interview performance
            </p>
            <GradientButton size="lg" gradient="accent" asChild>
              <Link to="/auth/register">
                Get Started Now
              </Link>
            </GradientButton>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
