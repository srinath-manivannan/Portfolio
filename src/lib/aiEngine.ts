/* eslint-disable @typescript-eslint/no-explicit-any */

interface PortfolioData {
  projects: any[];
  experiences: any[];
  skills: any[];
  certifications: any[];
  achievements: any[];
  education: any[];
  profile: any;
}

interface ConversationContext {
  lastTopic: string | null;
  mentionedEntities: string[];
  questionCount: number;
  sentiment: 'positive' | 'neutral' | 'curious';
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'of', 'in', 'to',
  'for', 'with', 'on', 'at', 'from', 'by', 'about', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
  'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
  'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very',
  'just', 'because', 'if', 'when', 'what', 'which', 'who', 'whom',
  'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we',
  'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its',
  'they', 'them', 'their', 'how', 'where', 'why', 'tell', 'show',
  'give', 'get', 'know', 'think', 'want', 'need', 'please', 'many',
  'much', 'also', 'like', 'make',
]);

function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

function cosineSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const denom = Math.sqrt(setA.size) * Math.sqrt(setB.size);
  return denom > 0 ? intersection / denom : 0;
}

function fuzzyMatch(needle: string, haystack: string): boolean {
  if (haystack.includes(needle)) return true;
  if (needle.length < 3) return false;
  const n = needle.length;
  for (let i = 0; i <= haystack.length - n + 1; i++) {
    let mismatches = 0;
    for (let j = 0; j < n && i + j < haystack.length; j++) {
      if (needle[j] !== haystack[i + j]) mismatches++;
      if (mismatches > 1) break;
    }
    if (mismatches <= 1) return true;
  }
  return false;
}

function detectIntent(question: string): string {
  const q = question.toLowerCase();
  if (/how many.*year|years.*experience|total.*experience|how long/.test(q)) return 'experience_years';
  if (/contact|email|phone|reach|hire|message|get in touch|connect/.test(q)) return 'contact';
  if (/who|about|introduce|yourself|background|bio|story/.test(q)) return 'about';
  if (/project|built|portfolio|work|application|app|website|tool/.test(q)) return 'projects';
  if (/skill|tech|technology|stack|language|framework|proficiency|expert/.test(q)) return 'skills';
  if (/experience|company|job|role|position|career|capgemini|intern/.test(q)) return 'experience';
  if (/education|college|university|degree|school|study|cgpa/.test(q)) return 'education';
  if (/certif|cert|credential|badge|course|license/.test(q)) return 'certifications';
  if (/achieve|award|accomplish|recognition|honor|prize/.test(q)) return 'achievements';
  if (/ai|ml|machine learning|artificial|neural|nlp|llm|gpt|automation|agent/.test(q)) return 'ai_ml';
  if (/resume|cv|download/.test(q)) return 'resume';
  if (/available|freelance|open|opportunity|status/.test(q)) return 'availability';
  if (/location|where|based|live|city|country/.test(q)) return 'location';
  if (/salary|rate|cost|price|charge/.test(q)) return 'pricing';
  if (/hello|hi|hey|good|greet/.test(q)) return 'greeting';
  if (/thank|thanks|thx|appreciate/.test(q)) return 'thanks';
  if (/help|can you|what can/.test(q)) return 'help';
  if (/compare|vs|versus|difference|better/.test(q)) return 'compare';
  if (/recommend|suggest|best|top|favorite/.test(q)) return 'recommend';
  return 'general';
}

function detectSentiment(text: string): 'positive' | 'neutral' | 'curious' {
  const pos = /great|awesome|amazing|excellent|good|nice|love|fantastic|wonderful|impressed|cool/i;
  const curious = /\?|how|what|why|tell|show|explain|can|could|would/i;
  if (pos.test(text)) return 'positive';
  if (curious.test(text)) return 'curious';
  return 'neutral';
}

