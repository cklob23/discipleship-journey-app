import React from 'react';
import { useJourney } from '@/hooks/useJourney';
import { JOURNEY_DATA } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  MessageCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { user, progress, toggleAssignment, toggleActionItem } = useJourney();
  const navigate = useNavigate();

  const currentWeekData = JOURNEY_DATA.find(w => w.week === user.currentWeek) || JOURNEY_DATA[0];
  
  const totalItems = currentWeekData.assignments.length + currentWeekData.actionItems.length;
  const completedItems = currentWeekData.assignments.filter(a => progress.completedAssignments.includes(a.id)).length + 
                        currentWeekData.actionItems.filter(a => progress.completedActionItems.includes(a.id)).length;
  
  const completionPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-bold px-2 py-0.5 mb-2">
            Week {user.currentWeek} of 6
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
            {currentWeekData.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            {currentWeekData.description}
          </p>
        </div>
        <Button size="lg" className="rounded-full px-8 gap-2 uppercase italic font-bold" onClick={() => navigate('/journey')}>
          View Roadmap <Map className="w-4 h-4" />
        </Button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 shadow-xl overflow-hidden">
            <CardHeader className="bg-secondary/50 border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="uppercase italic font-black flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Weekly Assignments
                </CardTitle>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {completedItems}/{totalItems} Done
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {currentWeekData.assignments.map((assignment) => (
                  <div key={assignment.id} className="p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                    <Checkbox 
                      id={assignment.id} 
                      checked={progress.completedAssignments.includes(assignment.id)}
                      onCheckedChange={() => toggleAssignment(assignment.id)}
                      className="mt-1 w-5 h-5"
                    />
                    <div className="space-y-1 flex-1">
                      <label 
                        htmlFor={assignment.id} 
                        className={`text-lg font-bold uppercase italic tracking-tight cursor-pointer ${progress.completedAssignments.includes(assignment.id) ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {assignment.title}
                      </label>
                      <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      <Badge variant="secondary" className="text-[9px] uppercase tracking-widest h-4 px-1">
                        {assignment.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed bg-muted/20">
            <CardHeader>
              <CardTitle className="uppercase italic font-black text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Weekly Action Items
              </CardTitle>
              <CardDescription>Practical steps to live out this week's focus.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentWeekData.actionItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-4 bg-background rounded-xl border-2 border-border shadow-sm">
                  <Checkbox 
                    id={item.id} 
                    checked={progress.completedActionItems.includes(item.id)}
                    onCheckedChange={() => toggleActionItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <label 
                      htmlFor={item.id} 
                      className={`font-bold uppercase italic text-sm tracking-tight cursor-pointer ${progress.completedActionItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {item.title}
                    </label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground shadow-2xl">
            <CardHeader>
              <CardTitle className="uppercase italic font-black flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" /> {user.role === 'leader' ? 'Leader' : 'Learner'} Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic leading-relaxed text-primary-foreground/90">
                "{user.role === 'leader' ? currentWeekData.leaderTips : currentWeekData.learnerTips}"
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="uppercase italic font-black text-xl flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Encouragement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Don't forget to reach out to {user.partnerName} today! A small word of prayer or encouragement goes a long way.
              </p>
              <Button variant="outline" className="w-full uppercase font-bold text-xs tracking-widest" onClick={() => navigate('/messages')}>
                Send Message
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-none">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <Clock className="w-3 h-3" /> Meeting Reminder
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold italic uppercase">Your next meeting with {user.partnerName} is approaching.</div>
              <p className="text-xs text-muted-foreground mt-1">Check your shared calendar for details.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Map = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>
);
