import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/hooks/useJourney';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, GraduationCap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const OnboardingPage = () => {
  const { user, updateRole, updateNames } = useJourney();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user.name || '',
    partnerName: user.partnerName || ''
  });
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'leader' | 'learner') => {
    updateRole(role);
    setStep(2);
  };

  const handleFinish = () => {
    updateNames(formData.name, formData.partnerName);
    navigate('/covenant');
  };

  if (user.isCovenantSigned) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-background journey-grid flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">The Journey</h1>
          <p className="text-muted-foreground">A 6-week discipleship experience.</p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-center mb-2">Select your role</h2>
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 group",
                user.role === 'leader' && "border-primary bg-primary/5"
              )}
              onClick={() => handleRoleSelect('leader')}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg uppercase italic font-black">The Leader</CardTitle>
                  <CardDescription>I am guiding someone else.</CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 group",
                user.role === 'learner' && "border-primary bg-primary/5"
              )}
              onClick={() => handleRoleSelect('learner')}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg uppercase italic font-black">The Learner</CardTitle>
                  <CardDescription>I am being guided by a mentor.</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {step === 2 && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="uppercase italic font-black text-2xl tracking-tighter">Who are you walking with?</CardTitle>
              <CardDescription>Enter your names to personalize the experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partner">Your {user.role === 'leader' ? 'Learner\'s' : 'Leader\'s'} Name</Label>
                <Input 
                  id="partner" 
                  placeholder="Enter their name"
                  value={formData.partnerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, partnerName: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full h-12 uppercase font-bold italic text-lg" 
                disabled={!formData.name || !formData.partnerName}
                onClick={handleFinish}
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
