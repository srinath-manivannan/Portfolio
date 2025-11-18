// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from 'react';
// import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
// }

// interface PortfolioData {
//   projects: any[];
//   experiences: any[];
//   skills: any[];
//   certifications: any[];
//   profile: any;
// }

// export default function SmartRAGWidget() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);

//   // Fetch ALL portfolio data once
//   async function getPortfolioData(): Promise<PortfolioData> {
//     try {
//       const [projects, experiences, skills, certifications, profile] = await Promise.all([
//         supabase.from('projects').select('*').order('display_order'),
//         supabase.from('experiences').select('*').order('display_order'),
//         supabase.from('skills').select('*').order('display_order'),
//         supabase.from('certifications').select('*').order('display_order'),
//         supabase.from('profiles').select('*').limit(1).single(),
//       ]);

//       return {
//         projects: projects.data || [],
//         experiences: experiences.data || [],
//         skills: skills.data || [],
//         certifications: certifications.data || [],
//         profile: profile.data || {},
//       };
//     } catch (error) {
//       console.error('Error fetching portfolio:', error);
//       return { projects: [], experiences: [], skills: [], certifications: [], profile: {} };
//     }
//   }

//   // Smart question understanding (without AI API)
//   function analyzeQuestion(question: string) {
//     const q = question.toLowerCase();
    
//     // Detect intent
//     const intents = {
//       projects: ['project', 'built', 'made', 'developed', 'created', 'work on'],
//       experience: ['experience', 'worked', 'work at', 'job', 'company', 'role', 'position'],
//       skills: ['skill', 'know', 'technology', 'tech', 'proficiency', 'good at', 'expert'],
//       certifications: ['certificate', 'certification', 'certified', 'course', 'training'],
//       about: ['who', 'about', 'introduce', 'tell me about', 'background'],
//       contact: ['contact', 'reach', 'email', 'phone', 'location', 'hire'],
//     };

//     const detectedIntents = Object.entries(intents)
//       .filter(([_, keywords]) => keywords.some(k => q.includes(k)))
//       .map(([intent]) => intent);

//     // Extract keywords (technologies, companies, etc.)
//     const keywords = question
//       .toLowerCase()
//       .split(/\s+/)
//       .filter(word => word.length > 2)
//       .filter(word => !['what', 'where', 'when', 'how', 'can', 'does', 'has', 'the', 'and', 'with', 'about'].includes(word));

//     return { intents: detectedIntents, keywords };
//   }

//   // Generate natural response (RAG style - only portfolio data!)
//   function generateRAGResponse(question: string, data: PortfolioData): string {
//     const analysis = analyzeQuestion(question);
//     const { intents, keywords } = analysis;

//     // Search relevant data
//     const relevantProjects = data.projects.filter(p =>
//       keywords.some(k =>
//         p.title?.toLowerCase().includes(k) ||
//         p.description?.toLowerCase().includes(k) ||
//         p.tech_stack?.some((t: string) => t.toLowerCase().includes(k)) ||
//         p.category?.toLowerCase().includes(k)
//       )
//     );

//     const relevantExperience = data.experiences.filter(e =>
//       keywords.some(k =>
//         e.company?.toLowerCase().includes(k) ||
//         e.role?.toLowerCase().includes(k) ||
//         e.description?.some((d: string) => d.toLowerCase().includes(k)) ||
//         e.technologies?.some((t: string) => t.toLowerCase().includes(k))
//       )
//     );

//     const relevantSkills = data.skills.filter(s =>
//       keywords.some(k =>
//         s.name?.toLowerCase().includes(k) ||
//         s.category?.toLowerCase().includes(k)
//       )
//     );

//     const relevantCerts = data.certifications.filter(c =>
//       keywords.some(k =>
//         c.title?.toLowerCase().includes(k) ||
//         c.issuer?.toLowerCase().includes(k)
//       )
//     );

