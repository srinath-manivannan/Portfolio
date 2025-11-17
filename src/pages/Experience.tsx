/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { MapPin, Calendar, Briefcase } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { Badge } from '@/components/ui/badge';

// export default function Experience() {
//   const [experiences, setExperiences] = useState<any[]>([]);

//   useEffect(() => {
//     fetchExperiences();
//   }, []);

//   const fetchExperiences = async () => {
//     const { data } = await supabase
//       .from('experiences')
//       .select('*')
//       .order('display_order');
//     if (data) setExperiences(data);
//   };

//   return (
//     <div className="min-h-screen pt-20 pb-20 px-4">
//       <div className="container mx-auto max-w-4xl">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-16"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Work Experience</h1>
//           <p className="text-lg text-muted-foreground">My professional journey</p>
//         </motion.div>

//         {/* Timeline */}
//         <div className="relative">
//           {/* Vertical line */}
//           <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30" />

//           {experiences.map((exp, index) => (
//             <motion.div
//               key={exp.id}
//               initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               className={`relative mb-12 md:mb-16 ${
//                 index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:ml-auto'
//               }`}
//             >
//               {/* Timeline dot */}
//               <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary transform -translate-x-1/2 border-4 border-background animate-glow" />

//               {/* Content Card */}
//               <div className="ml-16 md:ml-0 glassmorphic rounded-2xl p-6 md:p-8 hover-lift">
//                 {/* Header */}
//                 <div className="mb-4">
//                   <h3 className="text-2xl font-bold mb-2">{exp.role}</h3>
//                   <p className="text-xl gradient-text font-semibold">{exp.company}</p>
//                 </div>

//                 {/* Meta Info */}
//                 <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="w-4 h-4" />
//                     <span>{exp.duration}</span>
//                   </div>
//                   {exp.location && (
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-4 h-4" />
//                       <span>{exp.location}</span>
//                     </div>
//                   )}
//                   {exp.work_type && (
//                     <div className="flex items-center gap-2">
//                       <Briefcase className="w-4 h-4" />
//                       <span>{exp.work_type}</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Description */}
//                 {exp.description && (
//                   <ul className="space-y-2 mb-6 text-muted-foreground">
//                     {exp.description.map((item: string, i: number) => (
//                       <li key={i} className="flex gap-2">
//                         <span className="text-primary mt-1.5">•</span>
//                         <span>{item}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 )}

//                 {/* Technologies */}
//                 {exp.technologies && (
//                   <div className="flex flex-wrap gap-2">
//                     {exp.technologies.map((tech: string) => (
//                       <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
//                         {tech}
//                       </Badge>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

export default function Experience() {
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    const { data } = await supabase
      .from('experiences')
      .select('*')
      .order('display_order');
    if (data) setExperiences(data);
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Work Experience</h1>
          <p className="text-lg text-muted-foreground">My professional journey</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary opacity-30" />

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative mb-12 md:mb-16 ${
                index % 2 === 0 ? 'md:pr-1/2' : 'md:pl-1/2 md:ml-auto'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary transform -translate-x-1/2 border-4 border-background animate-glow" />

              {/* Content Card - ALL TEXT LEFT ALIGNED */}
              <div className="ml-16 md:ml-0 glassmorphic rounded-2xl p-6 md:p-8 hover-lift text-left">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold mb-2 text-left">{exp.role}</h3>
                  <p className="text-xl gradient-text font-semibold text-left">{exp.company}</p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{exp.duration}</span>
                  </div>
                  {exp.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                  {exp.work_type && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{exp.work_type}</span>
                    </div>
                  )}
                </div>

                {/* Description - LEFT ALIGNED */}
                {exp.description && (
                  <ul className="space-y-2 mb-6 text-muted-foreground text-left">
                    {exp.description.map((item: string, i: number) => (
                      <li key={i} className="flex gap-2 items-start text-left">
                        <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                        <span className="flex-1 text-left">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Technologies - LEFT ALIGNED */}
                {exp.technologies && (
                  <div className="flex flex-wrap gap-2 justify-start">
                    {exp.technologies.map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}