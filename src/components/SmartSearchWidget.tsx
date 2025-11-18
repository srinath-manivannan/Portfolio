// // /* eslint-disable @typescript-eslint/no-explicit-any */
// // import { useState } from 'react';
// // import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
// // import { supabase } from '@/integrations/supabase/client';

// // interface Message {
// //   role: 'user' | 'assistant';
// //   content: string;
// // }

// // interface PortfolioData {
// //   projects: any[];
// //   experiences: any[];
// //   skills: any[];
// //   certifications: any[];
// //   profile: any;
// // }

// // export default function SmartRAGWidget() {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [input, setInput] = useState('');
// //   const [loading, setLoading] = useState(false);

// //   // Fetch ALL portfolio data once
// //   async function getPortfolioData(): Promise<PortfolioData> {
// //     try {
// //       const [projects, experiences, skills, certifications, profile] = await Promise.all([
// //         supabase.from('projects').select('*').order('display_order'),
// //         supabase.from('experiences').select('*').order('display_order'),
// //         supabase.from('skills').select('*').order('display_order'),
// //         supabase.from('certifications').select('*').order('display_order'),
// //         supabase.from('profiles').select('*').limit(1).single(),
// //       ]);

// //       return {
// //         projects: projects.data || [],
// //         experiences: experiences.data || [],
// //         skills: skills.data || [],
// //         certifications: certifications.data || [],
// //         profile: profile.data || {},
// //       };
// //     } catch (error) {
// //       console.error('Error fetching portfolio:', error);
// //       return { projects: [], experiences: [], skills: [], certifications: [], profile: {} };
// //     }
// //   }

// //   // Smart question understanding (without AI API)
// //   function analyzeQuestion(question: string) {
// //     const q = question.toLowerCase();
    
// //     // Detect intent
// //     const intents = {
// //       projects: ['project', 'built', 'made', 'developed', 'created', 'work on'],
// //       experience: ['experience', 'worked', 'work at', 'job', 'company', 'role', 'position'],
// //       skills: ['skill', 'know', 'technology', 'tech', 'proficiency', 'good at', 'expert'],
// //       certifications: ['certificate', 'certification', 'certified', 'course', 'training'],
// //       about: ['who', 'about', 'introduce', 'tell me about', 'background'],
// //       contact: ['contact', 'reach', 'email', 'phone', 'location', 'hire'],
// //     };

// //     const detectedIntents = Object.entries(intents)
// //       .filter(([_, keywords]) => keywords.some(k => q.includes(k)))
// //       .map(([intent]) => intent);

// //     // Extract keywords (technologies, companies, etc.)
// //     const keywords = question
// //       .toLowerCase()
// //       .split(/\s+/)
// //       .filter(word => word.length > 2)
// //       .filter(word => !['what', 'where', 'when', 'how', 'can', 'does', 'has', 'the', 'and', 'with', 'about'].includes(word));

// //     return { intents: detectedIntents, keywords };
// //   }

// //   // Generate natural response (RAG style - only portfolio data!)
// //   function generateRAGResponse(question: string, data: PortfolioData): string {
// //     const analysis = analyzeQuestion(question);
// //     const { intents, keywords } = analysis;

// //     // Search relevant data
// //     const relevantProjects = data.projects.filter(p =>
// //       keywords.some(k =>
// //         p.title?.toLowerCase().includes(k) ||
// //         p.description?.toLowerCase().includes(k) ||
// //         p.tech_stack?.some((t: string) => t.toLowerCase().includes(k)) ||
// //         p.category?.toLowerCase().includes(k)
// //       )
// //     );

// //     const relevantExperience = data.experiences.filter(e =>
// //       keywords.some(k =>
// //         e.company?.toLowerCase().includes(k) ||
// //         e.role?.toLowerCase().includes(k) ||
// //         e.description?.some((d: string) => d.toLowerCase().includes(k)) ||
// //         e.technologies?.some((t: string) => t.toLowerCase().includes(k))
// //       )
// //     );

// //     const relevantSkills = data.skills.filter(s =>
// //       keywords.some(k =>
// //         s.name?.toLowerCase().includes(k) ||
// //         s.category?.toLowerCase().includes(k)
// //       )
// //     );

// //     const relevantCerts = data.certifications.filter(c =>
// //       keywords.some(k =>
// //         c.title?.toLowerCase().includes(k) ||
// //         c.issuer?.toLowerCase().includes(k)
// //       )
// //     );

// //     // Generate contextual response based on intent and data
// //     let response = '';

// //     // About/Introduction intent
// //     if (intents.includes('about') || question.toLowerCase().includes('who')) {
// //       response = `Based on the portfolio, ${data.profile.name || 'Srinath Manivannan'} is ${data.profile.title || 'an AI Full-Stack Software Engineer'}.\n\n`;
// //       response += `${data.profile.bio?.substring(0, 200) || 'A skilled developer with expertise in MERN stack, Next.js, and AI integration.'}...\n\n`;
      
// //       if (data.experiences.length > 0) {
// //         response += `Currently working as ${data.experiences[0].role} at ${data.experiences[0].company}.\n\n`;
// //       }
      
// //       response += `Key expertise: ${data.skills.slice(0, 5).map((s: any) => s.name).join(', ')}.`;
// //       return response;
// //     }

// //     // Projects intent
// //     if (intents.includes('projects') || relevantProjects.length > 0) {
// //       if (relevantProjects.length === 0 && intents.includes('projects')) {
// //         response += `According to the portfolio, Srinath has worked on ${data.projects.length} projects:\n\n`;
// //         data.projects.slice(0, 5).forEach((p: any, i: number) => {
// //           response += `${i + 1}. **${p.title}** (${p.category})\n   ${p.short_description || p.description?.substring(0, 80)}...\n\n`;
// //         });
// //       } else {
// //         response += `Based on the portfolio data, here are the relevant projects:\n\n`;
// //         relevantProjects.slice(0, 3).forEach((p: any, i: number) => {
// //           response += `${i + 1}. **${p.title}** (${p.category})\n`;
// //           response += `   ${p.description?.substring(0, 150)}...\n`;
// //           response += `   Technologies: ${p.tech_stack?.slice(0, 5).join(', ')}\n\n`;
// //         });
// //       }
      
// //       if (relevantProjects.length > 3) {
// //         response += `...and ${relevantProjects.length - 3} more related projects in the portfolio.`;
// //       }
// //       return response;
// //     }

// //     // Skills intent
// //     if (intents.includes('skills') || relevantSkills.length > 0) {
// //       if (relevantSkills.length > 0) {
// //         response += `According to the portfolio, Srinath's skills in this area:\n\n`;
// //         relevantSkills.forEach((s: any) => {
// //           response += `• **${s.name}** (${s.category})\n  Proficiency: ${s.proficiency}%`;
// //           if (s.years_experience) {
// //             response += ` | ${s.years_experience} years experience`;
// //           }
// //           response += '\n\n';
// //         });

// //         // Add related projects
// //         if (relevantProjects.length > 0) {
// //           response += `\nRelated projects using these skills:\n`;
// //           relevantProjects.slice(0, 2).forEach((p: any) => {
// //             response += `• ${p.title}\n`;
// //           });
// //         }
// //       } else {
// //         response += `According to the portfolio, Srinath has expertise in ${data.skills.length} technologies:\n\n`;
// //         const topSkills = data.skills.sort((a: any, b: any) => b.proficiency - a.proficiency).slice(0, 8);
// //         topSkills.forEach((s: any) => {
// //           response += `• ${s.name} - ${s.proficiency}% proficiency\n`;
// //         });
// //       }
// //       return response;
// //     }

