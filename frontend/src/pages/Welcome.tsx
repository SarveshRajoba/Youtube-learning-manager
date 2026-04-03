import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayCircle, BookOpen, Target, TrendingUp, Sparkles } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="w-6 h-6 text-primary" />,
    title: "Organize Playlists",
    description: "Import YouTube playlists and keep all your learning material in one place.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-primary" />,
    title: "Track Progress",
    description: "Mark videos as watched and monitor how much you have learned over time.",
  },
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: "Set Goals",
    description: "Define learning goals and stay on track with weekly progress insights.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    title: "AI Summaries",
    description: "Get concise AI-generated summaries for any video in your library.",
  },
];

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-accent/20 to-primary/5">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">YT Learning Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Your personal YouTube learning hub
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
          Learn smarter from{" "}
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            YouTube
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10">
          Import playlists, track what you've watched, set goals, and get AI-powered summaries — all in one clean dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto px-8">
              Start for free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
              Sign in
            </Button>
          </Link>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t">
        <div className="flex justify-center gap-6">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} YT Learning Manager</p>
      </footer>
    </div>
  );
};

export default Welcome;
