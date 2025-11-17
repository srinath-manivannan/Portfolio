import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, Zap, Play, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Webhook {
  id: string;
  name: string;
  event_type: string;
  webhook_url: string;
  is_active: boolean;
  description: string | null;
  last_triggered_at: string | null;
  trigger_count: number;
}

interface AutomationLog {
  id: string;
  webhook_id: string;
  event_type: string;
  status: string;
  error_message: string | null;
  execution_time_ms: number;
  created_at: string;
}

const eventTypes = [
  { value: 'blog_published', label: 'Blog Post Published' },
  { value: 'contact_form', label: 'Contact Form Submitted' },
  { value: 'project_added', label: 'Project Added' },
  { value: 'resume_downloaded', label: 'Resume Downloaded' },
  { value: 'document_uploaded', label: 'Document Uploaded' },
  { value: 'user_registration', label: 'User Registration' },
];

export default function AutomationSettings() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    event_type: 'blog_published',
    webhook_url: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchWebhooks();
    fetchLogs();
  }, []);

  const fetchWebhooks = async () => {
    const { data, error } = await supabase
      .from('n8n_webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setWebhooks(data);
    }
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('automation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.webhook_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      event_type: formData.event_type,
      webhook_url: formData.webhook_url,
      description: formData.description || null,
      is_active: formData.is_active,
    };

    if (editingWebhook) {
      const { error } = await supabase
        .from('n8n_webhooks')
        .update(payload)
        .eq('id', editingWebhook.id);

      if (error) {
        toast.error('Failed to update webhook');
        return;
      }
      toast.success('Webhook updated successfully');
    } else {
      const { error } = await supabase
        .from('n8n_webhooks')
        .insert(payload);

      if (error) {
        toast.error('Failed to create webhook');
        return;
      }
      toast.success('Webhook created successfully');
    }

    resetForm();
    fetchWebhooks();
  };

  const handleTest = async (webhook: Webhook) => {
    setTestingWebhook(webhook.id);
    const startTime = Date.now();

    try {
      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: webhook.event_type,
          test: true,
          timestamp: new Date().toISOString(),
        }),
      });

      const executionTime = Date.now() - startTime;

      await supabase.from('automation_logs').insert({
        webhook_id: webhook.id,
        event_type: webhook.event_type,
        status: 'success',
        execution_time_ms: executionTime,
        payload: { test: true },
      });

      await supabase
        .from('n8n_webhooks')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: webhook.trigger_count + 1,
        })
        .eq('id', webhook.id);

      toast.success('Webhook triggered successfully');
      fetchWebhooks();
      fetchLogs();
    } catch (error: any) {
      await supabase.from('automation_logs').insert({
        webhook_id: webhook.id,
        event_type: webhook.event_type,
        status: 'failure',
        error_message: error.message,
        execution_time_ms: Date.now() - startTime,
      });

      toast.error('Failed to trigger webhook');
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleToggle = async (webhook: Webhook) => {
    const { error } = await supabase
      .from('n8n_webhooks')
      .update({ is_active: !webhook.is_active })
      .eq('id', webhook.id);

    if (!error) {
      toast.success(`Webhook ${!webhook.is_active ? 'enabled' : 'disabled'}`);
      fetchWebhooks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    const { error } = await supabase
      .from('n8n_webhooks')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Webhook deleted successfully');
      fetchWebhooks();
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      event_type: webhook.event_type,
      webhook_url: webhook.webhook_url,
      description: webhook.description || '',
      is_active: webhook.is_active,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      event_type: 'blog_published',
      webhook_url: '',
      description: '',
      is_active: true,
    });
    setEditingWebhook(null);
    setShowDialog(false);
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Automation & Webhooks</h1>
            </div>
            <p className="text-muted-foreground mt-1">Configure n8n webhooks and monitor automation</p>
          </div>
          <Button onClick={() => setShowDialog(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        </div>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Automation Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks">
          <div className="grid md:grid-cols-2 gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <Badge variant={webhook.is_active ? 'default' : 'secondary'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>
                        {eventTypes.find(e => e.value === webhook.event_type)?.label}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(webhook)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(webhook.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Webhook URL</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded truncate">
                      {webhook.webhook_url}
                    </p>
                  </div>
                  {webhook.description && (
                    <p className="text-sm text-muted-foreground">{webhook.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Triggered: {webhook.trigger_count} times
                    </span>
                    {webhook.last_triggered_at && (
                      <span className="text-muted-foreground">
                        Last: {new Date(webhook.last_triggered_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(webhook)}
                      disabled={testingWebhook === webhook.id}
                      className="flex-1"
                    >
                      <Play className="mr-2 h-3 w-3" />
                      {testingWebhook === webhook.id ? 'Testing...' : 'Test'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(webhook)}
                      className="flex-1"
                    >
                      {webhook.is_active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {webhooks.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No webhooks configured</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first webhook to start automating your workflow
                </p>
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Activity</CardTitle>
              <CardDescription>Last 50 webhook executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : log.status === 'failure' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{log.event_type}</p>
                        {log.error_message && (
                          <p className="text-sm text-red-500">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.execution_time_ms && (
                        <p className="text-xs text-muted-foreground">
                          {log.execution_time_ms}ms
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {logs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No logs yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? 'Edit Webhook' : 'Add Webhook'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Webhook Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Notify Telegram"
                />
              </div>
              <div>
                <Label htmlFor="event">Event Type *</Label>
                <select
                  id="event"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {eventTypes.map((event) => (
                    <option key={event.value} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="url">Webhook URL *</Label>
              <Input
                id="url"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                placeholder="https://your-n8n-instance.com/webhook/..."
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingWebhook ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