// //     // Experience intent
// //     if (intents.includes('experience') || relevantExperience.length > 0) {
// //       if (relevantExperience.length > 0) {
// //         response += `Based on the portfolio, here's Srinath's relevant experience:\n\n`;
// //         relevantExperience.forEach((e: any, i: number) => {
// //           response += `${i + 1}. **${e.role}** at **${e.company}**\n`;
// //           response += `   Duration: ${e.duration}\n`;
// //           response += `   Location: ${e.location} (${e.work_type})\n`;
// //           if (e.technologies) {
// //             response += `   Technologies: ${e.technologies.slice(0, 5).join(', ')}\n`;
// //           }
// //           response += '\n';
// //         });
// //       } else {
// //         response += `According to the portfolio, Srinath has ${data.experiences.length} work experiences:\n\n`;
// //         data.experiences.slice(0, 3).forEach((e: any, i: number) => {
// //           response += `${i + 1}. ${e.role} at ${e.company} (${e.duration})\n`;
// //         });
// //       }
// //       return response;
// //     }

// //     // Certifications intent
// //     if (intents.includes('certifications') || relevantCerts.length > 0) {
// //       const certsToShow = relevantCerts.length > 0 ? relevantCerts : data.certifications;
// //       response += `Based on the portfolio, Srinath has ${certsToShow.length} certifications:\n\n`;
// //       certsToShow.slice(0, 5).forEach((c: any, i: number) => {
// //         response += `${i + 1}. **${c.title}**\n   Issued by: ${c.issuer}\n\n`;
// //       });
// //       return response;
// //     }

// //     // Contact intent
// //     if (intents.includes('contact')) {
// //       response = `Contact information from portfolio:\n\n`;
// //       if (data.profile.email) response += `📧 Email: ${data.profile.email}\n`;
// //       if (data.profile.phone) response += `📱 Phone: ${data.profile.phone}\n`;
// //       if (data.profile.location) response += `📍 Location: ${data.profile.location}\n`;
// //       if (data.profile.github_url) response += `💻 GitHub: ${data.profile.github_url}\n`;
// //       if (data.profile.linkedin_url) response += `🔗 LinkedIn: ${data.profile.linkedin_url}\n`;
// //       return response;
// //     }

// //     // Default: search all and show what's found
// //     const totalFound = relevantProjects.length + relevantExperience.length + relevantSkills.length + relevantCerts.length;
    
// //     if (totalFound === 0) {
// //       return `I searched the portfolio but couldn't find specific information about "${question}".\n\nTry asking about:\n• Projects (e.g., "What projects use React?")\n• Skills (e.g., "What programming languages?")\n• Experience (e.g., "Where has Srinath worked?")\n• Certifications (e.g., "What certifications?")\n• Contact info (e.g., "How to contact?")`;
// //     }

// //     response = `Based on the portfolio data, here's what I found:\n\n`;
    
// //     if (relevantProjects.length > 0) {
// //       response += `📁 **${relevantProjects.length} Relevant Projects:**\n`;
// //       relevantProjects.slice(0, 2).forEach((p: any) => {
// //         response += `• ${p.title} - ${p.short_description}\n`;
// //       });
// //       response += '\n';
// //     }

// //     if (relevantSkills.length > 0) {
// //       response += `💪 **${relevantSkills.length} Related Skills:**\n`;
// //       relevantSkills.slice(0, 3).forEach((s: any) => {
// //         response += `• ${s.name} (${s.proficiency}% proficiency)\n`;
// //       });
// //       response += '\n';
// //     }

// //     if (relevantExperience.length > 0) {
// //       response += `💼 **${relevantExperience.length} Relevant Experience:**\n`;
// //       relevantExperience.slice(0, 2).forEach((e: any) => {
// //         response += `• ${e.role} at ${e.company}\n`;
// //       });
// //     }

// //     return response;
// //   }

// //   async function handleSend() {
// //     if (!input.trim() || loading) return;

// //     const userMessage = input.trim();
// //     setInput('');
// //     setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
// //     setLoading(true);

// //     try {
// //       // Fetch portfolio data
// //       const data = await getPortfolioData();
      
// //       // Generate RAG response (ONLY using portfolio data!)
// //       const response = generateRAGResponse(userMessage, data);
      
// //       setMessages(prev => [...prev, { role: 'assistant', content: response }]);
// //     } catch (error) {
// //       console.error('RAG error:', error);
// //       setMessages(prev => [...prev, { 
// //         role: 'assistant', 
// //         content: 'Sorry, I encountered an error accessing the portfolio database. Please try again.' 
// //       }]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       handleSend();
// //     }
// //   };

// //   const quickQuestions = [
// //     "Who is Srinath?",
// //     "What projects has Srinath done?",
// //     "What are Srinath's React skills?",
// //     "Where has Srinath worked?",
// //     "Show me AI-related projects",
// //     "How can I contact Srinath?",
// //   ];

// //   return (
// //     <>
// //       {/* Chat Button */}
// //       {!isOpen && (
// //         <button
// //           onClick={() => setIsOpen(true)}
// //           className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
// //           aria-label="Ask about Srinath"
// //         >
// //           <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
// //         </button>
// //       )}

// //       {/* Chat Window - Same UI as before */}
// //       {isOpen && (
// //         <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
// //           <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
// //             <div>
// //               <h3 className="font-semibold text-lg flex items-center gap-2">
// //                 <Sparkles className="w-5 h-5" />
// //                 Ask About Srinath
// //               </h3>
// //               <p className="text-xs text-blue-100">Answers based on portfolio data only</p>
// //             </div>
// //             <button 
// //               onClick={() => setIsOpen(false)}
// //               className="hover:bg-white/20 p-1 rounded transition"
// //             >
// //               <X className="w-5 h-5" />
// //             </button>
// //           </div>

// //           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
// //             {messages.length === 0 && (
// //               <div className="text-gray-500 dark:text-gray-400 text-center mt-8">
// //                 <MessageCircle className="w-12 h-12 mx-auto mb-3 text-purple-500" />
// //                 <p className="font-medium mb-4">👋 Ask me anything about Srinath!</p>
// //                 <p className="text-sm mb-4 text-gray-600">I'll answer using portfolio data only:</p>
// //                 <div className="space-y-2">
// //                   {quickQuestions.map((q, i) => (
// //                     <button
// //                       key={i}
// //                       onClick={() => {
// //                         setInput(q);
// //                         setTimeout(handleSend, 100);
// //                       }}
// //                       className="w-full text-left px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition"
// //                     >
// //                       💬 {q}
// //                     </button>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}
            
// //             {messages.map((msg, idx) => (
// //               <div 
// //                 key={idx} 
// //                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
// //               >
// //                 <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
// //                   msg.role === 'user' 
// //                     ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none' 
// //                     : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-none'
// //                 }`}>
// //                   <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
// //                 </div>
// //               </div>
// //             ))}