//     // Generate contextual response based on intent and data
//     let response = '';

//     // About/Introduction intent
//     if (intents.includes('about') || question.toLowerCase().includes('who')) {
//       response = `Based on the portfolio, ${data.profile.name || 'Srinath Manivannan'} is ${data.profile.title || 'an AI Full-Stack Software Engineer'}.\n\n`;
//       response += `${data.profile.bio?.substring(0, 200) || 'A skilled developer with expertise in MERN stack, Next.js, and AI integration.'}...\n\n`;
      
//       if (data.experiences.length > 0) {
//         response += `Currently working as ${data.experiences[0].role} at ${data.experiences[0].company}.\n\n`;
//       }
      
//       response += `Key expertise: ${data.skills.slice(0, 5).map((s: any) => s.name).join(', ')}.`;
//       return response;
//     }

//     // Projects intent
//     if (intents.includes('projects') || relevantProjects.length > 0) {
//       if (relevantProjects.length === 0 && intents.includes('projects')) {
//         response += `According to the portfolio, Srinath has worked on ${data.projects.length} projects:\n\n`;
//         data.projects.slice(0, 5).forEach((p: any, i: number) => {
//           response += `${i + 1}. **${p.title}** (${p.category})\n   ${p.short_description || p.description?.substring(0, 80)}...\n\n`;
//         });
//       } else {
//         response += `Based on the portfolio data, here are the relevant projects:\n\n`;
//         relevantProjects.slice(0, 3).forEach((p: any, i: number) => {
//           response += `${i + 1}. **${p.title}** (${p.category})\n`;
//           response += `   ${p.description?.substring(0, 150)}...\n`;
//           response += `   Technologies: ${p.tech_stack?.slice(0, 5).join(', ')}\n\n`;
//         });
//       }
      
//       if (relevantProjects.length > 3) {
//         response += `...and ${relevantProjects.length - 3} more related projects in the portfolio.`;
//       }
//       return response;
//     }

//     // Skills intent
//     if (intents.includes('skills') || relevantSkills.length > 0) {
//       if (relevantSkills.length > 0) {
//         response += `According to the portfolio, Srinath's skills in this area:\n\n`;
//         relevantSkills.forEach((s: any) => {
//           response += `• **${s.name}** (${s.category})\n  Proficiency: ${s.proficiency}%`;
//           if (s.years_experience) {
//             response += ` | ${s.years_experience} years experience`;
//           }
//           response += '\n\n';
//         });

//         // Add related projects
//         if (relevantProjects.length > 0) {
//           response += `\nRelated projects using these skills:\n`;
//           relevantProjects.slice(0, 2).forEach((p: any) => {
//             response += `• ${p.title}\n`;
//           });
//         }
//       } else {
//         response += `According to the portfolio, Srinath has expertise in ${data.skills.length} technologies:\n\n`;
//         const topSkills = data.skills.sort((a: any, b: any) => b.proficiency - a.proficiency).slice(0, 8);
//         topSkills.forEach((s: any) => {
//           response += `• ${s.name} - ${s.proficiency}% proficiency\n`;
//         });
//       }
//       return response;
//     }

//     // Experience intent
//     if (intents.includes('experience') || relevantExperience.length > 0) {
//       if (relevantExperience.length > 0) {
//         response += `Based on the portfolio, here's Srinath's relevant experience:\n\n`;
//         relevantExperience.forEach((e: any, i: number) => {
//           response += `${i + 1}. **${e.role}** at **${e.company}**\n`;
//           response += `   Duration: ${e.duration}\n`;
//           response += `   Location: ${e.location} (${e.work_type})\n`;
//           if (e.technologies) {
//             response += `   Technologies: ${e.technologies.slice(0, 5).join(', ')}\n`;
//           }
//           response += '\n';
//         });
//       } else {
//         response += `According to the portfolio, Srinath has ${data.experiences.length} work experiences:\n\n`;
//         data.experiences.slice(0, 3).forEach((e: any, i: number) => {
//           response += `${i + 1}. ${e.role} at ${e.company} (${e.duration})\n`;
//         });
//       }
//       return response;
//     }