export function classifyMessage(text: string): { category: string; confidence: number; keywords: string[] } {
  const categories: Record<string, string[]> = {
    'Job Opportunity': ['job', 'hire', 'position', 'role', 'opening', 'opportunity', 'recruit', 'employment', 'offer', 'vacancy'],
    'Freelance Project': ['freelance', 'project', 'contract', 'gig', 'outsource', 'build', 'develop', 'create', 'website', 'app'],
    'Collaboration': ['collaborate', 'partner', 'together', 'team', 'join', 'open source', 'contribution', 'startup'],
    'Project Discussion': ['discuss', 'idea', 'concept', 'planning', 'architecture', 'design', 'solution', 'consulting'],
    'General Inquiry': ['question', 'ask', 'info', 'learn', 'curious', 'wonder', 'know'],
  };

  const tokens = tokenize(text);
  let bestCategory = 'General Inquiry';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(categories)) {
    const score = cosineSimilarity(tokens, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return {
    category: bestCategory,
    confidence: Math.min(bestScore * 3, 1),
    keywords: tokens.slice(0, 5),
  };
}

export function generateAIResponse(
  question: string,
  data: PortfolioData,
  context: ConversationContext
): { response: string; intent: string; followUps: string[]; context: Partial<ConversationContext> } {
  const intent = detectIntent(question);
  const tokens = tokenize(question);
  const sentiment = detectSentiment(question);
  const p = data.profile || {};

  let response = '';
  let followUps: string[] = [];
  const newContext: Partial<ConversationContext> = {
    lastTopic: intent,
    sentiment,
    questionCount: (context.questionCount || 0) + 1,
  };

  switch (intent) {
    case 'greeting': {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      response = `${greeting}! 👋 I'm Srinath's AI assistant. I can help you learn about his projects, skills, experience, and more. What would you like to know?`;
      followUps = ['Tell me about Srinath', 'Show top projects', 'What skills does he have?'];
      break;
    }

    case 'thanks': {
      response = "You're welcome! 😊 Feel free to ask anything else about Srinath's work and experience.";
      followUps = ['Show contact info', 'View projects', 'Tell me about AI work'];
      break;
    }

    case 'help': {
      response = `I can help you with:\n\n🧑 **About** — Background, bio, education\n💼 **Experience** — Work history, roles, companies\n🚀 **Projects** — Portfolio of built applications\n🛠 **Skills** — Technical proficiencies\n📜 **Certifications** — Credentials earned\n📧 **Contact** — How to reach Srinath\n🤖 **AI/ML** — AI & automation work\n\nJust ask naturally!`;
      followUps = ['Who is Srinath?', 'Show AI projects', 'Contact info'];
      break;
    }

    case 'experience_years': {
      const expCount = data.experiences?.length || 0;
      response = `Srinath has **3+ years** of professional experience across ${expCount} role${expCount !== 1 ? 's' : ''}, specializing in full-stack development, AI integration, and cloud architecture.`;
      followUps = ['What companies has he worked at?', 'Show projects', 'What technologies?'];
      break;
    }

    case 'contact': {
      response = `📧 **Email:** ${p.email || 'srinathmpro2001@gmail.com'}\n📱 **Phone:** ${p.phone || '+91 8144429317'}\n📍 **Location:** ${p.location || 'Tindivanam, Tamil Nadu, India'}\n🟢 **Status:** Open for opportunities\n\n🔗 [LinkedIn](https://www.linkedin.com/in/srinath-manivannan-57a751197/)\n🔗 [GitHub](https://github.com/srinath-manivannan)`;
      followUps = ['Show resume', 'What is he available for?', 'View projects'];
      break;
    }

    case 'about': {
      const name = p.name || 'Srinath Manivannan';
      const title = p.title || 'AI-Focused Full-Stack Engineer';
      const bio = p.bio || '';
      response = `**${name}** — ${title}\n\n${bio || 'An AI-focused full-stack software engineer with 3+ years of experience building scalable applications with MERN/Next.js, AI automation (n8n, LangChain), and cloud (AWS).'}\n\n🔑 **Key Strengths:** Full-Stack Development, AI/ML Integration, Cloud Architecture, Agentic Workflows`;
      followUps = ['Show education', 'View achievements', 'What technologies?'];
      break;
    }

    case 'resume': {
      if (p.resume_url) {
        response = `📄 You can download Srinath's resume here:\n\n🔗 [Download Resume](${p.resume_url})\n\nIt includes detailed experience, projects, and education history.`;
      } else {
        response = `Srinath's resume covers 3+ years of experience in full-stack development and AI. Please visit the contact page to request it directly.`;
      }
      followUps = ['Show experience', 'View projects', 'Contact info'];
      break;
    }

    case 'availability': {
      response = `🟢 **Currently available** for:\n\n• Full-time positions (remote/hybrid)\n• Freelance projects\n• Contract work\n• Consulting & collaboration\n\n⏱ **Response time:** Within 24 hours\n🌍 **Timezone:** IST (India Standard Time)`;
      followUps = ['Contact info', 'Show experience', 'View projects'];
      break;
    }

    case 'location': {
      response = `📍 Based in **${p.location || 'Tindivanam, Tamil Nadu, India'}**\n\n🌐 Open to **remote** opportunities worldwide\n✈️ Willing to relocate for the right opportunity`;
      followUps = ['Is he available?', 'Contact info', 'Show experience'];
      break;
    }

    case 'pricing': {
      response = `💰 Rates depend on project scope and complexity. Best to discuss directly!\n\n📧 Reach out at ${p.email || 'srinathmpro2001@gmail.com'} with your requirements for a custom quote.`;
      followUps = ['Contact info', 'Show projects', 'View experience'];
      break;
    }

    case 'projects': {
      const allProjects = data.projects || [];
      const matches = allProjects.filter((proj: any) => {
        const searchText = `${proj.title} ${proj.short_description} ${proj.description} ${(proj.tech_stack || []).join(' ')}`.toLowerCase();
        return tokens.some(t => fuzzyMatch(t, searchText));
      });

      const results = matches.length > 0 ? matches : allProjects;
      const display = results.slice(0, 4);

      if (display.length === 0) {
        response = "No projects found yet. Check back soon!";
      } else {
        const lines = display.map((proj: any, i: number) => {
          const tech = (proj.tech_stack || []).slice(0, 4).join(', ');
          const desc = (proj.short_description || proj.description || '').toString().slice(0, 120);
          return `**${i + 1}. ${proj.title}**\n   ${desc}${desc.length >= 120 ? '...' : ''}\n   🛠 ${tech}`;
        });
        response = `🚀 **Projects** (${results.length} total):\n\n${lines.join('\n\n')}`;
        if (results.length > 4) {
          response += `\n\n...and ${results.length - 4} more. Visit the Projects page for the full list!`;
        }
      }
      followUps = ['Show AI projects', 'What tech stack?', 'Contact info'];
      break;
    }

    case 'skills': {
      const allSkills = data.skills || [];
      const matches = allSkills.filter((s: any) =>
        tokens.some(t => fuzzyMatch(t, (s.name || '').toLowerCase()) || fuzzyMatch(t, (s.category || '').toLowerCase()))
      );

      const results = matches.length > 0 ? matches : allSkills.slice(0, 12);
      const grouped: Record<string, any[]> = {};
      results.forEach((s: any) => {
        const cat = s.category || 'Other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      });

      const lines = Object.entries(grouped).map(([cat, skills]) => {
        const list = skills.slice(0, 5).map((s: any) => `${s.name} (${s.proficiency}%)`).join(', ');
        return `**${cat}:** ${list}`;
      });

      response = `🛠 **Technical Skills** (${allSkills.length} total):\n\n${lines.join('\n\n')}`;
      const avgProf = allSkills.length > 0
        ? Math.round(allSkills.reduce((s: number, sk: any) => s + (sk.proficiency || 0), 0) / allSkills.length)
        : 0;
      response += `\n\n📊 Average proficiency: **${avgProf}%**`;
      followUps = ['Show expert skills', 'View projects', 'AI/ML skills?'];
      break;
    }

    case 'experience': {
      const exps = data.experiences || [];
      const matches = exps.filter((e: any) => {
        const text = `${e.company} ${e.role} ${e.description} ${(e.technologies || []).join(' ')}`.toLowerCase();
        return tokens.some(t => fuzzyMatch(t, text));
      });

      const results = matches.length > 0 ? matches : exps;
      const display = results.slice(0, 4);

      if (display.length === 0) {
        response = "Experience data is being updated. Check back soon!";
      } else {
        const lines = display.map((e: any, i: number) => {
          const tech = (e.technologies || []).slice(0, 4).join(', ');
          return `**${i + 1}. ${e.role}** at ${e.company}\n   📅 ${e.duration || 'Present'}\n   🛠 ${tech}`;
        });
        response = `💼 **Experience** (${results.length} positions):\n\n${lines.join('\n\n')}`;
      }
      followUps = ['How many years?', 'Show projects', 'What technologies?'];
      break;
    }

    case 'education': {
      const edu = data.education || [];
      if (edu.length === 0) {
        response = "Education data is being updated.";
      } else {
        const lines = edu.map((e: any) => {
          let line = `🎓 **${e.degree}**\n   ${e.institution}`;
          if (e.duration) line += `\n   📅 ${e.duration}`;
          if (e.cgpa) line += ` • CGPA: ${e.cgpa}`;
          return line;
        });
        response = `📚 **Education:**\n\n${lines.join('\n\n')}`;
      }
      followUps = ['Show achievements', 'View certifications', 'Experience?'];
      break;
    }

    case 'certifications': {
      const certs = data.certifications || [];
      if (certs.length === 0) {
        response = "No certifications listed yet.";
      } else {
        const display = certs.slice(0, 5);
        const lines = display.map((c: any, i: number) =>
          `${i + 1}. **${c.name}** — ${c.issuer || 'N/A'}${c.date ? ` (${new Date(c.date).getFullYear()})` : ''}`
        );
        response = `📜 **Certifications** (${certs.length} total):\n\n${lines.join('\n')}`;
      }
      followUps = ['Show skills', 'View education', 'Contact info'];
      break;
    }

    case 'achievements': {
      const achievements = data.achievements || [];
      if (achievements.length === 0) {
        response = "No achievements listed yet.";
      } else {
        const lines = achievements.slice(0, 4).map((a: any, i: number) =>
          `🏆 **${a.title}**\n   ${(a.description || '').slice(0, 100)}`
        );
        response = `🏅 **Achievements:**\n\n${lines.join('\n\n')}`;
      }
      followUps = ['Show education', 'View projects', 'Skills?'];
      break;
    }

    case 'ai_ml': {
      const aiProjects = (data.projects || []).filter((p: any) => {
        const text = `${p.title} ${p.description} ${(p.tech_stack || []).join(' ')}`.toLowerCase();
        return /ai|ml|machine|learning|neural|nlp|llm|gpt|automation|agent|langchain|n8n|openai/.test(text);
      });

      const aiSkills = (data.skills || []).filter((s: any) =>
        /ai|ml|machine|learning|neural|python|tensorflow|pytorch|nlp|automation/i.test(`${s.name} ${s.category}`)
      );

      response = `🤖 **AI & Machine Learning:**\n\n`;
      if (aiProjects.length > 0) {
        response += `**AI Projects (${aiProjects.length}):**\n`;
        aiProjects.slice(0, 3).forEach((p: any, i: number) => {
          response += `${i + 1}. **${p.title}** — ${(p.short_description || '').slice(0, 80)}\n`;
        });
      }
      if (aiSkills.length > 0) {
        response += `\n**AI Skills:** ${aiSkills.map((s: any) => s.name).join(', ')}`;
      }
      response += `\n\n💡 Specializes in n8n workflows, LangChain agents, and LLM integration.`;
      followUps = ['Show all projects', 'Contact for AI project', 'View all skills'];
      break;
    }

    case 'compare': {
      response = `Srinath's comparative strengths:\n\n✅ **Full-Stack + AI** — Rare combination of deep MERN expertise with AI/ML integration\n✅ **Automation** — Expert in n8n and agentic workflows\n✅ **End-to-End** — Can handle frontend, backend, DevOps, and AI in one person\n✅ **Modern Stack** — Always using latest React, Next.js, TypeScript`;
      followUps = ['Show projects', 'View skills', 'Contact info'];
      break;
    }

    case 'recommend': {
      const featured = (data.projects || []).filter((p: any) => p.featured).slice(0, 3);
      const topSkills = (data.skills || []).filter((s: any) => s.proficiency >= 85).slice(0, 5);

      response = `⭐ **Top Recommendations:**\n\n`;
      if (featured.length > 0) {
        response += `**Best Projects:**\n`;
        featured.forEach((p: any, i: number) => {
          response += `${i + 1}. **${p.title}** — ${(p.short_description || '').slice(0, 80)}\n`;
        });
      }
      if (topSkills.length > 0) {
        response += `\n**Expert Skills:** ${topSkills.map((s: any) => `${s.name} (${s.proficiency}%)`).join(', ')}`;
      }
      followUps = ['Show all projects', 'Contact info', 'View experience'];
      break;
    }

    default: {
      const allText = [
        ...(data.projects || []).map((p: any) => ({ type: 'project', item: p, text: `${p.title} ${p.short_description} ${p.description} ${(p.tech_stack || []).join(' ')}` })),
        ...(data.skills || []).map((s: any) => ({ type: 'skill', item: s, text: `${s.name} ${s.category}` })),
        ...(data.experiences || []).map((e: any) => ({ type: 'experience', item: e, text: `${e.company} ${e.role} ${e.description} ${(e.technologies || []).join(' ')}` })),
      ];

      const scored = allText.map(entry => ({
        ...entry,
        score: cosineSimilarity(tokens, tokenize(entry.text)),
      })).filter(e => e.score > 0).sort((a, b) => b.score - a.score);

      if (scored.length > 0) {
        const top = scored.slice(0, 3);
        const lines = top.map(entry => {
          if (entry.type === 'project') {
            return `🚀 **Project:** ${entry.item.title} — ${(entry.item.short_description || '').slice(0, 80)}`;
          } else if (entry.type === 'skill') {
            return `🛠 **Skill:** ${entry.item.name} (${entry.item.proficiency}%)`;
          } else {
            return `💼 **Experience:** ${entry.item.role} at ${entry.item.company}`;
          }
        });
        response = `Here's what I found related to your query:\n\n${lines.join('\n\n')}`;
      } else {
        response = `I couldn't find a specific match. Here are things I can help with:\n\n🧑 About Srinath\n🚀 Projects & portfolio\n🛠 Skills & technologies\n💼 Work experience\n📧 Contact information\n🤖 AI/ML expertise\n\nTry asking something specific!`;
      }
      followUps = ['Who is Srinath?', 'Show projects', 'Contact info'];
    }
  }

  if (context.questionCount > 0 && context.questionCount % 3 === 0) {
    response += `\n\n💡 *Tip: You can also explore the full portfolio using the navigation above!*`;
  }

  return { response, intent, followUps, context: newContext };
}

export function getSmartGreeting(): string {
  const hour = new Date().getHours();
  const isReturning = sessionStorage.getItem('portfolio_visited') === 'true';
  sessionStorage.setItem('portfolio_visited', 'true');

  if (isReturning) {
    return 'Welcome back! How can I help you today?';
  }

  if (hour < 6) return '🌙 Burning the midnight oil? Let me help you explore.';
  if (hour < 12) return '☀️ Good morning! Ready to explore my portfolio?';
  if (hour < 17) return '🌤 Good afternoon! What would you like to know?';
  if (hour < 21) return '🌆 Good evening! Feel free to explore around.';
  return '🌙 Late night visitor! I appreciate the curiosity.';
}

export function getTimeBasedSuggestions(): string[] {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  if (day === 0 || day === 6) {
    return ['Show weekend projects', 'Freelance availability?', 'View AI work'];
  }
  if (hour < 12) {
    return ['Show latest projects', 'Contact info', 'View resume'];
  }
  return ['Show top skills', 'AI/ML expertise?', 'Work experience'];
}