// //             {loading && (
// //               <div className="flex justify-start">
// //                 <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border">
// //                   <div className="flex items-center gap-2 text-sm text-gray-600">
// //                     <Sparkles className="w-4 h-4 animate-spin" />
// //                     Analyzing portfolio data...
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>

// //           <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
// //             <div className="flex space-x-2">
// //               <input
// //                 type="text"
// //                 value={input}
// //                 onChange={(e) => setInput(e.target.value)}
// //                 onKeyPress={handleKeyPress}
// //                 placeholder="Ask anything about Srinath..."
// //                 disabled={loading}
// //                 className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
// //               />
// //               <button
// //                 onClick={handleSend}
// //                 disabled={loading || !input.trim()}
// //                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all min-w-[44px]"
// //               >
// //                 <Send className="w-5 h-5" />
// //               </button>
// //             </div>
// //             <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
// //               💡 RAG System - Answers based ONLY on portfolio database
// //             </p>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { MessageCircle, X, Send, Sparkles, Loader2, Zap, ThumbsUp } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { supabase } from '@/integrations/supabase/client';
// import { useTheme } from '@/contexts/ThemeContext';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   ts?: number;
// }

// interface PortfolioData {
//   projects: any[];
//   experiences: any[];
//   skills: any[];
//   certifications: any[];
//   profile: any;
// }

// export default function SmartRAGWidgetEnhanced() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [quickVisible, setQuickVisible] = useState(true);
//   const { theme } = useTheme();

//   const wrapperRef = useRef<HTMLDivElement | null>(null);
//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   const css = useMemo(() => {
//     const root = getComputedStyle(document.documentElement);
//     return {
//       primary: root.getPropertyValue('--primary')?.trim() || '#60a5fa',
//       accent: root.getPropertyValue('--accent')?.trim() || '#a78bfa',
//       background: root.getPropertyValue('--background')?.trim() || '#020617',
//       foreground: root.getPropertyValue('--foreground')?.trim() || '#e6eef8',
//       muted: root.getPropertyValue('--muted')?.trim() || 'rgba(255,255,255,0.35)',
//       cardBg: root.getPropertyValue('--card-bg') || 'rgba(8,10,14,0.6)'
//     };
//   }, [theme]);

//   // ===== ENHANCED RAG LOGIC =====

//   // Fuzzy matching for typos
//   function similarity(a: string, b: string): number {
//     const s1 = a.toLowerCase();
//     const s2 = b.toLowerCase();
//     if (s1 === s2) return 1.0;
//     if (s1.includes(s2) || s2.includes(s1)) return 0.85;
    
//     // Character overlap
//     const set1 = new Set(s1.split(''));
//     const set2 = new Set(s2.split(''));
//     const intersection = new Set([...set1].filter(x => set2.has(x)));
//     const union = new Set([...set1, ...set2]);
    
//     return intersection.size / union.size;
//   }

//   function fuzzyMatch(word: string, targets: string[]): string | null {
//     let bestMatch = null;
//     let bestScore = 0.65; // threshold
    
//     for (const target of targets) {
//       const score = similarity(word, target);
//       if (score > bestScore) {
//         bestScore = score;
//         bestMatch = target;
//       }
//     }
    
//     return bestMatch;
//   }

//   // Known companies and terms from Srinath's portfolio
//   const COMPANIES = ['capgemini', 'vanan', 'uit', 'hepl', 'cavinkare', 'cavin', 'skill-lync', 'skilllync', 'vijay', 'edubridge'];
//   const TECH_TERMS = ['react', 'node', 'mongodb', 'typescript', 'next', 'nestjs', 'docker', 'aws', 'ai', 'gpt', 'openai', 'automation', 'n8n'];

//   const STOP = new Set(['what','where','when','how','can','does','has','the','and','with','about','for','show','list','give','tell','me','my','your','his','her']);
  
//   const SYN: Record<string,string> = {
//     js:'javascript', ts:'typescript', next:'nextjs', 'next.js':'nextjs', react:'react', 'reactjs':'react', 
//     node:'nodejs', 'node.js':'nodejs', mongo:'mongodb', gpt:'openai', ai:'artificial-intelligence', 
//     ml:'machine-learning', rag:'retrieval-augmented-generation', n8n:'n8n', aws:'aws', azure:'azure', 
//     pg:'postgres', postgres:'postgres', sql:'sql', docker:'docker', k8s:'kubernetes',
//     'full-stack':'fullstack', 'full stack':'fullstack'
//   };

//   function canonToken(w:string){
//     const t = w.toLowerCase().replace(/[^a-z0-9.#+-]/g,'');
//     if (!t || STOP.has(t)) return '';
    
//     // Try fuzzy match against known companies
//     const companyMatch = fuzzyMatch(t, COMPANIES);
//     if (companyMatch) return companyMatch;
    
//     // Try fuzzy match against tech terms
//     const techMatch = fuzzyMatch(t, TECH_TERMS);
//     if (techMatch) return techMatch;
    
//     return SYN[t] || t;
//   }

//   function tokenize(s:string){
//     return s.toLowerCase().split(/[^a-z0-9.#+-]+/g).map(canonToken).filter(Boolean);
//   }

//   // Detect numeric questions
//   function isNumericQuestion(q: string): boolean {
//     const patterns = [
//       /how many (years?|yr)/i,
//       /\d+\s*(years?|yr)/i,
//       /(years?|yr) (of )?experience/i,
//       /experience.*years?/i,
//       /how long/i
//     ];
//     return patterns.some(p => p.test(q));
//   }

//   // Calculate total experience in years
//   function getTotalExperience(experiences: any[]): string {
//     // Srinath has 3+ years based on his experiences
//     // From Jan 2022 to Present = 3 years
//     return "3+";
//   }

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
//       return { projects: [], experiences: [], skills: [], certifications: [], profile: {} };
//     }
//   }

//   function analyzeQuestion(question: string) {
//     const q = question.toLowerCase();
//     const intentsDict: Record<string,string[]> = {
//       projects: ['project','built','made','developed','created','work on','repo','code','demo'],
//       experience: ['experience','worked','work at','job','company','role','position','capgemini','vanan','uit','hepl'],
//       skills: ['skill','know','technology','tech','proficiency','good at','expert'],
//       certifications: ['certificate','certification','certified','course','training'],
//       about: ['who','about','introduce','tell me about','background'],
//       contact: ['contact','reach','email','phone','location','hire'],
//     };
    
//     const intents = Object.entries(intentsDict)
//       .filter(([, keys]) => keys.some(k => q.includes(k)))
//       .map(([intent]) => intent);

//     const raw = tokenize(question);
//     const keywords = raw.filter(t => !STOP.has(t));
    
//     return { intents, keywords, isNumeric: isNumericQuestion(question) };
//   }

//   // Enhanced scoring functions
//   function scoreProject(p:any, tokens:string[]) {
//     const title = tokenize(p.title || '');
//     const desc = tokenize(p.description || '');
//     const category = tokenize(p.category || '');
//     const tech = (p.tech_stack || []).flatMap((t:string)=>tokenize(t));
//     let s = 0;
//     for (const t of tokens){
//       if (title.includes(t)) s += 3;
//       if (desc.includes(t)) s += 1;
//       if (tech.includes(t)) s += 2;
//       if (category.includes(t)) s += 1;
//     }
//     if (p.featured) s += 1;
//     return s;
//   }

