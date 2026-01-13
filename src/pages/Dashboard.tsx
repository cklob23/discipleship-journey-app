import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { blink } from '@/lib/blink';
import { Link } from 'react-router-dom';
import { Plus, Search, MessageSquare, Handshake, LogOut, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectionWithProfile {
  id: string;
  status: string;
  leaderId: string;
  learnerId: string;
  otherProfile: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
}

export default function Dashboard() {
  const { profile, signOut } = useProfile();
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [pendingInvites, setPendingInvites] = useState<ConnectionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchConnections = async () => {
    if (!profile) return;
    try {
      const field = profile.role === 'leader' ? 'leaderId' : 'learnerId';
      const otherField = profile.role === 'leader' ? 'learnerId' : 'leaderId';
      
      const allCons = await blink.db.connections.list({
        where: { [field]: profile.id }
      });

      const active = allCons.filter((c: any) => c.status === 'active');
      const pending = allCons.filter((c: any) => c.status === 'pending');

      const enhance = async (cons: any[]) => {
        return Promise.all(cons.map(async (c: any) => {
          const otherProfile = await blink.db.profiles.get(c[otherField]);
          return { ...c, otherProfile };
        }));
      };

      setConnections(await enhance(active));
      setPendingInvites(await enhance(pending));
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [profile]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !profile) return;
    try {
      const targetRole = profile.role === 'leader' ? 'learner' : 'leader';
      const results = await blink.db.profiles.list({
        where: {
          AND: [
            { role: targetRole },
            { id: { ne: profile.id } }
          ]
        },
        limit: 5
      });
      // Simple client-side search since we don't have full-text search yet
      const filtered = results.filter((p: any) => 
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const invitePerson = async (targetId: string) => {
    if (!profile) return;
    try {
      const leaderId = profile.role === 'leader' ? profile.id : targetId;
      const learnerId = profile.role === 'learner' ? profile.id : targetId;

      await blink.db.connections.create({
        leaderId: leaderId,
        learnerId: learnerId,
        status: 'pending'
      });

      toast.success('Invitation sent!');
      setSearchResults([]);
      setSearchQuery('');
      fetchConnections();
    } catch (error) {
      console.error('Invite error:', error);
      toast.error('Failed to send invitation.');
    }
  };

  const acceptInvite = async (connId: string) => {
    try {
      await blink.db.connections.update(connId, { status: 'active' });
      toast.success('Invitation accepted!');
      fetchConnections();
    } catch (error) {
      console.error('Accept error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Handshake className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Connect</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold leading-none">{profile?.displayName}</span>
              <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback>{profile?.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-4 space-y-10">
        {/* Search Section */}
        <section className="animate-in">
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder={`Find a ${profile?.role === 'leader' ? 'learner' : 'leader'} by name...`}
              className="h-14 rounded-2xl pl-12 pr-32 shadow-xl border-border/50 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              className="absolute right-2 top-2 h-10 rounded-xl px-6" 
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mx-auto mt-4 max-w-2xl divide-y rounded-2xl border bg-background shadow-2xl animate-in">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={result.avatarUrl} />
                      <AvatarFallback>{result.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{result.displayName}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{result.role}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => invitePerson(result.id)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Connect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* Active Connections */}
            <section className="animate-in" style={{ animationDelay: '100ms' }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Active Journeys</h2>
                <Badge variant="outline" className="rounded-full px-3">{connections.length}</Badge>
              </div>

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2].map((i) => <Card key={i} className="h-40 animate-pulse bg-muted/50" />)}
                </div>
              ) : connections.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {connections.map((conn) => (
                    <Link key={conn.id} to={`/connection/${conn.id}`}>
                      <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:ring-2 hover:ring-primary/10 border-border/50">
                        <CardHeader className="flex flex-row items-center gap-4 pb-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/5 group-hover:border-primary/20 transition-colors">
                            <AvatarImage src={conn.otherProfile.avatarUrl} />
                            <AvatarFallback>{conn.otherProfile.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <CardTitle className="truncate">{conn.otherProfile.displayName}</CardTitle>
                            <CardDescription className="capitalize">{conn.otherProfile.role}</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between pt-0">
                          <Badge className="bg-primary/5 text-primary hover:bg-primary/10 border-transparent">Active Journey</Badge>
                          <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed bg-transparent flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                  <div className="mb-4 rounded-full bg-secondary p-4">
                    <Handshake className="h-8 w-8" />
                  </div>
                  <p className="max-w-[200px]">Search for someone to start your discipleship journey.</p>
                </Card>
              )}
            </section>
          </div>

          {/* Pending Section */}
          <aside className="space-y-6 animate-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold tracking-tight">Pending Invites</h2>
            {pendingInvites.length > 0 ? (
              <div className="space-y-3">
                {pendingInvites.map((conn) => (
                  <Card key={conn.id} className="bg-background/50 border-border/50">
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={conn.otherProfile.avatarUrl} />
                          <AvatarFallback>{conn.otherProfile.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{conn.otherProfile.displayName}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => acceptInvite(conn.id)}>Accept</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs">Ignore</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No pending invitations.</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
