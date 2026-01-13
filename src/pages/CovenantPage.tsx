import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/hooks/useJourney';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, Heart, Clock, MessageSquare, Handshake } from 'lucide-react';

export const CovenantPage = () => {
  const { user, signCovenant } = useJourney();
  const [agreed, setAgreed] = useState({
    time: false,
    honesty: false,
    privacy: false,
    consistency: false
  });
  const navigate = useNavigate();

  const handleSign = () => {
    signCovenant();
    navigate('/dashboard');
  };

  const isAllAgreed = Object.values(agreed).every(v => v);

  return (
    <div className="min-h-screen bg-background journey-grid flex items-center justify-center p-4 py-12">
      <Card className="max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-700 overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="text-center pb-8 border-b">
          <div className="flex justify-center mb-4">
            <Handshake className="w-12 h-12 text-primary animate-bounce-slow" />
          </div>
          <CardTitle className="text-4xl font-black uppercase italic tracking-tighter">The Covenant</CardTitle>
          <CardDescription className="text-base">A sacred agreement between {user.name} and {user.partnerName}.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-6 lg:p-10">
            <div className="space-y-8">
              <section className="space-y-4">
                <p className="text-muted-foreground leading-relaxed italic">
                  "Disciple-making is not a program. It is a relationship. By entering this journey, we commit to walking together for the next 6 weeks, seeking to grow in our love for God and our service to others."
                </p>
                
                <div className="grid gap-6 mt-8">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase text-sm italic">Commitment of Time</h4>
                      <p className="text-sm text-muted-foreground">We agree to meet once a week for at least 60 minutes and complete the assigned readings.</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="time" 
                          checked={agreed.time} 
                          onCheckedChange={(v) => setAgreed(prev => ({ ...prev, time: !!v }))}
                        />
                        <label htmlFor="time" className="text-xs font-medium cursor-pointer">I agree to prioritize this time.</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase text-sm italic">Commitment of Honesty</h4>
                      <p className="text-sm text-muted-foreground">We agree to be vulnerable and honest about our struggles, doubts, and victories.</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="honesty" 
                          checked={agreed.honesty} 
                          onCheckedChange={(v) => setAgreed(prev => ({ ...prev, honesty: !!v }))}
                        />
                        <label htmlFor="honesty" className="text-xs font-medium cursor-pointer">I agree to be authentic.</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase text-sm italic">Commitment of Privacy</h4>
                      <p className="text-sm text-muted-foreground">Everything shared within this relationship stays between us, unless there is a risk of harm.</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="privacy" 
                          checked={agreed.privacy} 
                          onCheckedChange={(v) => setAgreed(prev => ({ ...prev, privacy: !!v }))}
                        />
                        <label htmlFor="privacy" className="text-xs font-medium cursor-pointer">I agree to maintain confidentiality.</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold uppercase text-sm italic">Commitment of Encouragement</h4>
                      <p className="text-sm text-muted-foreground">We agree to pray for and encourage each other daily, not just on meeting days.</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Checkbox 
                          id="consistency" 
                          checked={agreed.consistency} 
                          onCheckedChange={(v) => setAgreed(prev => ({ ...prev, consistency: !!v }))}
                        />
                        <label htmlFor="consistency" className="text-xs font-medium cursor-pointer">I agree to build up my partner.</label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-6 lg:p-10 bg-secondary/30 border-t flex flex-col gap-4">
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
            By clicking below, you are digitally signing this covenant and beginning your 6-week journey.
          </p>
          <Button 
            className="w-full h-14 text-xl font-black uppercase italic tracking-tighter" 
            disabled={!isAllAgreed}
            onClick={handleSign}
          >
            I Commit to this Journey
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