//   function scoreExp(e:any, tokens:string[]){
//     const company = tokenize(e.company||'');
//     const role = tokenize(e.role||'');
//     const body = (e.description||[]).flatMap((d:string)=>tokenize(d));
//     const tech = (e.technologies||[]).flatMap((t:string)=>tokenize(t));
//     let s=0; 
//     for(const t of tokens){
//       if (company.includes(t)) s+=4; // Higher weight for company match
//       if (role.includes(t)) s+=2; 
//       if (body.includes(t)) s+=1; 
//       if (tech.includes(t)) s+=2;
//     } 
//     return s;
//   }

//   function scoreSkill(sk:any, tokens:string[]){
//     const name = tokenize(sk.name||'');
//     const cat = tokenize(sk.category||'');
//     let s=0; 
//     for(const t of tokens){ 
//       if (name.includes(t)) s+=3; 
//       if (cat.includes(t)) s+=1; 
//     } 
//     return s;
//   }

//   function scoreCert(c:any, tokens:string[]){
//     const title = tokenize(c.title||''); 
//     const issuer = tokenize(c.issuer||'');
//     let s=0; 
//     for(const t of tokens){ 
//       if (title.includes(t)) s+=2; 
//       if (issuer.includes(t)) s+=1; 
//     } 
//     return s;
//   }

//   function topN<T>(arr:T[], n=4){ return arr.slice(0, Math.max(0,n)); }

//   function generateRAGResponse(question: string, data: PortfolioData): string {
//     const { intents, keywords, isNumeric } = analyzeQuestion(question);
//     const tokens = keywords;

//     // CRITICAL: Handle experience years question with SHORT answer
//     if (isNumeric && (intents.includes('experience') || /experience/.test(question.toLowerCase()))) {
//       return `${getTotalExperience(data.experiences)} years of experience.`;
//     }

//     // Scored retrieval
//     const scoredProjects = (data.projects||[]).map((p:any)=>({p, s: scoreProject(p,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
//     const scoredExp = (data.experiences||[]).map((e:any)=>({e,s:scoreExp(e,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
//     const scoredSkills = (data.skills||[]).map((sk:any)=>({sk,s:scoreSkill(sk,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
//     const scoredCerts = (data.certifications||[]).map((c:any)=>({c,s:scoreCert(c,tokens)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);

//     // Response formatters
//     const fmtProject = (p:any,i:number)=>{
//       const tech = (p.tech_stack||[]).slice(0,5).join(', ');
//       const summary = (p.short_description || p.description || '').toString().slice(0,120);
//       return `${i}. ${p.title}\n   ${summary}${summary.length>=120?'...':''}\n   Tech: ${tech}`;
//     };
//     const fmtExp = (e:any)=>`• ${e.role} at ${e.company} (${e.duration})`;
//     const fmtSkill = (s:any)=>`• ${s.name} — ${s.proficiency??'N/A'}% proficiency`;
//     const fmtCert = (c:any)=>`• ${c.title} — ${c.issuer}`;

//     // Intent-based responses
//     if (intents.includes('about') || /\bwho\b/i.test(question)){
//       return `${data.profile.name || 'Srinath Manivannan'} is ${data.profile.title || 'an AI Full-Stack Software Engineer'} with ${getTotalExperience(data.experiences)} years of experience.\n\nCurrently working at ${(data.experiences||[])[0]?.company || 'Vanan Services'}.\n\nSpecializes in: ${(data.skills||[]).slice(0,6).map((s:any)=>s.name).join(', ')}.`;
//     }

//     if (intents.includes('projects') || scoredProjects.length){
//       if (!scoredProjects.length){
//         return `Recent projects:\n\n${(data.projects||[]).slice(0,3).map((p:any,i:number)=>fmtProject(p,i+1)).join('\n\n')}`;
//       }
//       return `Relevant projects:\n\n${topN(scoredProjects,3).map((x:any,idx:number)=>fmtProject(x.p, idx+1)).join('\n\n')}`;
//     }

//     if (intents.includes('skills') || scoredSkills.length){
//       if (!scoredSkills.length){
//         return `Top skills: ${(data.skills||[]).slice(0,8).map((s:any)=>s.name).join(', ')}.`;
//       }
//       const lines = topN(scoredSkills,5).map((x:any)=>fmtSkill(x.sk)).join('\n');
//       return `Skills:\n\n${lines}`;
//     }

//     if (intents.includes('experience') || scoredExp.length){
//       if (!scoredExp.length){
//         return (data.experiences||[]).slice(0,3).map((e:any)=>fmtExp(e)).join('\n');
//       }
//       return `Experience:\n\n${topN(scoredExp,4).map((x:any)=>fmtExp(x.e)).join('\n')}`;
//     }

//     if (intents.includes('certifications') || scoredCerts.length){
//       const list = (scoredCerts.length? topN(scoredCerts,5).map((x:any)=>fmtCert(x.c)) : (data.certifications||[]).slice(0,5).map((c:any)=>fmtCert(c))).join('\n');
//       return `Certifications:\n\n${list}`;
//     }

//     if (intents.includes('contact')){
//       let res = 'Contact:\n';
//       if (data.profile.email) res += `📧 ${data.profile.email}\n`;
//       if (data.profile.phone) res += `📱 ${data.profile.phone}\n`;
//       if (data.profile.location) res += `📍 ${data.profile.location}`;
//       return res;
//     }

//     const anyFound = scoredProjects.length + scoredSkills.length + scoredExp.length + scoredCerts.length;
//     if (!anyFound){
//       return `No specific results for "${question}".\n\nTry: "What projects?", "Skills?", "Capgemini experience?", or "Contact info?"`;
//     }

//     // Combined results
//     let res = 'Found:\n\n';
//     if (scoredExp.length) res += `Experience: ${topN(scoredExp,2).map((x:any)=>x.e.company).join(', ')}\n`;
//     if (scoredProjects.length) res += `Projects: ${topN(scoredProjects,3).map((x:any)=>x.p.title).join(', ')}\n`;
//     if (scoredSkills.length) res += `Skills: ${topN(scoredSkills,4).map((x:any)=>x.sk.name).join(', ')}`;
//     return res;
//   }

//   // ===== UI BEHAVIOR =====
//   useEffect(() => {
//     if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, isTyping]);

//   const quickQuestions = [
//     "Who is Srinath?",
//     "Show AI projects",
//     "Capgemini experience?",
//     "How many years experience?",
//     "React skills?",
//     "Contact info?",
//   ];

//   async function handleSend() {
//     if (!input.trim() || loading) return;
//     const userMessage = input.trim();
//     const ts = Date.now();
//     setMessages(prev => [...prev, { role: 'user', content: userMessage, ts }]);
//     setInput('');
//     setLoading(true);
//     setQuickVisible(false);

//     try {
//       const data = await getPortfolioData();
//       setIsTyping(true);
//       await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
//       const response = generateRAGResponse(userMessage, data);
//       await simulateAssistantStream(response);
//     } catch (err) {
//       setMessages(prev => [...prev, { role: 'assistant', content: 'Error accessing portfolio data.' }]);
//     } finally {
//       setLoading(false);
//       setIsTyping(false);
//     }
//   }

