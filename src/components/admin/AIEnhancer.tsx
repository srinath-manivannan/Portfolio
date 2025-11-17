import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIEnhancerProps {
  text: string;
  onEnhanced: (enhanced: string) => void;
  contentType?: string;
  contentId?: string;
}

const operations = [
  { value: 'improve', label: 'Improve Writing', description: 'Make text more engaging and clear' },
  { value: 'professional', label: 'Professional Tone', description: 'Business-appropriate language' },
  { value: 'simplify', label: 'Simplify', description: 'Make easier to understand' },
  { value: 'expand', label: 'Expand', description: 'Add more details' },
  { value: 'shorten', label: 'Shorten', description: 'Make more concise' },
];

export function AIEnhancer({ text, onEnhanced, contentType, contentId }: AIEnhancerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [operation, setOperation] = useState('improve');
  const [enhancedText, setEnhancedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ tokens: number; cost: number; provider: string } | null>(null);

  const handleEnhance = async () => {
    if (!text || !text.trim()) {
      toast.error('No text to enhance');
      return;
    }

    setLoading(true);
    setOriginalText(text);

    try {
      const { data, error } = await supabase.functions.invoke('ai-enhance', {
        body: {
          text,
          operation,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('API key not configured')) {
          toast.error('Please configure your AI provider in AI Settings');
          setShowDialog(false);
          return;
        }
        throw new Error(data.error);
      }

      setEnhancedText(data.enhanced);
      setStats({
        tokens: data.tokens_used,
        cost: data.cost,
        provider: data.provider,
      });

      // Save to content versions
      if (contentType) {
        await supabase.from('content_versions').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content_type: contentType,
          content_id: contentId || null,
          original_content: text,
          enhanced_content: data.enhanced,
          enhancement_type: operation,
          ai_provider: data.provider,
          ai_model: data.model,
          tokens_used: data.tokens_used,
        });
      }

      toast.success('Text enhanced successfully!');
    } catch (error: any) {
      console.error('AI enhancement error:', error);
      toast.error('Failed to enhance text: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const handleAccept = () => {
    onEnhanced(enhancedText);
    setShowDialog(false);
    toast.success('Enhancement applied');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={!text || !text.trim()}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Enhance with AI
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Content Enhancement
            </DialogTitle>
            <DialogDescription>
              Choose an enhancement mode and let AI improve your content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Enhancement Mode Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enhancement Mode</label>
              <Select value={operation} onValueChange={setOperation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {operations.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      <div>
                        <div className="font-medium">{op.label}</div>
                        <div className="text-xs text-muted-foreground">{op.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Original Text */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Text</label>
              <Textarea
                value={originalText || text}
                readOnly
                className="min-h-[150px] bg-muted/50"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{(originalText || text).length} characters</span>
                <span>{(originalText || text).split(/\s+/).length} words</span>
              </div>
            </div>

            {/* Enhanced Text */}
            {enhancedText && (
              <div className="space-y-2 border-t pt-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enhanced Text</label>
                  {stats && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {stats.provider}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {stats.tokens} tokens
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ${stats.cost.toFixed(4)}
                      </Badge>
                    </div>
                  )}
                </div>
                <Textarea
                  value={enhancedText}
                  onChange={(e) => setEnhancedText(e.target.value)}
                  className="min-h-[150px] bg-primary/5 border-primary/20"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{enhancedText.length} characters</span>
                  <span>{enhancedText.split(/\s+/).length} words</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              {!enhancedText ? (
                <>
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEnhance} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Enhance
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEnhancedText('')}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button onClick={handleAccept}>
                    Accept & Apply
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
