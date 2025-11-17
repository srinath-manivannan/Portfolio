import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  ArrowLeft,
  Eye,
  GripVertical,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ResumeData {
  profile: any;
  experiences: any[];
  projects: any[];
  skills: any[];
  education: any[];
  certifications: any[];
  achievements: any[];
}

interface Section {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

const defaultSections: Section[] = [
  { id: 'profile', name: 'Profile Summary', visible: true, order: 0 },
  { id: 'experience', name: 'Work Experience', visible: true, order: 1 },
  { id: 'projects', name: 'Projects', visible: true, order: 2 },
  { id: 'skills', name: 'Skills', visible: true, order: 3 },
  { id: 'education', name: 'Education', visible: true, order: 4 },
  { id: 'certifications', name: 'Certifications', visible: true, order: 5 },
  { id: 'achievements', name: 'Achievements', visible: true, order: 6 },
];

const templateStyles = {
  classic: {
    name: 'Classic Professional',
    fonts: 'font-serif',
    spacing: 'space-y-4',
    headingStyle: 'text-2xl font-bold border-b-2 border-primary pb-2 mb-4'
  },
  modern: {
    name: 'Modern Minimal',
    fonts: 'font-sans',
    spacing: 'space-y-6',
    headingStyle: 'text-xl font-semibold text-primary mb-3'
  },
  creative: {
    name: 'Creative Bold',
    fonts: 'font-sans',
    spacing: 'space-y-5',
    headingStyle: 'text-2xl font-bold bg-primary text-primary-foreground px-3 py-1 mb-4'
  },
  ats: {
    name: 'ATS Optimized',
    fonts: 'font-mono',
    spacing: 'space-y-3',
    headingStyle: 'text-lg font-bold uppercase mb-2'
  }
};

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templateStyles>('modern');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [fontSize, setFontSize] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to access resume builder');
      navigate('/admin/login');
      return;
    }
    fetchResumeData();
    fetchVersions();
  }, [user, navigate]);

  const fetchResumeData = async () => {
    setLoading(true);
    try {
      const [profileData, experiencesData, projectsData, skillsData, educationData, certificationsData, achievementsData] = await Promise.all([
        supabase.from('profiles').select('*').single(),
        supabase.from('experiences').select('*').order('display_order'),
        supabase.from('projects').select('*').eq('featured', true).order('display_order').limit(5),
        supabase.from('skills').select('*').order('display_order'),
        supabase.from('education').select('*').order('display_order'),
        supabase.from('certifications').select('*').order('display_order').limit(5),
        supabase.from('achievements').select('*').order('display_order').limit(5)
      ]);

      setResumeData({
        profile: profileData.data,
        experiences: experiencesData.data || [],
        projects: projectsData.data || [],
        skills: skillsData.data || [],
        education: educationData.data || [],
        certifications: certificationsData.data || [],
        achievements: achievementsData.data || []
      });
    } catch (error) {
      console.error('Error fetching resume data:', error);
      toast.error('Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setVersions(data);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, visible: !s.visible } : s
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items.map((item, index) => ({ ...item, order: index })));
  };

  const generatePDF = async () => {
    if (!resumeData || !user) return;

    setLoading(true);
    try {
      const { data: versionData } = await supabase
        .from('resume_versions')
        .select('version_number')
        .eq('user_id', user.id)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versionData && versionData.length > 0 ? versionData[0].version_number + 1 : 1;

      const { error } = await supabase
        .from('resume_versions')
        .insert([{
          user_id: user.id,
          template_id: selectedTemplate,
          generated_data: {
            ...resumeData,
            sections: sections.map(s => ({ ...s })),
            template: selectedTemplate,
            accentColor,
            fontSize
          } as any,
          version_number: nextVersion
        }]);

      if (error) throw error;

      toast.success(`Resume v${nextVersion} saved successfully!`);
      window.print();
      fetchVersions();
    } catch (error) {
      console.error('Resume generation error:', error);
      toast.error('Failed to save resume');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: Section) => {
    if (!section.visible || !resumeData) return null;

    const template = templateStyles[selectedTemplate];

    switch (section.id) {
      case 'profile':
        return resumeData.profile && (
          <div key={section.id} className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{resumeData.profile.name}</h1>
            <p className="text-xl text-muted-foreground mb-2">{resumeData.profile.title}</p>
            <p className="text-sm mb-4">{resumeData.profile.bio}</p>
            <div className="flex gap-4 text-sm flex-wrap">
              {resumeData.profile.email && <span>{resumeData.profile.email}</span>}
              {resumeData.profile.phone && <span>{resumeData.profile.phone}</span>}
              {resumeData.profile.location && <span>{resumeData.profile.location}</span>}
            </div>
          </div>
        );

      case 'experience':
        return resumeData.experiences.length > 0 && (
          <div key={section.id} className="mb-6">
            <h2 className={template.headingStyle}>Work Experience</h2>
            <div className={template.spacing}>
              {resumeData.experiences.map((exp, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{exp.role}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{exp.duration}</span>
                  </div>
                  {exp.description && Array.isArray(exp.description) && (
                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                      {exp.description.slice(0, 3).map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {exp.technologies && Array.isArray(exp.technologies) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.technologies.slice(0, 5).map((tech: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return resumeData.projects.length > 0 && (
          <div key={section.id} className="mb-6">
            <h2 className={template.headingStyle}>Featured Projects</h2>
            <div className={template.spacing}>
              {resumeData.projects.map((project, idx) => (
                <div key={idx} className="mb-3">
                  <h3 className="font-bold">{project.title}</h3>
                  <p className="text-sm">{project.short_description || project.description}</p>
                  {project.tech_stack && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.tech_stack.slice(0, 5).map((tech: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{tech}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        return resumeData.skills.length > 0 && (
          <div key={section.id} className="mb-6">
            <h2 className={template.headingStyle}>Skills</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(
                resumeData.skills.reduce((acc: any, skill: any) => {
                  if (!acc[skill.category]) acc[skill.category] = [];
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})
              ).map(([category, skills]: [string, any]) => (
                <div key={category}>
                  <p className="font-semibold text-sm">{category}</p>
                  <p className="text-xs text-muted-foreground">{skills.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return resumeData.education.length > 0 && (
          <div key={section.id} className="mb-6">
            <h2 className={template.headingStyle}>Education</h2>
            <div className={template.spacing}>
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{edu.duration}</span>
                  </div>
                  {edu.cgpa && <p className="text-sm">CGPA: {edu.cgpa}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        return resumeData.certifications.length > 0 && (
          <div key={section.id} className="mb-6">
            <h2 className={template.headingStyle}>Certifications</h2>
            <div className={template.spacing}>
              {resumeData.certifications.map((cert, idx) => (
                <div key={idx} className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{cert.title}</p>
                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  </div>
                  {cert.issue_date && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(cert.issue_date).getFullYear()}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        return resumeData.achievements.length > 0 && (
          <div key={section.id} className="mb-6">
            <h2 className={template.headingStyle}>Achievements</h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              {resumeData.achievements.map((achievement, idx) => (
                <li key={idx}>{achievement.title}</li>
              ))}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/admin/dashboard" 
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Resume Builder</h1>
                <p className="text-sm text-muted-foreground">Design your professional resume</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchResumeData} variant="outline" size="sm" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Pull Latest Data
              </Button>
              <Button onClick={generatePDF} disabled={loading || !resumeData}>
                <Download className="h-4 w-4 mr-2" />
                Save & Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Template Style
              </h3>
              <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templateStyles).map(([key, style]) => (
                    <SelectItem key={key} value={key}>{style.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Section Visibility
              </h3>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {sections.map((section, index) => (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md"
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="flex-1 text-sm">{section.name}</span>
                              <Switch
                                checked={section.visible}
                                onCheckedChange={() => handleSectionToggle(section.id)}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Customization
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">Accent Color</Label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Font Size</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Version History
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {versions.map((version) => (
                  <div key={version.id} className="text-sm p-2 bg-secondary/50 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Version {version.version_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {versions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No versions yet</p>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-8 min-h-[1000px] print:shadow-none">
              <div 
                className={`resume-preview ${templateStyles[selectedTemplate].fonts} ${
                  fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'
                }`}
                style={{ 
                  '--accent-color': accentColor,
                  color: 'var(--foreground)'
                } as any}
              >
                {resumeData ? (
                  sections
                    .sort((a, b) => a.order - b.order)
                    .map(section => renderSection(section))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No resume data available. Pull latest data to begin.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-preview, .resume-preview * {
            visibility: visible;
          }
          .resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