//   async function simulateAssistantStream(full: string) {
//     const chunkSize = 120;
//     let accum = '';
//     setMessages(prev => [...prev, { role: 'assistant', content: '', ts: Date.now() }]);
//     for (let i = 0; i < Math.ceil(full.length / chunkSize); i++) {
//       const nextChunk = full.slice(i * chunkSize, (i + 1) * chunkSize);
//       accum += nextChunk;
//       setMessages(prev => {
//         const copy = [...prev];
//         const lastIdx = copy.map(m => m.role).lastIndexOf('assistant');
//         if (lastIdx >= 0) copy[lastIdx] = { ...copy[lastIdx], content: accum };
//         return copy;
//       });
//       await new Promise(r => setTimeout(r, 180 + Math.random() * 120));
//     }
//   }

//   function handleQuickClick(q: string) {
//     setInput(q);
//     setTimeout(() => handleSend(), 200);
//   }

//   const variants = {
//     container: { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } } },
//     message: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
//   };

//   const userBubbleStyle = { background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`, color: 'white' };
//   const assistantStyle = { background: css.cardBg, color: css.foreground, border: '1px solid rgba(255,255,255,0.04)' };

//   return (
//     <>
//       <style>{`
//         /* Hide scrollbar but keep functionality */
//         .chat-messages::-webkit-scrollbar {
//           width: 0px;
//           background: transparent;
//         }
//         .chat-messages {
//           scrollbar-width: none;
//           -ms-overflow-style: none;
//         }
//       `}</style>

//       <div className="fixed right-6 bottom-6 z-50">
//         <AnimatePresence>
//           {!isOpen && (
//             <motion.button
//               onClick={() => setIsOpen(true)}
//               className="relative rounded-full flex items-center justify-center"
//               style={{
//                 width: 64,
//                 height: 64,
//                 background: 'transparent',
//                 border: `2px solid rgba(255,255,255,0.12)`,
//                 boxShadow: '0 8px 20px rgba(2,6,23,0.6)'
//               }}
//               whileHover={{ scale: 1.08 }}
//             >
//               <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
//                 <MessageCircle className="w-6 h-6 text-white" />
//               </div>
//             </motion.button>
//           )}
//         </AnimatePresence>
//       </div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 30 }}
//             transition={{ duration: 0.28 }}
//             className="fixed right-6 bottom-6 z-50 w-full max-w-md h-[640px] bg-[var(--card-bg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
//             style={{
//               borderColor: 'rgba(255,255,255,0.04)',
//               backdropFilter: 'blur(14px) saturate(120%)'
//             }}
//             ref={wrapperRef}
//           >
//             {/* Header */}
//             <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${css.primary}, ${css.accent})` }}>
//               <div className="flex items-center gap-3">
//                 <Sparkles className="w-5 h-5 text-white" />
//                 <div>
//                   <div className="font-semibold text-white">Ask Srinath (Smart RAG)</div>
//                   <div className="text-xs text-white/80">Intelligent portfolio search</div>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2">
//                 <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs">
//                   <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//                   <span>{loading ? 'Searching...' : 'Ready'}</span>
//                 </div>
//                 <button onClick={() => { setIsOpen(false); setMessages([]); }} className="p-1 rounded-md bg-white/10 hover:bg-white/12">
//                   <X className="w-4 h-4 text-white" />
//                 </button>
//               </div>
//             </div>

//             {/* Messages with invisible scroll */}
//             <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.02), transparent)` }}>
//               <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }}>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-sm font-medium" style={{ color: css.foreground }}>Ask about Srinath</div>
//                     <div className="text-xs" style={{ color: css.muted }}>Smart search with typo tolerance</div>
//                   </div>
//                   <Zap className="w-5 h-5 text-[color:var(--foreground)]" />
//                 </div>
//               </motion.div>

//               <div className="flex flex-wrap gap-2">
//                 <AnimatePresence>
//                   {quickVisible && quickQuestions.map((q, i) => (
//                     <motion.button
//                       key={q}
//                       initial={{ opacity: 0, y: 6 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: 6 }}
//                       transition={{ delay: i * 0.03 }}
//                       onClick={() => handleQuickClick(q)}
//                       className="px-3 py-1 rounded-full text-xs font-medium"
//                       style={{
//                         background: 'rgba(255,255,255,0.03)',
//                         color: css.foreground,
//                         border: '1px solid rgba(255,255,255,0.03)'
//                       }}
//                     >
//                       {q}
//                     </motion.button>
//                   ))}
//                 </AnimatePresence>
//               </div>

//               <motion.div variants={variants.container} initial="hidden" animate="show" className="space-y-3">
//                 {messages.map((m, i) => {
//                   const isUser = m.role === 'user';
//                   return (
//                     <motion.div key={m.ts ?? i} variants={variants.message} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
//                       <div
//                         className={`max-w-[85%] px-4 py-3 rounded-xl shadow-sm break-words`}
//                         style={isUser ? userBubbleStyle : assistantStyle}
//                       >
//                         <div className="text-sm whitespace-pre-wrap">{m.content}</div>
//                         {!isUser && (
//                           <div className="mt-2 flex items-center gap-2 justify-end">
//                             <button className="text-xs px-2 py-1 rounded-md hover:opacity-90" style={{ background: 'rgba(255,255,255,0.02)', color: css.foreground }}>
//                               <ThumbsUp className="w-4 h-4 inline-block mr-1" /> Helpful
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </motion.div>
//                   );
//                 })}

//                 {isTyping && (
//                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
//                     <div className="max-w-[65%] px-4 py-3 rounded-xl" style={{ background: css.cardBg, color: css.foreground }}>
//                       <motion.div className="flex items-center gap-2">
//                         <div className="flex gap-1 items-end">
//                           <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-2 h-2 rounded-full" style={{ background: css.primary }} />
//                           <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.12 }} className="w-2 h-2 rounded-full" style={{ background: css.primary }} />
//                           <motion.span animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.24 }} className="w-2 h-2 rounded-full" style={{ background: css.primary }} />
//                         </div>
//                         <div className="text-xs" style={{ color: css.muted }}>Searching...</div>
//                       </motion.div>
//                     </div>
//                   </motion.div>
//                 )}
//                 <div ref={bottomRef} />
//               </motion.div>
//             </div>

//             {/* Input */}
//             <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.03)', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.02))' }}>
//               <div className="flex items-center gap-3">
//                 <input
//                   type="text"
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
//                   placeholder="Try: 'capgimini experience' or 'how many years'..."
//                   className="flex-1 rounded-md px-4 py-2 text-sm"
//                   style={{
//                     background: 'rgba(255,255,255,0.02)',
//                     border: '1px solid rgba(255,255,255,0.04)',
//                     color: css.foreground
//                   }}
//                 />
//                 <button
//                   disabled={loading || !input.trim()}
//                   onClick={handleSend}
//                   className="px-3 py-2 rounded-md shadow"
//                   style={{
//                     background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`,
//                     color: '#fff'
//                   }}
//                 >
//                   <Send className="w-4 h-4" />
//                 </button>
//               </div>
//               <div className="text-xs text-center mt-2" style={{ color: css.muted }}>
//                 💡 Smart RAG with typo correction
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }


/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Zap, ThumbsUp, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';

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
  achievements: any[];
  education: any[];
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

  // ===== ADVANCED RAG SYSTEM =====

  // Enhanced fuzzy matching
  function levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[b.length][a.length];
  }

  function similarity(a: string, b: string): number {
    const s1 = a.toLowerCase();
    const s2 = b.toLowerCase();
    
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = levenshteinDistance(s1, s2);
    return 1 - distance / maxLen;
  }

  function fuzzyMatch(word: string, candidates: string[]): string | null {
    let bestMatch = null;
    let bestScore = 0.7;
    
    for (const candidate of candidates) {
      const score = similarity(word, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }
    
    return bestMatch;
  }

  // Comprehensive knowledge base
  const KNOWN_COMPANIES = ['capgemini', 'vanan', 'uit', 'hepl', 'cavinkare', 'cavin', 'kare', 'skill-lync', 'skilllync', 'vijay', 'edubridge', 'emertxe'];
  const KNOWN_TECH = ['react', 'reactjs', 'node', 'nodejs', 'mongodb', 'mongo', 'typescript', 'ts', 'nextjs', 'next', 'nestjs', 'nest', 'docker', 'aws', 's3', 'cloudflare', 'r2', 'openai', 'gpt', 'chatgpt', 'n8n', 'python', 'java', 'spring', 'angular', 'mysql', 'postgresql', 'postgres', 'express', 'redux', 'rest', 'api', 'iot', 'arduino', 'raspberry', 'pi', 'embedded', 'oauth', 'jwt', 'ci/cd', 'devops', 'linux', 'rbac', 'microservices', 'ssr', 'jira', 'mapbox', 'ml', 'ai', 'superbase', 'supabase'];
  const PROJECTS_KEYWORDS = ['tracker', 'crm', 'kidz', 'seo', 'analytics', 'code', 'upskill', 'lms', 'convex', 'agile', 'geogpt', 'swoos', 'inventory', 'reportlens', 'gmail', 'calendar', 'telegram', 'login', 'feed', 'rag', 'portfolio', 'ecommerce'];
  const ACHIEVEMENTS_KEYWORDS = ['award', 'best', 'outgoing', 'student', 'project', 'sun', 'tv', 'featured', 'ceo', 'appreciation', 'winner', 'top', 'performer'];
  const EDUCATION_KEYWORDS = ['degree', 'college', 'university', 'anna', 'mailam', 'ece', 'electronics', 'communication', 'cgpa', 'gpa', 'graduated', 'graduation'];

  function normalizeKeyword(word: string): string {
    const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const companyMatch = fuzzyMatch(w, KNOWN_COMPANIES);
    if (companyMatch) return companyMatch;
    
    const techMatch = fuzzyMatch(w, KNOWN_TECH);
    if (techMatch) return techMatch;
    
    const projectMatch = fuzzyMatch(w, PROJECTS_KEYWORDS);
    if (projectMatch) return projectMatch;
    
    const achievementMatch = fuzzyMatch(w, ACHIEVEMENTS_KEYWORDS);
    if (achievementMatch) return achievementMatch;
    
    const educationMatch = fuzzyMatch(w, EDUCATION_KEYWORDS);
    if (educationMatch) return educationMatch;
    
    return w;
  }

  // Question type detection
  function detectQuestionType(q: string): string {
    const lower = q.toLowerCase();
    
    if (/how many (years?|yr)|experience.*years?|years?.*(of )?experience|total.*experience/i.test(lower)) return 'experience_years';
    if (/where.*(work|study|college|university|graduated)|location|based|from/i.test(lower)) return 'location';
    if (/when.*(graduate|finish|complete|start|join)|year/i.test(lower)) return 'timeline';
    if (/contact|email|phone|reach|hire|call|message/i.test(lower)) return 'contact';
    if (/who|about|introduce|background|yourself/i.test(lower)) return 'about';
    if (/cgpa|gpa|marks|grade|percentage|score/i.test(lower)) return 'education_score';
    if (/award|achievement|recognition|win|prize|featured|tv|media/i.test(lower)) return 'achievements';
    if (/project|built|made|developed|created/i.test(lower)) return 'projects';
    if (/skill|technology|tech|know|expert|proficiency/i.test(lower)) return 'skills';
    if (/experience|worked|work at|job|company|role/i.test(lower)) return 'experience';
    if (/education|degree|college|university|studied/i.test(lower)) return 'education';
    if (/certificate|certification|course|training/i.test(lower)) return 'certifications';
    
    return 'general';
  }

  function getTotalExperience(): string {
    return "3+";
  }

  async function getPortfolioData(): Promise<PortfolioData> {
    try {
      const [projects, experiences, skills, certifications, achievements, education, profile] = await Promise.all([
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('experiences').select('*').order('display_order'),
        supabase.from('skills').select('*').order('display_order'),
        supabase.from('certifications').select('*').order('display_order'),
        supabase.from('achievements').select('*').order('display_order'),
        supabase.from('education').select('*').order('display_order'),
        supabase.from('profiles').select('*').limit(1).single(),
      ]);

      return {
        projects: projects.data || [],
        experiences: experiences.data || [],
        skills: skills.data || [],
        certifications: certifications.data || [],
        achievements: achievements.data || [],
        education: education.data || [],
        profile: profile.data || {},
      };
    } catch (error) {
      return { projects: [], experiences: [], skills: [], certifications: [], achievements: [], education: [], profile: {} };
    }
  }

  function analyzeQuestion(question: string) {
    const q = question.toLowerCase();
    
    const questionType = detectQuestionType(question);
    
    const intentsDict: Record<string, string[]> = {
      projects: ['project', 'built', 'made', 'developed', 'created', 'work on', 'repo', 'code', 'demo', 'portfolio', 'website', 'app', 'application'],
      experience: ['experience', 'worked', 'work at', 'job', 'company', 'role', 'position', 'intern', 'developer', 'engineer', 'capgemini', 'vanan', 'uit', 'hepl', 'vijay', 'skill-lync'],
      skills: ['skill', 'know', 'technology', 'tech', 'proficiency', 'good at', 'expert', 'programming', 'language', 'framework', 'tool'],
      certifications: ['certificate', 'certification', 'certified', 'course', 'training', 'qualification'],
      achievements: ['award', 'achievement', 'recognition', 'win', 'prize', 'featured', 'tv', 'media', 'best', 'top', 'performer', 'appreciation'],
      education: ['education', 'degree', 'college', 'university', 'studied', 'graduated', 'cgpa', 'gpa', 'mailam', 'anna'],
      about: ['who', 'about', 'introduce', 'tell me about', 'background', 'yourself', 'bio'],
      contact: ['contact', 'reach', 'email', 'phone', 'location', 'hire', 'call', 'message', 'address'],
    };

    const intents = Object.entries(intentsDict)
      .filter(([, keys]) => keys.some(k => q.includes(k)))
      .map(([intent]) => intent);

    const rawKeywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !['what', 'where', 'when', 'how', 'can', 'does', 'has', 'the', 'and', 'with', 'about', 'for', 'show', 'tell', 'give', 'list', 'was', 'were', 'are', 'did', 'his', 'her', 'your'].includes(word));

    const keywords = rawKeywords.map(w => normalizeKeyword(w)).filter(Boolean);

    return { intents, keywords, rawKeywords, questionType };
  }

  function generateRAGResponse(question: string, data: PortfolioData): string {
    const { intents, keywords, rawKeywords, questionType } = analyzeQuestion(question);
    const allKeywords = [...new Set([...keywords, ...rawKeywords])];

    // PRIORITY RESPONSES - Short & Direct

    // Experience years
    if (questionType === 'experience_years') {
      return `${getTotalExperience()} years of professional experience.`;
    }

    // CGPA/Education score
    if (questionType === 'education_score') {
      const edu = data.education?.[0];
      if (edu?.cgpa) return `CGPA: ${edu.cgpa} (First Class with Distinction)`;
      return `8.7 CGPA - First Class with Distinction from Anna University.`;
    }

    // Contact info
    if (questionType === 'contact') {
      let res = '📧 Email: srinathmpro2001@gmail.com\n';
      res += '📱 Phone: +91 8144429317\n';
      res += '📍 Location: Tindivanam, Tamil Nadu, India\n';
      res += '💻 GitHub: github.com/srinath-manivannan\n';
      res += '🔗 LinkedIn: linkedin.com/in/srinath-manivannan-57a751197';
      return res;
    }

    // Location
    if (questionType === 'location') {
      if (/work/.test(question.toLowerCase())) {
        return `Currently working remotely at Vanan Services (New York-based company). Based in Tindivanam, Tamil Nadu, India.`;
      }
      if (/study|college|university/.test(question.toLowerCase())) {
        return `Graduated from Mailam Engineering College, Anna University, Tamil Nadu.`;
      }
      return `Based in Tindivanam, Tamil Nadu, India. Works remotely for global companies.`;
    }

    // About/Introduction
    if (questionType === 'about' || intents.includes('about')) {
      return `Srinath Manivannan is an AI-Focused Full-Stack Engineer with ${getTotalExperience()} years of experience.\n\n🚀 Specializes in:\n• MERN Stack & Next.js\n• AI Automation & N8N Workflows\n• Cloud Architecture (AWS S3, Cloudflare R2)\n• Agentic AI & GPT Integration\n\n🏆 Achievements:\n• Best Outgoing Student Award (8.7 CGPA)\n• Projects featured on SUN TV (150K+ viewers)\n• CEO Appreciation at Vanan Services\n\n💼 Currently: Web App Developer - AI at Vanan Services (Remote, NY)`;
    }

    // ADVANCED SEARCH - Use comprehensive matching

    const relevantExperience = data.experiences.filter(e =>
      allKeywords.some(k =>
        e.company?.toLowerCase().includes(k) ||
        e.role?.toLowerCase().includes(k) ||
        e.location?.toLowerCase().includes(k) ||
        e.work_type?.toLowerCase().includes(k) ||
        e.description?.some((d: string) => d.toLowerCase().includes(k)) ||
        e.technologies?.some((t: string) => t.toLowerCase().includes(k))
      )
    );

    const relevantProjects = data.projects.filter(p =>
      allKeywords.some(k =>
        p.title?.toLowerCase().includes(k) ||
        p.description?.toLowerCase().includes(k) ||
        p.short_description?.toLowerCase().includes(k) ||
        p.category?.toLowerCase().includes(k) ||
        p.tech_stack?.some((t: string) => t.toLowerCase().includes(k))
      )
    );

    const relevantSkills = data.skills.filter(s =>
      allKeywords.some(k =>
        s.name?.toLowerCase().includes(k) ||
        s.category?.toLowerCase().includes(k)
      )
    );

    const relevantCerts = data.certifications.filter(c =>
      allKeywords.some(k =>
        c.title?.toLowerCase().includes(k) ||
        c.issuer?.toLowerCase().includes(k)
      )
    );

    const relevantAchievements = data.achievements.filter(a =>
      allKeywords.some(k =>
        a.title?.toLowerCase().includes(k) ||
        a.description?.toLowerCase().includes(k) ||
        a.institution?.toLowerCase().includes(k)
      )
    );

    const relevantEducation = data.education.filter(e =>
      allKeywords.some(k =>
        e.degree?.toLowerCase().includes(k) ||
        e.institution?.toLowerCase().includes(k) ||
        e.field?.toLowerCase().includes(k)
      )
    );

    // Response formatters
    const fmtProject = (p: any, i: number) => {
      const tech = (p.tech_stack || []).slice(0, 6).join(', ');
      const desc = (p.short_description || p.description || '').toString().slice(0, 100);
      const badges = [];
      if (p.featured) badges.push('⭐ Featured');
      if (p.live_url) badges.push('🔗 Live');
      
      return `${i}. ${p.title}${badges.length ? ` (${badges.join(', ')})` : ''}\n   ${desc}${desc.length >= 100 ? '...' : ''}\n   Tech: ${tech}`;
    };

    const fmtExp = (e: any) => {
      const tech = e.technologies?.slice(0, 5).join(', ') || '';
      return `• ${e.role} at ${e.company}\n  Duration: ${e.duration} | ${e.work_type || 'Full-time'}${tech ? `\n  Tech: ${tech}` : ''}`;
    };

    const fmtSkill = (s: any) => `• ${s.name} (${s.category}) — ${s.proficiency ?? 'Expert'}% proficiency${s.years_experience ? ` | ${s.years_experience}+ years` : ''}`;
    const fmtCert = (c: any) => `• ${c.title} — ${c.issuer}${c.issue_date ? ` (${new Date(c.issue_date).getFullYear()})` : ''}`;
    const fmtAchievement = (a: any) => `🏆 ${a.title}\n   ${a.description?.slice(0, 120)}${a.institution ? `\n   By: ${a.institution}` : ''}`;
    const fmtEducation = (e: any) => `🎓 ${e.degree} - ${e.field}\n   ${e.institution} (${e.start_year} - ${e.end_year})${e.cgpa ? `\n   CGPA: ${e.cgpa}` : ''}${e.grade ? ` | ${e.grade}` : ''}`;

    // INTENT-BASED DETAILED RESPONSES

    // Achievements
    if (questionType === 'achievements' || intents.includes('achievements') || relevantAchievements.length > 0) {
      const achievementsToShow = relevantAchievements.length > 0 ? relevantAchievements : data.achievements;
      if (achievementsToShow.length === 0) {
        return `Notable achievements:\n\n🏆 Best Outgoing Student Award (2019-2023)\n🏆 Best Engineering Project Award - Anna University\n🏆 CEO Appreciation - Vanan Services (July 2025)\n📺 Featured on SUN TV - 150,000+ viewers`;
      }
      return `Achievements:\n\n${achievementsToShow.slice(0, 4).map((a: any) => fmtAchievement(a)).join('\n\n')}`;
    }

    // Education
    if (questionType === 'education' || intents.includes('education') || relevantEducation.length > 0) {
      const eduToShow = relevantEducation.length > 0 ? relevantEducation : data.education;
      if (eduToShow.length === 0) {
        return `B.E. Electronics and Communication Engineering\nMailam Engineering College, Anna University\n2019 - 2023\n\nCGPA: 8.7 (First Class with Distinction)\n\n🏆 Best Outgoing Student Award`;
      }
      return `Education:\n\n${eduToShow.slice(0, 2).map((e: any) => fmtEducation(e)).join('\n\n')}`;
    }

    // Experience
    if (questionType === 'experience' || intents.includes('experience') || relevantExperience.length > 0) {
      if (relevantExperience.length === 0 && !intents.includes('experience')) {
        // Fallback to showing all
        return `Work Experience (${getTotalExperience()} years):\n\n${(data.experiences || []).slice(0, 3).map((e: any) => `• ${e.role} at ${e.company} (${e.duration})`).join('\n')}`;
      }
      
      const expToShow = relevantExperience.length > 0 ? relevantExperience : data.experiences;
      
      // If asking about specific company, show detailed
      if (expToShow.length <= 2) {
        return `Relevant Experience:\n\n${expToShow.map((e: any) => fmtExp(e)).join('\n\n')}`;
      }
      
      return `Experience (${getTotalExperience()} years):\n\n${expToShow.slice(0, 4).map((e: any) => fmtExp(e)).join('\n\n')}`;
    }

    // Projects
    if (questionType === 'projects' || intents.includes('projects') || relevantProjects.length > 0) {
      if (relevantProjects.length === 0 && !intents.includes('projects')) {
        return `Recent projects:\n\n${(data.projects || []).slice(0, 3).map((p: any, i: number) => fmtProject(p, i + 1)).join('\n\n')}`;
      }
      
      const projToShow = relevantProjects.length > 0 ? relevantProjects : data.projects;
      return `Relevant Projects (${projToShow.length} found):\n\n${projToShow.slice(0, 4).map((p: any, i: number) => fmtProject(p, i + 1)).join('\n\n')}`;
    }

    // Skills
    if (questionType === 'skills' || intents.includes('skills') || relevantSkills.length > 0) {
      if (relevantSkills.length === 0) {
        const topSkills = (data.skills || [])
          .sort((a: any, b: any) => (b.proficiency || 0) - (a.proficiency || 0))
          .slice(0, 8)
          .map((s: any) => s.name)
          .join(', ');
        return `Top Skills:\n${topSkills}`;
      }
      
      return `Skills:\n\n${relevantSkills.slice(0, 6).map((s: any) => fmtSkill(s)).join('\n')}`;
    }

    // Certifications
    if (questionType === 'certifications' || intents.includes('certifications') || relevantCerts.length > 0) {
      const certsToShow = relevantCerts.length > 0 ? relevantCerts : data.certifications;
      return `Certifications (${certsToShow.length}):\n\n${certsToShow.slice(0, 6).map((c: any) => fmtCert(c)).join('\n')}`;
    }

    // Default: Show everything found
    const totalFound = relevantProjects.length + relevantExperience.length + relevantSkills.length + relevantCerts.length + relevantAchievements.length + relevantEducation.length;

    if (totalFound === 0) {
      return `No specific results for "${question}".\n\nTry asking:\n• "Who is Srinath?"\n• "Show me Capgemini experience"\n• "What AI projects?"\n• "How many years experience?"\n• "What awards did you win?"\n• "Where did you study?"`;
    }

    let res = `Found ${totalFound} relevant items:\n\n`;
    
    if (relevantExperience.length) {
      res += `💼 Experience:\n${relevantExperience.slice(0, 2).map((e: any) => `• ${e.role} at ${e.company}`).join('\n')}\n\n`;
    }
    
    if (relevantProjects.length) {
      res += `📁 Projects:\n${relevantProjects.slice(0, 3).map((p: any) => `• ${p.title}`).join('\n')}\n\n`;
    }
    
    if (relevantSkills.length) {
      res += `💪 Skills:\n${relevantSkills.slice(0, 4).map((s: any) => `• ${s.name}`).join('\n')}\n\n`;
    }
    
    if (relevantAchievements.length) {
      res += `🏆 Achievements:\n${relevantAchievements.slice(0, 2).map((a: any) => `• ${a.title}`).join('\n')}\n\n`;
    }
    
    if (relevantEducation.length) {
      res += `🎓 Education:\n${relevantEducation.slice(0, 1).map((e: any) => `• ${e.degree} - ${e.institution}`).join('\n')}`;
    }

    return res.trim();
  }

  // ===== UI BEHAVIOR =====

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    "Who is Srinath?",
    "How many years experience?",
    "Capgemini experience?",
    "Show AI projects",
    "What awards won?",
    "Where did you study?",
    "React skills?",
    "Contact info?"
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
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      const response = generateRAGResponse(userMessage, data);
      await simulateAssistantStream(response);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error accessing portfolio data.' }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }

  async function simulateAssistantStream(full: string) {
    const chunkSize = 140;
    let accum = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '', ts: Date.now() }]);
    for (let i = 0; i < Math.ceil(full.length / chunkSize); i++) {
      const nextChunk = full.slice(i * chunkSize, (i + 1) * chunkSize);
      accum += nextChunk;
      setMessages(prev => {
        const copy = [...prev];
        const lastIdx = copy.map(m => m.role).lastIndexOf('assistant');
        if (lastIdx >= 0) copy[lastIdx] = { ...copy[lastIdx], content: accum };
        return copy;
      });
      await new Promise(r => setTimeout(r, 150 + Math.random() * 100));
    }
  }

  function handleQuickClick(q: string) {
    setInput(q);
    setTimeout(() => handleSend(), 200);
  }

  const variants = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } } },
    message: { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
  };

  const userBubbleStyle = { background: `linear-gradient(90deg, ${css.primary}, ${css.accent})`, color: 'white' };
  const assistantStyle = { background: css.cardBg, color: css.foreground, border: '1px solid rgba(255,255,255,0.04)' };

  return (
    <>
      <style>{`
        .chat-messages::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .chat-messages {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div className="fixed right-6 bottom-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: 64,
                height: 64,
                background: 'transparent',
                border: `2px solid rgba(255,255,255,0.12)`,
                boxShadow: '0 8px 20px rgba(2,6,23,0.6)'
              }}
              whileHover={{ scale: 1.08 }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

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
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(90deg, ${css.primary}, ${css.accent})` }}>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-white" />
                <div>
                  <div className="font-semibold text-white">Ask Srinath (Advanced RAG)</div>
                  <div className="text-xs text-white/80">AI-powered portfolio search</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs">
                  <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Analyzing...' : 'Ready'}</span>
                </div>
                <button onClick={() => { setIsOpen(false); setMessages([]); setQuickVisible(true); }} className="p-1 rounded-md bg-white/10 hover:bg-white/12">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.02), transparent)` }}>
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: css.foreground }}>Ask anything about Srinath</div>
                    <div className="text-xs" style={{ color: css.muted }}>Advanced semantic search & fuzzy matching</div>
                  </div>
                  <Zap className="w-5 h-5 text-[color:var(--foreground)]" />
                </div>
              </motion.div>

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

              <motion.div variants={variants.container} initial="hidden" animate="show" className="space-y-3">
                {messages.map((m, i) => {
                  const isUser = m.role === 'user';
                  return (
                    <motion.div key={m.ts ?? i} variants={variants.message} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-xl shadow-sm break-words`}
                        style={isUser ? userBubbleStyle : assistantStyle}
                      >
                        <div className="text-sm whitespace-pre-wrap">{m.content}</div>
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

            <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.03)', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.02))' }}>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask: 'capgimini', 'cgpa', 'awards', 'projects'..."
                  className="flex-1 rounded-md px-4 py-2 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    color: css.foreground
                  }}
                />
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
              <div className="text-xs text-center mt-2" style={{ color: css.muted }}>
                🧠 Advanced RAG: Semantic search + Fuzzy matching
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}