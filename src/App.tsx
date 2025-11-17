import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Experience from "./pages/Experience";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";
import Certifications from "./pages/Certifications";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Gallery from "./pages/Gallery";
import Vault from "./pages/Vault";
import ResumeBuilder from "./pages/ResumeBuilder";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ProfileAdmin from "./pages/admin/Profile";
import Themes from "./pages/admin/Themes";
import AdminProjects from "./pages/admin/Projects";
import ExperienceAdmin from "./pages/admin/ExperienceAdmin";
import SkillsAdmin from "./pages/admin/SkillsAdmin";
import CertificationsAdmin from "./pages/admin/CertificationsAdmin";
import AchievementsAdmin from "./pages/admin/AchievementsAdmin";
import EducationAdmin from "./pages/admin/EducationAdmin";
import BlogAdmin from "./pages/admin/BlogAdmin";
import GalleryAdmin from "./pages/admin/GalleryAdmin";
import VaultAdmin from "./pages/admin/VaultAdmin";
import AISettings from "./pages/admin/AISettings";
import AutomationSettings from "./pages/admin/AutomationSettings";
import NotFound from "./pages/NotFound";
import AIChatWidget from "./components/SmartSearchWidget";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
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
        <AIChatWidget />
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