//     // Certifications intent
//     if (intents.includes('certifications') || relevantCerts.length > 0) {
//       const certsToShow = relevantCerts.length > 0 ? relevantCerts : data.certifications;
//       response += `Based on the portfolio, Srinath has ${certsToShow.length} certifications:\n\n`;
//       certsToShow.slice(0, 5).forEach((c: any, i: number) => {
//         response += `${i + 1}. **${c.title}**\n   Issued by: ${c.issuer}\n\n`;
//       });
//       return response;
//     }

//     // Contact intent
//     if (intents.includes('contact')) {
//       response = `Contact information from portfolio:\n\n`;
//       if (data.profile.email) response += `📧 Email: ${data.profile.email}\n`;
//       if (data.profile.phone) response += `📱 Phone: ${data.profile.phone}\n`;
//       if (data.profile.location) response += `📍 Location: ${data.profile.location}\n`;
//       if (data.profile.github_url) response += `💻 GitHub: ${data.profile.github_url}\n`;
//       if (data.profile.linkedin_url) response += `🔗 LinkedIn: ${data.profile.linkedin_url}\n`;
//       return response;
//     }

//     // Default: search all and show what's found
//     const totalFound = relevantProjects.length + relevantExperience.length + relevantSkills.length + relevantCerts.length;
    
//     if (totalFound === 0) {
//       return `I searched the portfolio but couldn't find specific information about "${question}".\n\nTry asking about:\n• Projects (e.g., "What projects use React?")\n• Skills (e.g., "What programming languages?")\n• Experience (e.g., "Where has Srinath worked?")\n• Certifications (e.g., "What certifications?")\n• Contact info (e.g., "How to contact?")`;
//     }

//     response = `Based on the portfolio data, here's what I found:\n\n`;
    
//     if (relevantProjects.length > 0) {
//       response += `📁 **${relevantProjects.length} Relevant Projects:**\n`;
//       relevantProjects.slice(0, 2).forEach((p: any) => {
//         response += `• ${p.title} - ${p.short_description}\n`;
//       });
//       response += '\n';
//     }

//     if (relevantSkills.length > 0) {
//       response += `💪 **${relevantSkills.length} Related Skills:**\n`;
//       relevantSkills.slice(0, 3).forEach((s: any) => {
//         response += `• ${s.name} (${s.proficiency}% proficiency)\n`;
//       });
//       response += '\n';
//     }

//     if (relevantExperience.length > 0) {
//       response += `💼 **${relevantExperience.length} Relevant Experience:**\n`;
//       relevantExperience.slice(0, 2).forEach((e: any) => {
//         response += `• ${e.role} at ${e.company}\n`;
//       });
//     }

//     return response;
//   }

//   async function handleSend() {
//     if (!input.trim() || loading) return;

//     const userMessage = input.trim();
//     setInput('');
//     setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
//     setLoading(true);

//     try {
//       // Fetch portfolio data
//       const data = await getPortfolioData();
      
//       // Generate RAG response (ONLY using portfolio data!)
//       const response = generateRAGResponse(userMessage, data);
      
