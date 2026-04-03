import { useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useAnimation, useInView } from 'framer-motion'
import {
  PlayCircle,
  BookOpen,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Clock,
  Youtube,
  LayoutDashboard,
  ListVideo,
  CheckSquare,
  BrainCircuit,
  Play,
  MoreVertical,
  ThumbsUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: <ListVideo className="w-6 h-6 text-primary" />,
    title: 'Organize Playlists',
    description:
      'Import YouTube playlists and keep all your learning material in one structured place.',
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-primary" />,
    title: 'Track Progress',
    description:
      'Mark videos as watched and monitor how much you have learned over time with visual charts.',
  },
  {
    icon: <Target className="w-6 h-6 text-primary" />,
    title: 'Set Goals',
    description:
      'Define learning goals and stay on track with weekly progress insights and reminders.',
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-primary" />,
    title: 'AI Summaries',
    description:
      'Get concise AI-generated summaries for any video in your library — save hours of re-watching.',
  },
]

const benefits = [
  'Import any public YouTube playlist instantly',
  'Visual progress tracking with charts',
  'Set and monitor weekly learning goals',
  'AI-powered video summaries',
  'Bookmarks and personal notes',
  'Clean, distraction-free dashboard',
]

const statsData = [
  { label: 'Playlists imported', value: '12K+', icon: <Youtube className="w-5 h-5" /> },
  { label: 'Hours tracked', value: '280K+', icon: <Clock className="w-5 h-5" /> },
  { label: 'Goals completed', value: '45K+', icon: <CheckSquare className="w-5 h-5" /> },
  { label: 'Summaries generated', value: '98K+', icon: <BrainCircuit className="w-5 h-5" /> },
]

// Animated section wrapper
function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const controls = useAnimation()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [inView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 32 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Mock dashboard preview card
function DashboardPreview() {
  const mockVideos = [
    { title: 'React Hooks Deep Dive', channel: 'Fireship', progress: 100, likes: '48K' },
    { title: 'TypeScript in 100 Seconds', channel: 'Fireship', progress: 60, likes: '32K' },
    { title: 'CSS Grid Crash Course', channel: 'Traversy Media', progress: 0, likes: '21K' },
  ]

  return (
    <div className="rounded-2xl border bg-card shadow-xl overflow-hidden text-left w-full max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
        <LayoutDashboard className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">My Dashboard</span>
        <div className="ml-auto flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Playlist label */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <ListVideo className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          React Mastery Course
        </span>
        <span className="ml-auto text-xs text-muted-foreground">3 videos</span>
      </div>

      {/* Video rows */}
      <div className="px-4 pb-4 space-y-2">
        {mockVideos.map((v) => (
          <div
            key={v.title}
            className="flex items-center gap-3 rounded-xl border bg-background p-3"
          >
            <div className="relative w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-primary fill-primary" />
              {v.progress === 100 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{v.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${v.progress}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {v.progress}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <ThumbsUp className="w-3 h-3" />
              {v.likes}
            </div>
            <MoreVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

const Welcome = () => {
  const navigate = useNavigate()
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-accent/20 to-primary/5">
      {/* Sticky Navbar */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full transition-all duration-300 ${
          hasScrolled ? 'backdrop-blur-md bg-background/80 border-b shadow-sm' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">YT Learning Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-6 pt-16 pb-24 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Your personal YouTube learning hub
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Learn smarter from{' '}
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              YouTube
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10">
            Import playlists, track what you've watched, set goals, and get AI-powered summaries —
            all in one clean dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" className="w-full sm:w-auto px-8 gap-2" asChild>
              <Link to="/signup">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto px-8" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <AnimatedSection delay={0.15} className="w-full">
          <DashboardPreview />
        </AnimatedSection>

        {/* Stats row */}
        <AnimatedSection delay={0.05} className="w-full mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsData.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border bg-card/70 backdrop-blur-sm p-5 text-center shadow-sm"
              >
                <div className="flex items-center justify-center gap-1.5 text-primary mb-2">
                  {s.icon}
                </div>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Feature cards */}
        <AnimatedSection className="w-full mt-24">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A focused set of tools built specifically for learners who use YouTube as their
              classroom.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-2xl border bg-card/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="mb-4 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Benefits list */}
        <AnimatedSection className="w-full mt-24">
          <div className="rounded-2xl border bg-card/70 backdrop-blur-sm p-8 sm:p-12 flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-4">
                <TrendingUp className="w-4 h-4" /> Why learners love it
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-snug max-w-xs">
                Built for focused, intentional learning
              </h2>
              <p className="text-muted-foreground mb-6">
                Stop losing track of where you left off. YT Learning Manager gives you the
                structure to turn passive watching into real progress.
              </p>
              <Button asChild className="gap-2">
                <Link to="/signup">
                  Get started free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {b}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection className="w-full mt-24 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-12">
            <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Ready to level up your learning?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of learners who use YT Learning Manager to stay organised and make the
              most of YouTube's vast library.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 px-10" asChild>
                <Link to="/signup">
                  Create free account <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-10" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t">
        <div className="flex justify-center gap-6">
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link to="/terms" className="hover:underline">
            Terms
          </Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} YT Learning Manager</p>
      </footer>
    </div>
  )
}

export default Welcome
