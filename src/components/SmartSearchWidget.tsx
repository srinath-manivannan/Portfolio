/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PortfolioData {
  projects: any[];
  experiences: any[];
  skills: any[];
  certifications: any[];
  profile: any;
}

export default function SmartRAGWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch ALL portfolio data once
  async function getPortfolioData(): Promise<PortfolioData> {
    try {
      const [projects, experiences, skills, certifications, profile] = await Promise.all([
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('experiences').select('*').order('display_order'),
        supabase.from('skills').select('*').order('display_order'),
        supabase.from('certifications').select('*').order('display_order'),
        supabase.from('profiles').select('*').limit(1).single(),
      ]);

      return {
        projects: projects.data || [],
        experiences: experiences.data || [],
        skills: skills.data || [],
        certifications: certifications.data || [],
        profile: profile.data || {},
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      return { projects: [], experiences: [], skills: [], certifications: [], profile: {} };
    }
  }

  // Smart question understanding (without AI API)
  function analyzeQuestion(question: string) {
    const q = question.toLowerCase();
    
    // Detect intent
    const intents = {
      projects: ['project', 'built', 'made', 'developed', 'created', 'work on'],
      experience: ['experience', 'worked', 'work at', 'job', 'company', 'role', 'position'],
      skills: ['skill', 'know', 'technology', 'tech', 'proficiency', 'good at', 'expert'],
      certifications: ['certificate', 'certification', 'certified', 'course', 'training'],
      about: ['who', 'about', 'introduce', 'tell me about', 'background'],
      contact: ['contact', 'reach', 'email', 'phone', 'location', 'hire'],
    };

    const detectedIntents = Object.entries(intents)
      .filter(([_, keywords]) => keywords.some(k => q.includes(k)))
      .map(([intent]) => intent);

    // Extract keywords (technologies, companies, etc.)
    const keywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['what', 'where', 'when', 'how', 'can', 'does', 'has', 'the', 'and', 'with', 'about'].includes(word));

    return { intents: detectedIntents, keywords };
  }

  // Generate natural response (RAG style - only portfolio data!)
  function generateRAGResponse(question: string, data: PortfolioData): string {
    const analysis = analyzeQuestion(question);
    const { intents, keywords } = analysis;

    // Search relevant data
    const relevantProjects = data.projects.filter(p =>
      keywords.some(k =>
        p.title?.toLowerCase().includes(k) ||
        p.description?.toLowerCase().includes(k) ||
        p.tech_stack?.some((t: string) => t.toLowerCase().includes(k)) ||
        p.category?.toLowerCase().includes(k)
      )
    );

    const relevantExperience = data.experiences.filter(e =>
      keywords.some(k =>
        e.company?.toLowerCase().includes(k) ||
        e.role?.toLowerCase().includes(k) ||
        e.description?.some((d: string) => d.toLowerCase().includes(k)) ||
        e.technologies?.some((t: string) => t.toLowerCase().includes(k))
      )
    );

    const relevantSkills = data.skills.filter(s =>
      keywords.some(k =>
        s.name?.toLowerCase().includes(k) ||
        s.category?.toLowerCase().includes(k)
      )
    );

    const relevantCerts = data.certifications.filter(c =>
      keywords.some(k =>
        c.title?.toLowerCase().includes(k) ||
        c.issuer?.toLowerCase().includes(k)
      )
    );

    // Generate contextual response based on intent and data
    let response = '';

    // About/Introduction intent
    if (intents.includes('about') || question.toLowerCase().includes('who')) {
      response = `Based on the portfolio, ${data.profile.name || 'Srinath Manivannan'} is ${data.profile.title || 'an AI Full-Stack Software Engineer'}.\n\n`;
      response += `${data.profile.bio?.substring(0, 200) || 'A skilled developer with expertise in MERN stack, Next.js, and AI integration.'}...\n\n`;
      
      if (data.experiences.length > 0) {
        response += `Currently working as ${data.experiences[0].role} at ${data.experiences[0].company}.\n\n`;
      }
      
      response += `Key expertise: ${data.skills.slice(0, 5).map((s: any) => s.name).join(', ')}.`;
      return response;
    }

    // Projects intent
    if (intents.includes('projects') || relevantProjects.length > 0) {
      if (relevantProjects.length === 0 && intents.includes('projects')) {
        response += `According to the portfolio, Srinath has worked on ${data.projects.length} projects:\n\n`;
        data.projects.slice(0, 5).forEach((p: any, i: number) => {
          response += `${i + 1}. **${p.title}** (${p.category})\n   ${p.short_description || p.description?.substring(0, 80)}...\n\n`;
        });
      } else {
        response += `Based on the portfolio data, here are the relevant projects:\n\n`;
        relevantProjects.slice(0, 3).forEach((p: any, i: number) => {
          response += `${i + 1}. **${p.title}** (${p.category})\n`;
          response += `   ${p.description?.substring(0, 150)}...\n`;
          response += `   Technologies: ${p.tech_stack?.slice(0, 5).join(', ')}\n\n`;
        });
      }
      
      if (relevantProjects.length > 3) {
        response += `...and ${relevantProjects.length - 3} more related projects in the portfolio.`;
      }
      return response;
    }

    // Skills intent
    if (intents.includes('skills') || relevantSkills.length > 0) {
      if (relevantSkills.length > 0) {
        response += `According to the portfolio, Srinath's skills in this area:\n\n`;
        relevantSkills.forEach((s: any) => {
          response += `• **${s.name}** (${s.category})\n  Proficiency: ${s.proficiency}%`;
          if (s.years_experience) {
            response += ` | ${s.years_experience} years experience`;
          }
          response += '\n\n';
        });

        // Add related projects
        if (relevantProjects.length > 0) {
          response += `\nRelated projects using these skills:\n`;
          relevantProjects.slice(0, 2).forEach((p: any) => {
            response += `• ${p.title}\n`;
          });
        }
      } else {
        response += `According to the portfolio, Srinath has expertise in ${data.skills.length} technologies:\n\n`;
        const topSkills = data.skills.sort((a: any, b: any) => b.proficiency - a.proficiency).slice(0, 8);
        topSkills.forEach((s: any) => {
          response += `• ${s.name} - ${s.proficiency}% proficiency\n`;
        });
      }
      return response;
    }

    // Experience intent
    if (intents.includes('experience') || relevantExperience.length > 0) {
      if (relevantExperience.length > 0) {
        response += `Based on the portfolio, here's Srinath's relevant experience:\n\n`;
        relevantExperience.forEach((e: any, i: number) => {
          response += `${i + 1}. **${e.role}** at **${e.company}**\n`;
          response += `   Duration: ${e.duration}\n`;
          response += `   Location: ${e.location} (${e.work_type})\n`;
          if (e.technologies) {
            response += `   Technologies: ${e.technologies.slice(0, 5).join(', ')}\n`;
          }
          response += '\n';
        });
      } else {
        response += `According to the portfolio, Srinath has ${data.experiences.length} work experiences:\n\n`;
        data.experiences.slice(0, 3).forEach((e: any, i: number) => {
          response += `${i + 1}. ${e.role} at ${e.company} (${e.duration})\n`;
        });
      }
      return response;
    }

    // Certifications intent
    if (intents.includes('certifications') || relevantCerts.length > 0) {
      const certsToShow = relevantCerts.length > 0 ? relevantCerts : data.certifications;
      response += `Based on the portfolio, Srinath has ${certsToShow.length} certifications:\n\n`;
      certsToShow.slice(0, 5).forEach((c: any, i: number) => {
        response += `${i + 1}. **${c.title}**\n   Issued by: ${c.issuer}\n\n`;
      });
      return response;
    }

    // Contact intent
    if (intents.includes('contact')) {
      response = `Contact information from portfolio:\n\n`;
      if (data.profile.email) response += `📧 Email: ${data.profile.email}\n`;
      if (data.profile.phone) response += `📱 Phone: ${data.profile.phone}\n`;
      if (data.profile.location) response += `📍 Location: ${data.profile.location}\n`;
      if (data.profile.github_url) response += `💻 GitHub: ${data.profile.github_url}\n`;
      if (data.profile.linkedin_url) response += `🔗 LinkedIn: ${data.profile.linkedin_url}\n`;
      return response;
    }

    // Default: search all and show what's found
    const totalFound = relevantProjects.length + relevantExperience.length + relevantSkills.length + relevantCerts.length;
    
    if (totalFound === 0) {
      return `I searched the portfolio but couldn't find specific information about "${question}".\n\nTry asking about:\n• Projects (e.g., "What projects use React?")\n• Skills (e.g., "What programming languages?")\n• Experience (e.g., "Where has Srinath worked?")\n• Certifications (e.g., "What certifications?")\n• Contact info (e.g., "How to contact?")`;
    }

    response = `Based on the portfolio data, here's what I found:\n\n`;
    
    if (relevantProjects.length > 0) {
      response += `📁 **${relevantProjects.length} Relevant Projects:**\n`;
      relevantProjects.slice(0, 2).forEach((p: any) => {
        response += `• ${p.title} - ${p.short_description}\n`;
      });
      response += '\n';
    }

    if (relevantSkills.length > 0) {
      response += `💪 **${relevantSkills.length} Related Skills:**\n`;
      relevantSkills.slice(0, 3).forEach((s: any) => {
        response += `• ${s.name} (${s.proficiency}% proficiency)\n`;
      });
      response += '\n';
    }

    if (relevantExperience.length > 0) {
      response += `💼 **${relevantExperience.length} Relevant Experience:**\n`;
      relevantExperience.slice(0, 2).forEach((e: any) => {
        response += `• ${e.role} at ${e.company}\n`;
      });
    }

    return response;
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Fetch portfolio data
      const data = await getPortfolioData();
      
      // Generate RAG response (ONLY using portfolio data!)
      const response = generateRAGResponse(userMessage, data);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('RAG error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error accessing the portfolio database. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Who is Srinath?",
    "What projects has Srinath done?",
    "What are Srinath's React skills?",
    "Where has Srinath worked?",
    "Show me AI-related projects",
    "How can I contact Srinath?",
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Ask about Srinath"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Chat Window - Same UI as before */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Ask About Srinath
              </h3>
              <p className="text-xs text-blue-100">Answers based on portfolio data only</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-center mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                <p className="font-medium mb-4">👋 Ask me anything about Srinath!</p>
                <p className="text-sm mb-4 text-gray-600">I'll answer using portfolio data only:</p>
                <div className="space-y-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                        setTimeout(handleSend, 100);
                      }}
                      className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Analyzing portfolio data...
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about Srinath..."
                disabled={loading}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all min-w-[44px]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              💡 RAG System - Answers based ONLY on portfolio database
            </p>
          </div>
        </div>
      )}
    </>
  );
}