//       setMessages(prev => [...prev, { role: 'assistant', content: response }]);
//     } catch (error) {
//       console.error('RAG error:', error);
//       setMessages(prev => [...prev, { 
//         role: 'assistant', 
//         content: 'Sorry, I encountered an error accessing the portfolio database. Please try again.' 
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const quickQuestions = [
//     "Who is Srinath?",
//     "What projects has Srinath done?",
//     "What are Srinath's React skills?",
//     "Where has Srinath worked?",
//     "Show me AI-related projects",
//     "How can I contact Srinath?",
//   ];

//   return (
//     <>
//       {/* Chat Button */}
//       {!isOpen && (
//         <button
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
//           aria-label="Ask about Srinath"
//         >
//           <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
//         </button>
//       )}

//       {/* Chat Window - Same UI as before */}
//       {isOpen && (
//         <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
//           <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
//             <div>
//               <h3 className="font-semibold text-lg flex items-center gap-2">
//                 <Sparkles className="w-5 h-5" />
//                 Ask About Srinath
//               </h3>
//               <p className="text-xs text-blue-100">Answers based on portfolio data only</p>
//             </div>
//             <button 
//               onClick={() => setIsOpen(false)}
//               className="hover:bg-white/20 p-1 rounded transition"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
//             {messages.length === 0 && (
//               <div className="text-gray-500 dark:text-gray-400 text-center mt-8">
//                 <MessageCircle className="w-12 h-12 mx-auto mb-3 text-purple-500" />
//                 <p className="font-medium mb-4">👋 Ask me anything about Srinath!</p>
//                 <p className="text-sm mb-4 text-gray-600">I'll answer using portfolio data only:</p>
//                 <div className="space-y-2">
//                   {quickQuestions.map((q, i) => (
//                     <button
//                       key={i}
//                       onClick={() => {
//                         setInput(q);
//                         setTimeout(handleSend, 100);
//                       }}
//                       className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition"
//                     >
//                       💬 {q}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             {messages.map((msg, idx) => (
//               <div 
//                 key={idx} 
//                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
//                   msg.role === 'user' 
//                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none' 
//                     : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
//                 }`}>
//                   <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
//                 </div>
//               </div>
//             ))}

//             {loading && (
//               <div className="flex justify-start">
//                 <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Sparkles className="w-4 h-4 animate-spin" />
//                     Analyzing portfolio data...
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask anything about Srinath..."
//                 disabled={loading}
//                 className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//               />
//               <button
//                 onClick={handleSend}
//                 disabled={loading || !input.trim()}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all min-w-[44px]"
//               >
//                 <Send className="w-5 h-5" />
//               </button>
//             </div>
//             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
//               💡 RAG System - Answers based ONLY on portfolio database
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Zap, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * SmartRAGWidgetEnhanced
 * - Theme-aware, animated RAG chat widget for portfolio queries
 * - Paste over your existing widget. Keeps same data logic (RAG functions unchanged)
 *
 * Notes:
 * - Expects CSS variables like --primary, --accent, --background etc to be set by ThemeProvider
 * - Uses Tailwind utilities; small inline styles used for dynamic colors from CSS vars
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts?: number;
}

interface PortfolioData {
  projects: any[];
  experiences: any[];
  skills: any[];
  certifications: any[];
  profile: any;
}

