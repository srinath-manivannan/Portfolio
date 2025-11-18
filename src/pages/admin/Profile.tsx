/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { motion } from 'framer-motion';
// import { Upload, Save, Loader2, ArrowLeft } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { Switch } from '@/components/ui/switch';
// import { toast } from 'sonner';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// const profileSchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters'),
//   title: z.string().min(2, 'Title is required'),
//   tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
//   bio: z.string().min(50, 'Bio must be at least 50 characters'),
//   email: z.string().email('Invalid email address').optional().or(z.literal('')),
//   phone: z.string().optional(),
//   location: z.string().optional(),
//   github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
//   linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
//   twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
//   availability_status: z.boolean(),
// });

// type ProfileFormData = z.infer<typeof profileSchema>;

// export default function Profile() {
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState<any>(null);
//   const [avatarFile, setAvatarFile] = useState<File | null>(null);
//   const [avatarPreview, setAvatarPreview] = useState<string>('');
//   const [resumeFile, setResumeFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const form = useForm<ProfileFormData>({
//     resolver: zodResolver(profileSchema),
//     defaultValues: {
//       name: '',
//       title: '',
//       tagline: '',
//       bio: '',
//       email: '',
//       phone: '',
//       location: '',
//       github_url: '',
//       linkedin_url: '',
//       twitter_url: '',
//       availability_status: true,
//     },
//   });

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   const fetchProfile = async () => {
//     const { data } = await supabase.from('profiles').select('*').maybeSingle();
//     if (data) {
//       setProfile(data);
//       setAvatarPreview(data.profile_image || '');
//       form.reset({
//         name: data.name || '',
//         title: data.title || '',
//         tagline: data.tagline || '',
//         bio: data.bio || '',
//         email: data.email || '',
//         phone: data.phone || '',
//         location: data.location || '',
//         github_url: data.github_url || '',
//         linkedin_url: data.linkedin_url || '',
//         twitter_url: data.twitter_url || '',
//         availability_status: data.availability_status ?? true,
//       });
//     }
//   };

//   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error('File size must be less than 5MB');
//         return;
//       }
//       setAvatarFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setAvatarPreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 10 * 1024 * 1024) {
//         toast.error('Resume size must be less than 10MB');
//         return;
//       }
//       if (file.type !== 'application/pdf') {
//         toast.error('Only PDF files are allowed');
//         return;
//       }
//       setResumeFile(file);
//       toast.success('Resume selected');
//     }
//   };

//   const uploadAvatar = async () => {
//     if (!avatarFile) return profile?.profile_image;

//     setUploading(true);
//     try {
//       const fileExt = avatarFile.name.split('.').pop();
//       const fileName = `avatar-${Date.now()}.${fileExt}`;
      
//       const { error: uploadError, data } = await supabase.storage
//         .from('profile-images')
//         .upload(fileName, avatarFile, { upsert: true });

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('profile-images')
//         .getPublicUrl(fileName);

//       return publicUrl;
//     } catch (error: any) {
//       toast.error('Failed to upload avatar: ' + error.message);
//       return profile?.profile_image;
//     } finally {
//       setUploading(false);
//     }
//   };

//   const uploadResume = async () => {
//     if (!resumeFile) return profile?.resume_url;

//     try {
//       const fileName = `resume-${Date.now()}.pdf`;
      
//       const { error: uploadError } = await supabase.storage
//         .from('resumes')
//         .upload(fileName, resumeFile, { upsert: true });

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('resumes')
//         .getPublicUrl(fileName);

//       return publicUrl;
//     } catch (error: any) {
//       toast.error('Failed to upload resume: ' + error.message);
//       return profile?.resume_url;
//     }
//   };

//   const onSubmit = async (data: ProfileFormData) => {
//     try {
//       setUploading(true);
//       const avatarUrl = await uploadAvatar();
//       const resumeUrl = await uploadResume();

//       const updateData = {
//         ...data,
//         profile_image: avatarUrl,
//         resume_url: resumeUrl,
//       };

//       if (profile) {
//         const { error } = await supabase
//           .from('profiles')
//           .update(updateData)
//           .eq('id', profile.id);

//         if (error) throw error;
//         toast.success('Profile updated successfully');
//       } else {
//         const { error } = await supabase
//           .from('profiles')
//           .insert([{ ...updateData, user_id: (await supabase.auth.getUser()).data.user?.id }]);

//         if (error) throw error;
//         toast.success('Profile created successfully');
//       }

//       fetchProfile();
//       setResumeFile(null);
//     } catch (error: any) {
//       toast.error('Failed to save profile: ' + error.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen pt-20 pb-20 px-4">
//       <div className="container mx-auto max-w-4xl">
//         <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
//           <ArrowLeft className="w-4 h-4 mr-2" />
//           Back
//         </Button>
        
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           <h1 className="text-4xl font-bold gradient-text mb-2">Edit Profile</h1>
//           <p className="text-muted-foreground mb-8">Manage your personal information and avatar</p>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//               {/* Avatar Upload */}
//               <div className="glassmorphic rounded-2xl p-6">
//                 <Label>Profile Avatar</Label>
//                 <div className="flex items-center gap-6 mt-4">
//                   <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
//                     {avatarPreview ? (
//                       <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
//                     ) : (
//                       <span className="text-4xl font-bold text-muted-foreground">
//                         {form.watch('name')?.[0] || 'S'}
//                       </span>
//                     )}
//                   </div>
//                   <div>
//                     <Input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleAvatarChange}
//                       className="mb-2"
//                     />
//                     <p className="text-sm text-muted-foreground">Max size: 5MB</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Resume Upload */}
//               <div className="glassmorphic rounded-2xl p-6">
//                 <Label>Resume (PDF)</Label>
//                 <div className="mt-4 space-y-3">
//                   {profile?.resume_url && (
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <span>Current resume uploaded</span>
//                       <a 
//                         href={profile.resume_url} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         className="text-primary hover:underline"
//                       >
//                         View
//                       </a>
//                     </div>
//                   )}
//                   <Input
//                     type="file"
//                     accept=".pdf"
//                     onChange={handleResumeChange}
//                   />
//                   <p className="text-sm text-muted-foreground">Upload your resume as PDF (Max 10MB)</p>
//                 </div>
//               </div>

//               {/* Basic Info */}
//               <div className="glassmorphic rounded-2xl p-6 space-y-4">
//                 <h3 className="text-lg font-semibold">Basic Information</h3>
                
//                 <FormField
//                   control={form.control}
//                   name="name"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Full Name</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Professional Title</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="tagline"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Tagline</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="bio"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Bio</FormLabel>
//                       <FormControl>
//                         <Textarea {...field} rows={4} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Contact Info */}
//               <div className="glassmorphic rounded-2xl p-6 space-y-4">
//                 <h3 className="text-lg font-semibold">Contact Information</h3>
                
//                 <FormField
//                   control={form.control}
//                   name="email"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Email</FormLabel>
//                       <FormControl>
//                         <Input {...field} type="email" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="phone"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Phone</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="location"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Location</FormLabel>
//                       <FormControl>
//                         <Input {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Social Links */}
//               <div className="glassmorphic rounded-2xl p-6 space-y-4">
//                 <h3 className="text-lg font-semibold">Social Links</h3>
                
//                 <FormField
//                   control={form.control}
//                   name="github_url"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>GitHub URL</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="https://github.com/username" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="linkedin_url"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>LinkedIn URL</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="https://linkedin.com/in/username" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="twitter_url"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Twitter URL</FormLabel>
//                       <FormControl>
//                         <Input {...field} placeholder="https://twitter.com/username" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               {/* Availability */}
//               <div className="glassmorphic rounded-2xl p-6">
//                 <FormField
//                   control={form.control}
//                   name="availability_status"
//                   render={({ field }) => (
//                     <FormItem className="flex items-center justify-between">
//                       <div>
//                         <FormLabel>Available for Opportunities</FormLabel>
//                         <p className="text-sm text-muted-foreground">
//                           Show that you're open to new opportunities
//                         </p>
//                       </div>
//                       <FormControl>
//                         <Switch
//                           checked={field.value}
//                           onCheckedChange={field.onChange}
//                         />
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <Button type="submit" size="lg" className="w-full" disabled={uploading}>
//                 {uploading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Uploading...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4 mr-2" />
//                     Save Profile
//                   </>
//                 )}
//               </Button>
//             </form>
//           </Form>
//         </motion.div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Upload, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title is required'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  availability_status: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [imageScale, setImageScale] = useState(1);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      tagline: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      github_url: '',
      linkedin_url: '',
      twitter_url: '',
      availability_status: true,
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  // const fetchProfile = async () => {
  //   const { data } = await supabase.from('profiles').select('*').maybeSingle();
  //   if (data) {
  //     setProfile(data);
  //     setAvatarPreview(data.profile_image || '');
  //     form.reset({
  //       name: data.name || '',
  //       title: data.title || '',
  //       tagline: data.tagline || '',
  //       bio: data.bio || '',
  //       email: data.email || '',
  //       phone: data.phone || '',
  //       location: data.location || '',
  //       github_url: data.github_url || '',
  //       linkedin_url: data.linkedin_url || '',
  //       twitter_url: data.twitter_url || '',
  //       availability_status: data.availability_status ?? true,
  //     });
  //   }
  // };
const fetchProfile = async () => {
  const { data } = await supabase.from('profiles').select('*').maybeSingle();
  if (data) {
    setProfile(data);
    setAvatarPreview(data.profile_image || '');
    
    // ✅ Load saved position/scale
    const profileData = data as any;
    if (profileData.image_position) {
      setImagePosition(profileData.image_position);
    }
    if (profileData.image_scale) {
      setImageScale(profileData.image_scale);
    }
    
    form.reset({
     name: data.name || '',
        title: data.title || '',
        tagline: data.tagline || '',
        bio: data.bio || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        twitter_url: data.twitter_url || '',
        availability_status: data.availability_status ?? true,
    });
  }
};
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setImagePosition({ x: 50, y: 50 });
      setImageScale(1);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume size must be less than 10MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      setResumeFile(file);
      toast.success('Resume selected');
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return profile?.profile_image;

    setUploading(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error('Failed to upload avatar: ' + error.message);
      return profile?.profile_image;
    } finally {
      setUploading(false);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return profile?.resume_url;

    try {
      const fileName = `resume-${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast.error('Failed to upload resume: ' + error.message);
      return profile?.resume_url;
    }
  };

  // const onSubmit = async (data: ProfileFormData) => {
  //   try {
  //     setUploading(true);
  //     const avatarUrl = await uploadAvatar();
  //     const resumeUrl = await uploadResume();

  //     const updateData = {
  //       ...data,
  //       profile_image: avatarUrl,
  //       resume_url: resumeUrl,
  //     };

  //     if (profile) {
  //       const { error } = await supabase
  //         .from('profiles')
  //         .update(updateData)
  //         .eq('id', profile.id);

  //       if (error) throw error;
  //       toast.success('Profile updated successfully');
  //     } else {
  //       const { error } = await supabase
  //         .from('profiles')
  //         .insert([{ ...updateData, user_id: (await supabase.auth.getUser()).data.user?.id }]);

  //       if (error) throw error;
  //       toast.success('Profile created successfully');
  //     }

  //     fetchProfile();
  //     setResumeFile(null);
  //   } catch (error: any) {
  //     toast.error('Failed to save profile: ' + error.message);
  //   } finally {
  //     setUploading(false);
  //   }
  // };
const onSubmit = async (data: ProfileFormData) => {
  try {
    setUploading(true);
    const avatarUrl = await uploadAvatar();
    const resumeUrl = await uploadResume();

    const updateData = {
      ...data,
      profile_image: avatarUrl,
      resume_url: resumeUrl,
      image_position: avatarPreview ? imagePosition : null,  // ✅ Add this
      image_scale: avatarPreview ? imageScale : null,         // ✅ Add this
    };

    if (profile) {
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } else {
      const { error } = await supabase
        .from('profiles')
        .insert([{ ...updateData, user_id: (await supabase.auth.getUser()).data.user?.id }]);

      if (error) throw error;
      toast.success('Profile created successfully');
    }

    fetchProfile();
    setResumeFile(null);
  } catch (error: any) {
    toast.error('Failed to save profile: ' + error.message);
  } finally {
    setUploading(false);
  }
};
  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="outline" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Edit Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your personal information and avatar</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Avatar Upload */}
              <div className="glassmorphic rounded-2xl p-6">
                <Label>Profile Avatar</Label>
                <div className="flex items-start gap-6 mt-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center relative flex-shrink-0">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="absolute w-full h-full object-cover"
                        style={{
                          objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                          transform: `scale(${imageScale})`
                        }}
                      />
                    ) : (
                      <span className="text-4xl font-bold text-muted-foreground">
                        {form.watch('name')?.[0] || 'S'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="mb-2"
                    />
                    <p className="text-sm text-muted-foreground mb-3">Max size: 5MB</p>
                    
                    {avatarPreview && (
                      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                        <div>
                          <Label className="text-xs">Horizontal Position</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imagePosition.x}
                            onChange={(e) => setImagePosition({...imagePosition, x: Number(e.target.value)})}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Vertical Position</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={imagePosition.y}
                            onChange={(e) => setImagePosition({...imagePosition, y: Number(e.target.value)})}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Zoom</Label>
                          <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.1"
                            value={imageScale}
                            onChange={(e) => setImageScale(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="glassmorphic rounded-2xl p-6">
                <Label>Resume (PDF)</Label>
                <div className="mt-4 space-y-3">
                  {profile?.resume_url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Current resume uploaded</span>
                      <a 
                        href={profile.resume_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View
                      </a>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeChange}
                  />
                  <p className="text-sm text-muted-foreground">Upload your resume as PDF (Max 10MB)</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="glassmorphic rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Info */}
              <div className="glassmorphic rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Social Links */}
              <div className="glassmorphic rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>
                
                <FormField
                  control={form.control}
                  name="github_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://github.com/username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://linkedin.com/in/username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://twitter.com/username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Availability */}
              <div className="glassmorphic rounded-2xl p-6">
                <FormField
                  control={form.control}
                  name="availability_status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Available for Opportunities</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show that you're open to new opportunities
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}