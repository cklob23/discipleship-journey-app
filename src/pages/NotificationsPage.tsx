import React from 'react';
import { useJourney } from '@/hooks/useJourney';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Star, Calendar, MessageSquare, Shield } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications } = useJourney();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Notifications</h1>
        <div className="p-3 rounded-full bg-secondary">
          <Bell className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-dashed border-2 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
              <Bell className="w-12 h-12 text-muted-foreground opacity-20" />
              <p className="text-muted-foreground font-bold uppercase italic tracking-widest">No new notifications</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif, i) => (
            <Card key={i} className="group hover:border-primary transition-colors overflow-hidden">
              <div className="flex">
                <div className="w-2 bg-primary group-hover:w-3 transition-all" />
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-secondary group-hover:bg-primary/10 transition-colors shrink-0">
                    {getIcon(notif)}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold uppercase italic tracking-tight text-lg">{notif}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Just now</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="p-8 border-2 border-border rounded-3xl bg-card">
        <h3 className="text-sm font-black uppercase italic tracking-[0.2em] mb-4">Tips for Notifications</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
            Check back daily for new prayer prompts and weekly focus updates.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
            You'll receive a notification when your partner completes an assignment.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
            Reminders for your weekly meetings will appear here 24 hours in advance.
          </li>
        </ul>
      </div>
    </div>
  );
};

const getIcon = (text: string) => {
  if (text.toLowerCase().includes('welcome') || text.toLowerCase().includes('begun')) return <Star className="w-5 h-5" />;
  if (text.toLowerCase().includes('meeting')) return <Calendar className="w-5 h-5" />;
  if (text.toLowerCase().includes('message')) return <MessageSquare className="w-5 h-5" />;
  if (text.toLowerCase().includes('covenant')) return <Shield className="w-5 h-5" />;
  return <Bell className="w-5 h-5" />;
};