export default function SmartRAGWidgetEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [quickVisible, setQuickVisible] = useState(true);
  const { theme } = useTheme();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Colors from CSS variables (ThemeProvider should set these)
  const css = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    return {
      primary: root.getPropertyValue('--primary')?.trim() || '#60a5fa',
      accent: root.getPropertyValue('--accent')?.trim() || '#a78bfa',
      background: root.getPropertyValue('--background')?.trim() || '#020617',
      foreground: root.getPropertyValue('--foreground')?.trim() || '#e6eef8',
      muted: root.getPropertyValue('--muted')?.trim() || 'rgba(255,255,255,0.35)',
      cardBg: root.getPropertyValue('--card-bg') || 'rgba(8,10,14,0.6)'
    };
  }, [theme]);

  // --- RAG logic (kept identical to your original functions) ---
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
      return { projects: [], experiences: [], skills: [], certifications: [], profile: {} };
    }
  }

  // Canonicalization helpers
  const STOP = new Set(['what','where','when','how','can','does','has','the','and','with','about','for','show','list','give','tell','me']);
  const SYN: Record<string,string> = {
    js:'javascript', ts:'typescript', next:'next.js', react:'react', 'reactjs':'react', node:'node.js', mongo:'mongodb', gpt:'llm', ai:'artificial-intelligence', ml:'machine-learning', rag:'retrieval-augmented-generation', n8n:'n8n', aws:'aws', azure:'azure', pg:'postgres', postgres:'postgres', sql:'sql'
  };
  function canonToken(w:string){
    const t = w.toLowerCase().replace(/[^a-z0-9.#+-]/g,'');
    if (!t || STOP.has(t)) return '';
    return SYN[t] || t;
  }
  function tokenize(s:string){
    return s.toLowerCase().split(/[^a-z0-9.#+-]+/g).map(canonToken).filter(Boolean);
  }

  function analyzeQuestion(question: string) {
    const q = question.toLowerCase();
    const intentsDict: Record<string,string[]> = {
      projects: ['project','built','made','developed','created','work on','repo','code','demo'],
      experience: ['experience','worked','work at','job','company','role','position'],
      skills: ['skill','know','technology','tech','proficiency','good at','expert'],
      certifications: ['certificate','certification','certified','course','training'],
      about: ['who','about','introduce','tell me about','background'],
      contact: ['contact','reach','email','phone','location','hire'],
    };
    const intents = Object.entries(intentsDict)
      .filter(([, keys]) => keys.some(k => q.includes(k)))
      .map(([intent]) => intent);

    const raw = tokenize(question);
    const keywords = raw.filter(t => !STOP.has(t));
    return { intents, keywords };
  }

  // scoring helpers
  function scoreProject(p:any, tokens:string[]) {
    const title = tokenize(p.title || '');
    const desc = tokenize(p.description || '');
    const category = tokenize(p.category || '');
    const tech = (p.tech_stack || []).flatMap((t:string)=>tokenize(t));
    let s = 0;
    for (const t of tokens){
      if (title.includes(t)) s += 3;
      if (desc.includes(t)) s += 1;
      if (tech.includes(t)) s += 2;
      if (category.includes(t)) s += 1;
    }
    if (p.featured) s += 1;
    return s;
  }
  function scoreExp(e:any, tokens:string[]){
    const company = tokenize(e.company||'');
    const role = tokenize(e.role||'');
    const body = (e.description||[]).flatMap((d:string)=>tokenize(d));
    const tech = (e.technologies||[]).flatMap((t:string)=>tokenize(t));
    let s=0; for(const t of tokens){
      if (company.includes(t)) s+=2; if (role.includes(t)) s+=2; if (body.includes(t)) s+=1; if (tech.includes(t)) s+=2;
    } return s;
  }
  function scoreSkill(sk:any, tokens:string[]){
    const name = tokenize(sk.name||'');
    const cat = tokenize(sk.category||'');
    let s=0; for(const t of tokens){ if (name.includes(t)) s+=3; if (cat.includes(t)) s+=1; } return s;
  }
  function scoreCert(c:any, tokens:string[]){
    const title = tokenize(c.title||''); const issuer = tokenize(c.issuer||'');
    let s=0; for(const t of tokens){ if (title.includes(t)) s+=2; if (issuer.includes(t)) s+=1; } return s;
  }

  function topN<T>(arr:T[], n=4){ return arr.slice(0, Math.max(0,n)); }

  function generateRAGResponse(question: string, data: PortfolioData): string {
    const { intents, keywords } = analyzeQuestion(question);
    const tokens = keywords;

    // scored retrieval
    const scoredProjects = (data.projects||[]).map((p:any)=>({p, s: scoreProject(p,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
    const scoredExp = (data.experiences||[]).map((e:any)=>({e,s:scoreExp(e,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
    const scoredSkills = (data.skills||[]).map((sk:any)=>({sk,s:scoreSkill(sk,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
    const scoredCerts = (data.certifications||[]).map((c:any)=>({c,s:scoreCert(c,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);

    // response builders
    const fmtProject = (p:any,i:number)=>{
      const tech = (p.tech_stack||[]).slice(0,5).join(', ');
      const summary = (p.short_description || p.description || '').toString().slice(0,140);
      const links = [p.live_url? 'Live':'' , p.github_url? 'Code':'' ].filter(Boolean).join(' | ');
      return `${i}. ${p.title} (${p.category})\n   ${summary}${summary.length>=140?'...':''}\n   Tech: ${tech}${links?`\n   Links: ${links}`:''}`;
    };
    const fmtExp = (e:any)=>`• ${e.role} at ${e.company} (${e.duration})${(e.technologies&&e.technologies.length)?` — ${(e.technologies||[]).slice(0,6).join(', ')}`:''}`;
    const fmtSkill = (s:any)=>`• ${s.name} (${s.category}) — ${s.proficiency??'N/A'}%`;
    const fmtCert = (c:any)=>`• ${c.title} — ${c.issuer}${c.issue_date?` (${new Date(c.issue_date).getFullYear()})`:''}`;

    // intent-first responses
    if (intents.includes('about') || /\bwho\b/i.test(question)){
      let res = `Based on the portfolio, ${data.profile.name || 'Srinath'} is ${data.profile.title || 'an AI Full-Stack Software Engineer'}.\n\n`;
      res += `${(data.profile.bio||'').toString().slice(0,240)}${(data.profile.bio||'').length>240?'...':''}\n\n`;
      if ((data.experiences||[]).length){ res += `Currently: ${data.experiences[0].role} at ${data.experiences[0].company}.\n`; }
      const topSkills = (data.skills||[]).slice(0,6).map((s:any)=>s.name).join(', ');
      res += `Key skills: ${topSkills}.`;
      return res;
    }

    if (intents.includes('projects') || scoredProjects.length){
      if (!scoredProjects.length){
        let res = `Srinath has worked on ${(data.projects||[]).length} projects. A few highlights:\n\n`;
        (data.projects||[]).slice(0,5).forEach((p:any,i:number)=>{ res += fmtProject(p,i+1)+"\n\n"; });
        return res;
      }
      const top = topN(scoredProjects,4).map((x:any,idx:number)=>fmtProject(x.p, idx+1)).join('\n\n');
      return `Relevant projects:\n\n${top}`;
    }

    if (intents.includes('skills') || scoredSkills.length){
      if (!scoredSkills.length){
        const list = (data.skills||[]).slice(0,8).map((s:any)=>s.name).join(', ');
        return `Top skills: ${list}.`;
      }
      const lines = topN(scoredSkills,6).map((x:any)=>fmtSkill(x.sk)).join('\n');
      // Related projects suggestion
      const related = topN(scoredProjects,3).map((x:any)=>x.p.title).join(', ');
      return `Skills detected:\n\n${lines}${related?`\n\nRelated projects: ${related}`:''}`;
    }

    if (intents.includes('experience') || scoredExp.length){
      if (!scoredExp.length){
        const brief = (data.experiences||[]).slice(0,3).map((e:any)=>fmtExp(e)).join('\n');
        return brief || 'No experiences found.';
      }
      const lines = topN(scoredExp,5).map((x:any)=>fmtExp(x.e)).join('\n');
      return `Relevant experience:\n${lines}`;
    }

    if (intents.includes('certifications') || scoredCerts.length){
      const list = (scoredCerts.length? topN(scoredCerts,6).map((x:any)=>fmtCert(x.c)) : (data.certifications||[]).slice(0,6).map((c:any)=>fmtCert(c))).join('\n');
      return `Certifications:\n${list}`;
    }

    if (intents.includes('contact')){
      let res = 'Contact:\n';
      if (data.profile.email) res += `Email: ${data.profile.email}\n`;
      if (data.profile.phone) res += `Phone: ${data.profile.phone}\n`;
      if (data.profile.location) res += `Location: ${data.profile.location}\n`;
      if (data.profile.github_url) res += `GitHub: ${data.profile.github_url}\n`;
      if (data.profile.linkedin_url) res += `LinkedIn: ${data.profile.linkedin_url}\n`;
      return res;
    }

    const anyFound = scoredProjects.length + scoredSkills.length + scoredExp.length + scoredCerts.length;
    if (!anyFound){
      return `I couldn't find anything specific for "${question}" in the portfolio.\nTry asking about: Projects, Skills, Experience, Certifications, or Contact info.`;
    }
    const projTitles = topN(scoredProjects,3).map((x:any)=>x.p.title).join(', ');
    const skillNames = topN(scoredSkills,4).map((x:any)=>x.sk.name).join(', ');
    const expRoles = topN(scoredExp,3).map((x:any)=>x.e.role).join(', ');
    let res = 'Found matching items:\n\n';
    if (projTitles) res += `Projects: ${projTitles}\n\n`;
    if (skillNames) res += `Skills: ${skillNames}\n\n`;
    if (expRoles) res += `Experience: ${expRoles}\n\n`;
    return res;
  }

  // --- UI behavior ---
  useEffect(() => {
    // scroll to bottom on messages change
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    "Who is Srinath?",
    "What projects has Srinath done?",
    "What are Srinath's React skills?",
    "Where has Srinath worked?",
    "Show me AI-related projects",
    "How can I contact Srinath?",
  ];

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    const ts = Date.now();
    setMessages(prev => [...prev, { role: 'user', content: userMessage, ts }]);
    setInput('');
    setLoading(true);
    setQuickVisible(false);

    try {
      const data = await getPortfolioData();
      // show typing indicator
      setIsTyping(true);

      // small fake delay to feel "smart"
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));

      const response = generateRAGResponse(userMessage, data);

      // simulate streaming typing by gradually appending
      await simulateAssistantStream(response);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry — error accessing portfolio data.' }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }

  // gradually append assistant message to create typing feel
  async function simulateAssistantStream(full: string) {
    const chunkSize = 140;
    let accum = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', ts: Date.now() }]);
    // replace last assistant message repeatedly
    for (let i = 0; i < Math.ceil(full.length / chunkSize); i++) {
      const nextChunk = full.slice(i * chunkSize, (i + 1) * chunkSize);
      accum += nextChunk;
      setMessages(prev => {
        const copy = [...prev];
        // find last assistant message index
        const lastIdx = copy.map(m => m.role).lastIndexOf('assistant');
        if (lastIdx >= 0) {
          copy[lastIdx] = { ...copy[lastIdx], content: accum };
        }
        return copy;
      });
      await new Promise(r => setTimeout(r, 220 + Math.random() * 180));
    }
    // small final delay
    await new Promise(r => setTimeout(r, 200));
  }

  function handleQuickClick(q: string) {
    setInput(q);
    // small delay to let UI update then send
    setTimeout(() => handleSend(), 250);
  }

  const variants = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } } },
    message: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  };

  // small helper for bubble colors
  const userBubbleStyle = { background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`, color: 'white' };
  const assistantStyle = { background: css.cardBg, color: css.foreground, border: '1px solid rgba(255,255,255,0.04)' };

  return (
    <>
      {/* Floating gradient blob + Chat Button */}
      <div className="fixed right-6 bottom-6 z-50">
        <AnimatePresence>
          {!isOpen && (
           <motion.button
  onClick={() => setIsOpen(true)}
  className="relative rounded-full flex items-center justify-center"
  aria-label="Open chat"
  style={{
    width: 64,
    height: 64,
    background: 'transparent',
    border: `2px solid rgba(255,255,255,0.12)`,
    boxShadow: '0 8px 20px rgba(2,6,23,0.6)'
  }}
  whileHover={{ scale: 1.08 }}
  whileFocus={{ scale: 1.02 }}
>
  <div
    className="w-12 h-12 rounded-full flex items-center justify-center"
    style={{
      background: 'rgba(255,255,255,0.04)',
      transition: 'background 180ms ease'
    }}
  >
    <MessageCircle className="w-6 h-6 text-white" />
  </div>
  <span className="sr-only">Open chat</span>
</motion.button>

          )}
        </AnimatePresence>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.28 }}
            className="fixed right-6 bottom-6 z-50 w-full max-w-md h-[640px] bg-[var(--card-bg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
            style={{
              borderColor: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(14px) saturate(120%)'
            }}
            ref={wrapperRef}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${css.primary}, ${css.accent})` }}>
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white" />
                <div>
                  <div className="font-semibold text-white">Ask Srinath (Portfolio RAG)</div>
                  <div className="text-xs text-white/80">Answers are derived from portfolio data only</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs">
                  <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Analyzing...' : 'Ready'}</span>
                </div>
                <button onClick={() => { setIsOpen(false); setMessages([]); }} aria-label="Close" className="p-1 rounded-md bg-white/10 hover:bg-white/12">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.02), transparent)` }}>
              {/* decorative header card */}
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: css.foreground }}>Ask me about Srinath</div>
                    <div className="text-xs" style={{ color: css.muted }}>Try quick suggestions below or ask custom questions.</div>
                  </div>
                  <Zap className="w-5 h-5 text-[color:var(--foreground)]" />
                </div>
              </motion.div>

              {/* quick chips */}
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {quickVisible && quickQuestions.map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleQuickClick(q)}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        color: css.foreground,
                        border: '1px solid rgba(255,255,255,0.03)'
                      }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {/* messages */}
              <motion.div variants={variants.container} initial="hidden" animate="show" className="space-y-3">
                {messages.map((m, i) => {
                  const isUser = m.role === 'user';
                  return (
                    <motion.div key={m.ts ?? i} variants={variants.message} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-xl shadow-sm break-words`}
                        style={isUser ? { ...userBubbleStyle } : { ...assistantStyle }}
                        aria-live="polite"
                        >
                        <div className="text-sm whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>

                        {/* micro-actions on assistant bubble */}
                        {!isUser && (
                          <div className="mt-2 flex items-center gap-2 justify-end">
                            <button className="text-xs px-2 py-1 rounded-md hover:opacity-90" style={{ background: 'rgba(255,255,255,0.02)', color: css.foreground }}>
                              <ThumbsUp className="w-4 h-4 inline-block mr-1" /> Helpful
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* typing indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="max-w-[65%] px-4 py-3 rounded-xl" style={{ background: css.cardBg, color: css.foreground }}>
                      <motion.div className="flex items-center gap-2">
                        <div className="flex gap-1 items-end">
                          <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-2 h-2 rounded-full" style={{ background: css.primary }} />
                          <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.12 }} className="w-2 h-2 rounded-full" style={{ background: css.primary }} />
                          <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.24 }} className="w-2 h-2 rounded-full" style={{ background: css.primary }} />
                        </div>
                        <div className="text-xs" style={{ color: css.muted }}>Analyzing portfolio...</div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </motion.div>
            </div>

            {/* footer: input */}
            <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.03)', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.02))' }}>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask anything about Srinath's portfolio..."
                  className="flex-1 rounded-md px-4 py-2 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    color: css.foreground
                  }}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setInput('Show AI-related projects'); setTimeout(() => handleSend(), 180); }}
                    title="Quick: AI projects"
                    className="px-3 py-2 rounded-md text-sm"
                    style={{ background: 'rgba(255,255,255,0.02)', color: css.foreground }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                  <button
                    disabled={loading || !input.trim()}
                    onClick={handleSend}
                    className="px-3 py-2 rounded-md shadow"
                    style={{
                      background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`,
                      color: '#fff'
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-center mt-2" style={{ color: css.muted }}>
                💡 RAG: responses only from portfolio database — no external LLM calls.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
