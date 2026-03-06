import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import ScrollToTop from "./components/ScrollToTop";
import CursorGlow from "./components/CursorGlow";
import AIGreeting from "./components/AIGreeting";

const About = lazy(() => import("./pages/About"));
const Experience = lazy(() => import("./pages/Experience"));
const Projects = lazy(() => import("./pages/Projects"));
const Skills = lazy(() => import("./pages/Skills"));
const Certifications = lazy(() => import("./pages/Certifications"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Vault = lazy(() => import("./pages/Vault"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Login = lazy(() => import("./pages/admin/Login"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProfileAdmin = lazy(() => import("./pages/admin/Profile"));
const Themes = lazy(() => import("./pages/admin/Themes"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const ExperienceAdmin = lazy(() => import("./pages/admin/ExperienceAdmin"));
const SkillsAdmin = lazy(() => import("./pages/admin/SkillsAdmin"));
const CertificationsAdmin = lazy(() => import("./pages/admin/CertificationsAdmin"));
const AchievementsAdmin = lazy(() => import("./pages/admin/AchievementsAdmin"));
const EducationAdmin = lazy(() => import("./pages/admin/EducationAdmin"));
const BlogAdmin = lazy(() => import("./pages/admin/BlogAdmin"));
const GalleryAdmin = lazy(() => import("./pages/admin/GalleryAdmin"));
const VaultAdmin = lazy(() => import("./pages/admin/VaultAdmin"));
const AISettings = lazy(() => import("./pages/admin/AISettings"));
const AutomationSettings = lazy(() => import("./pages/admin/AutomationSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AIChatWidget = lazy(() => import("./components/SmartSearchWidget"));

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary/15 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground/50 animate-pulse">Loading...</p>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />

            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute><ProfileAdmin /></ProtectedRoute>} />
            <Route path="/admin/themes" element={<ProtectedRoute><Themes /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute><AdminProjects /></ProtectedRoute>} />
            <Route path="/admin/experience" element={<ProtectedRoute><ExperienceAdmin /></ProtectedRoute>} />
            <Route path="/admin/skills" element={<ProtectedRoute><SkillsAdmin /></ProtectedRoute>} />
            <Route path="/admin/certifications" element={<ProtectedRoute><CertificationsAdmin /></ProtectedRoute>} />
            <Route path="/admin/achievements" element={<ProtectedRoute><AchievementsAdmin /></ProtectedRoute>} />
            <Route path="/admin/education" element={<ProtectedRoute><EducationAdmin /></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute><BlogAdmin /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute><GalleryAdmin /></ProtectedRoute>} />
            <Route path="/admin/vault" element={<ProtectedRoute><VaultAdmin /></ProtectedRoute>} />
            <Route path="/admin/ai-settings" element={<ProtectedRoute><AISettings /></ProtectedRoute>} />
            <Route path="/admin/automation" element={<ProtectedRoute><AutomationSettings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CursorGlow />
        <ScrollToTop />
        <Navigation />
        <AnimatedRoutes />
        <Suspense fallback={null}>
          <AIChatWidget />
          <AIGreeting />
        </Suspense>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
