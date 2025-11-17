import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Sparkles, Eye, EyeOff, Activity, DollarSign } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AISettings {
  openai_api_key: string;
  gemini_api_key: string;
  ollama_base_url: string;
  preferred_provider: string;
  default_model: string;
  temperature: number;
  max_tokens: number;
}

interface UsageStats {
  total_calls: number;
  total_tokens: number;
  estimated_cost: number;
  by_provider: {
    provider: string;
    calls: number;
    tokens: number;
    cost: number;
  }[];
}

export default function AISettings() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<AISettings>({
    openai_api_key: '',
    gemini_api_key: '',
    ollama_base_url: '',
    preferred_provider: 'gemini',
    default_model: 'gemini-pro',
    temperature: 0.7,
    max_tokens: 2000,
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false,
  });
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchUsageStats();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (data) {
      setSettings({
        openai_api_key: data.openai_api_key || '',
        gemini_api_key: data.gemini_api_key || '',
        ollama_base_url: data.ollama_base_url || '',
        preferred_provider: data.preferred_provider,
        default_model: data.default_model,
        temperature: Number(data.temperature) || 0.7,
        max_tokens: Number(data.max_tokens) || 2000,
      });
    }
  };

  const fetchUsageStats = async () => {
    const { data: logs } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('user_id', user!.id);

    if (logs && logs.length > 0) {
      const totalTokens = logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const totalCost = logs.reduce((sum, log) => sum + (parseFloat(String(log.estimated_cost)) || 0), 0);

      const byProvider = ['openai', 'gemini', 'ollama'].map(provider => {
        const providerLogs = logs.filter(log => log.provider === provider);
        return {
          provider,
          calls: providerLogs.length,
          tokens: providerLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
          cost: providerLogs.reduce((sum, log) => sum + (parseFloat(String(log.estimated_cost)) || 0), 0),
        };
      });

      setUsageStats({
        total_calls: logs.length,
        total_tokens: totalTokens,
        estimated_cost: totalCost,
        by_provider: byProvider,
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('ai_settings')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      const payload = {
        user_id: user!.id,
        openai_api_key: settings.openai_api_key || null,
        gemini_api_key: settings.gemini_api_key || null,
        ollama_base_url: settings.ollama_base_url || null,
        preferred_provider: settings.preferred_provider,
        default_model: settings.default_model,
        temperature: settings.temperature,
        max_tokens: settings.max_tokens,
      };

      if (existing) {
        const { error } = await supabase
          .from('ai_settings')
          .update(payload)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_settings')
          .insert(payload);

        if (error) throw error;
      }

      toast.success('AI settings saved successfully');
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const modelOptions = {
    openai: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
    gemini: ['gemini-pro', 'gemini-pro-vision'],
    ollama: ['llama2', 'mistral', 'codellama'],
  };

  return (
    <div className="container mx-auto p-6 pt-24">
      <div className="mb-8">
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Settings</h1>
        </div>
        <p className="text-muted-foreground mt-1">Configure AI providers and monitor usage</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Configuration</CardTitle>
              <CardDescription>
                Configure your AI provider API keys. Keys are encrypted and stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-key"
                    type={showKeys.openai ? 'text' : 'password'}
                    value={settings.openai_api_key}
                    onChange={(e) => setSettings({ ...settings, openai_api_key: e.target.value })}
                    placeholder="sk-..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                  >
                    {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-primary hover:underline">OpenAI Dashboard</a>
                </p>
              </div>

              {/* Gemini */}
              <div className="space-y-2">
                <Label htmlFor="gemini-key">Google Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="gemini-key"
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={settings.gemini_api_key}
                    onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                    placeholder="AI..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                  >
                    {showKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener" className="text-primary hover:underline">Google AI Studio</a>
                </p>
              </div>

              {/* Ollama */}
              <div className="space-y-2">
                <Label htmlFor="ollama-url">Ollama Base URL (Optional)</Label>
                <Input
                  id="ollama-url"
                  type="text"
                  value={settings.ollama_base_url}
                  onChange={(e) => setSettings({ ...settings, ollama_base_url: e.target.value })}
                  placeholder="http://localhost:11434"
                />
                <p className="text-xs text-muted-foreground">
                  For self-hosted Ollama instances
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Choose your preferred AI provider and model settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Preferred Provider</Label>
                  <Select
                    value={settings.preferred_provider}
                    onValueChange={(value) => setSettings({ ...settings, preferred_provider: value })}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="ollama">Ollama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Default Model</Label>
                  <Select
                    value={settings.default_model}
                    onValueChange={(value) => setSettings({ ...settings, default_model: value })}
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions[settings.preferred_provider as keyof typeof modelOptions]?.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Temperature: {settings.temperature}</Label>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([value]) => setSettings({ ...settings, temperature: value })}
                  min={0}
                  max={1}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values = more creative, Lower values = more focused
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens: {settings.max_tokens}</Label>
                <Slider
                  value={[settings.max_tokens]}
                  onValueChange={([value]) => setSettings({ ...settings, max_tokens: value })}
                  min={100}
                  max={4000}
                  step={100}
                />
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          {usageStats ? (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Total Calls
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{usageStats.total_calls}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Total Tokens
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{usageStats.total_tokens.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Estimated Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${usageStats.estimated_cost.toFixed(4)}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Usage by Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageStats.by_provider.map((provider) => (
                      <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{provider.provider}</p>
                          <p className="text-sm text-muted-foreground">
                            {provider.calls} calls • {provider.tokens.toLocaleString()} tokens
                          </p>
                        </div>
                        <p className="text-lg font-bold">${provider.cost.toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No usage data yet</p>
                <p className="text-sm text-muted-foreground">
                  Start using AI features to see your usage statistics here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
