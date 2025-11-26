import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import VideoDetail from "./pages/VideoDetail";
import Progress from "./pages/Progress";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Summaries from "./pages/Summaries";
import NotFound from "./pages/NotFound";
import OAuthCallback from "./pages/OAuthCallback";
import OAuthFailure from "./pages/OAuthFailure";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/playlists/:id" element={<PlaylistDetail />} />
            <Route path="/videos/:id" element={<VideoDetail />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/summaries" element={<Summaries />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/failure" element={<OAuthFailure />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
