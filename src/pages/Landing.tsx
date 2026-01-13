import { Button } from '@/components/ui/button';
import { blink } from '@/lib/blink';
import { ChevronRight, Shield, Users, MessageSquare } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    blink.auth.login('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(24,24,27,0.05)_0%,transparent_100%)]" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium animate-in">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground uppercase tracking-wider">New</span>
            Collaborative Discipleship Journey
          </div>
          
          <h1 className="mt-8 text-5xl font-bold tracking-tight text-foreground sm:text-7xl animate-in" style={{ animationDelay: '100ms' }}>
            Connect. Mentor.<br />
            <span className="text-muted-foreground">Grow Together.</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-in" style={{ animationDelay: '200ms' }}>
            A dedicated space for discipleship relationships. Formalize your commitment with covenants, track progress, and foster growth through real-time collaboration.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in" style={{ animationDelay: '300ms' }}>
            <Button size="lg" className="rounded-full px-8 h-12 text-base" onClick={handleLogin}>
              Start Your Journey <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid gap-12 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center animate-in" style={{ animationDelay: '400ms' }}>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm ring-1 ring-border">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Covenant-Based</h3>
            <p className="text-muted-foreground">Formalize your discipleship journey with shared expectations and mutual commitment.</p>
          </div>
          
          <div className="flex flex-col items-center text-center animate-in" style={{ animationDelay: '500ms' }}>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm ring-1 ring-border">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Leader & Learner</h3>
            <p className="text-muted-foreground">Seamlessly connect with mentors or mentees to begin a structured growth path.</p>
          </div>
          
          <div className="flex flex-col items-center text-center animate-in" style={{ animationDelay: '600ms' }}>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm ring-1 ring-border">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-Time Chat</h3>
            <p className="text-muted-foreground">Stay connected with instant messaging and notifications for ongoing encouragement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
