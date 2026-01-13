import React from 'react';
import { useJourney } from '@/hooks/useJourney';
import { JOURNEY_DATA } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, Lock, ChevronRight, Star } from 'lucide-react';

export const JourneyPage = () => {
  const { user } = useJourney();

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">The Roadmap</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Your 6-week path from foundation to multiplication.
        </p>
      </div>

      <div className="relative space-y-8">
        {/* Connecting Line */}
        <div className="absolute left-[39px] md:left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 hidden md:block" />

        {JOURNEY_DATA.map((week, idx) => {
          const isCurrent = week.week === user.currentWeek;
          const isCompleted = week.week < user.currentWeek;
          const isLocked = week.week > user.currentWeek;

          return (
            <div key={week.id} className={cn(
              "relative flex flex-col md:flex-row items-start md:items-center gap-8",
              idx % 2 === 0 ? "md:flex-row-reverse" : ""
            )}>
              {/* Timeline Marker */}
              <div className={cn(
                "z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 bg-background transition-all duration-500 shrink-0 mx-auto md:mx-0",
                isCurrent ? "border-primary scale-110 shadow-xl" : "border-border",
                isCompleted ? "border-primary bg-primary text-primary-foreground" : ""
              )}>
                {isCompleted ? (
                  <Check className="w-10 h-10" />
                ) : (
                  <span className="text-2xl font-black italic">{week.week}</span>
                )}
              </div>

              {/* Content Card */}
              <Card className={cn(
                "flex-1 w-full transition-all duration-500 hover:shadow-lg",
                isCurrent ? "border-primary ring-1 ring-primary/20" : "",
                isLocked ? "opacity-60 grayscale" : ""
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant={isCurrent ? "default" : "outline"} className="uppercase tracking-widest text-[10px]">
                      {isCompleted ? "Complete" : isCurrent ? "Active Now" : "Upcoming"}
                    </Badge>
                    {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                    {isCurrent && <Star className="w-4 h-4 text-primary fill-primary animate-pulse" />}
                  </div>
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">
                    {week.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {week.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {week.assignments.map(a => (
                      <div key={a.id} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-secondary border border-border flex items-center gap-1">
                        <ChevronRight className="w-2 h-2" /> {a.title}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Spacer for centering on desktop */}
              <div className="hidden md:block flex-1" />
            </div>
          );
        })}
      </div>

      <div className="mt-20 p-8 rounded-3xl bg-secondary/30 border-2 border-dashed border-border text-center space-y-4">
        <h3 className="text-xl font-black uppercase italic">The End is the Beginning</h3>
        <p className="text-muted-foreground max-w-md mx-auto italic">
          "Discipleship is not about finishing a course, but about starting a lifestyle of making disciples who make disciples."
        </p>
      </div>
    </div>
  );
};
