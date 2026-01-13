import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile } from '@/hooks/use-profile';
import { blink } from '@/lib/blink';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'leader' | 'learner' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { refreshProfile } = useProfile();
  const navigate = useNavigate();

  // Listen for auth state to get the current user
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.isLoading) return;
      setAuthLoading(false);
      if (state.user) {
        setCurrentUser(state.user);
      } else {
        // Not authenticated, redirect to login
        navigate('/');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !displayName.trim()) {
      toast.error('Please complete all fields');
      return;
    }

    if (!currentUser) {
      toast.error('Please sign in first');
      navigate('/');
      return;
    }

    setIsSubmitting(true);
    try {
      await blink.db.profiles.create({
        userId: currentUser.id,
        displayName: displayName.trim(),
        role: role,
        email: currentUser.email,
        avatarUrl: currentUser.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`
      });

      toast.success('Profile created successfully!');
      await refreshProfile();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-xl animate-in">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Complete Your Profile</h2>
          <p className="mt-2 text-muted-foreground">Tell us how you'd like to participate in the journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Choose Your Role</CardTitle>
              <CardDescription>Are you looking to mentor others or be mentored?</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setRole('leader')}
                className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:bg-secondary/50 ${role === 'leader' ? 'border-primary bg-secondary/50' : 'border-transparent bg-background'}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 rounded-full p-3 ${role === 'leader' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-lg">Leader</h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">I want to mentor others and help them grow in their journey.</p>
                </div>
                {role === 'leader' && <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />}
              </div>

              <div 
                onClick={() => setRole('learner')}
                className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all hover:bg-secondary/50 ${role === 'learner' ? 'border-primary bg-secondary/50' : 'border-transparent bg-background'}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 rounded-full p-3 ${role === 'learner' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-lg">Learner</h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">I'm looking for guidance and mentorship in my spiritual growth.</p>
                </div>
                {role === 'learner' && <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-primary" />}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Display Name</CardTitle>
              <CardDescription>This is how others will see you in the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your name" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11 rounded-lg"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-full text-lg font-medium shadow-lg" 
            disabled={isSubmitting || !role || !displayName.trim()}
          >
            {isSubmitting ? 'Creating Profile...' : 'Get Started'}
          </Button>
        </form>
      </div>
    </div>
  );
}
