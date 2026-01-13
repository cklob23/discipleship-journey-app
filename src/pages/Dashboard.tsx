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

interface Connection {
  id: string;
  status: string;
  leaderId: string;
  learnerId: string;
  otherDisplayName: string;
  otherAvatarUrl?: string;
  otherRole: string;
}

export default function Dashboard() {
  const { profile, signOut } = useProfile();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchConnections = async () => {
    if (!profile) return;
    try {
      // Fetch connections where user_id matches current user (RLS compliant)
      const allCons = await blink.db.connections.list({
        where: { userId: profile.userId }
      });

      // Profile info is embedded in connection record - no need to fetch separately
      const active = allCons.filter((c: any) => c.status === 'active') as Connection[];
      const pending = allCons.filter((c: any) => c.status === 'pending') as Connection[];

      setConnections(active);
      setPendingInvites(pending);
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
      // Fetch all profiles - we'll filter client-side for flexibility
      const results = await blink.db.profiles.list({
        limit: 50
      });
      
      const searchLower = searchQuery.toLowerCase();
      // Client-side filtering: exclude self, match role if specified, match search query
      const filtered = results.filter((p: any) => {
        // Exclude current user
        if (p.userId === profile.userId) return false;
        
        // Get display name (handle both camelCase and snake_case)
        const name = p.displayName || p.display_name || '';
        const email = p.email || '';
        const role = p.role || '';
        
        // Match by name or email
        const matchesQuery = name.toLowerCase().includes(searchLower) || 
                            email.toLowerCase().includes(searchLower);
        
        // Optionally filter by opposite role for leader/learner matching
        const matchesRole = !targetRole || role === targetRole;
        
        return matchesQuery && matchesRole;
      });
      
      setSearchResults(filtered.slice(0, 10));
      
      if (filtered.length === 0) {
        toast.info('No users found matching your search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const invitePerson = async (targetProfile: any) => {
    if (!profile) return;
    try {
      const leaderId = profile.role === 'leader' ? profile.id : targetProfile.id;
      const learnerId = profile.role === 'learner' ? profile.id : targetProfile.id;

      // Get display names with fallbacks for both camelCase and snake_case
      const targetDisplayName = targetProfile.displayName || targetProfile.display_name || targetProfile.email || 'Unknown';
      const targetAvatarUrl = targetProfile.avatarUrl || targetProfile.avatar_url || '';
      const targetUserId = targetProfile.userId || targetProfile.user_id;

      // Generate a shared connection ID so both records link together
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      // Create connection record for current user (sender) - stores target's info
      await blink.db.connections.create({
        id: connectionId + '_sender',
        userId: profile.userId,
        leaderId: leaderId,
        learnerId: learnerId,
        status: 'pending',
        otherDisplayName: targetDisplayName,
        otherAvatarUrl: targetAvatarUrl,
        otherRole: targetProfile.role || 'user'
      });

      // Create connection record for target user (receiver) - stores sender's info
      await blink.db.connections.create({
        id: connectionId + '_receiver',
        userId: targetUserId,
        leaderId: leaderId,
        learnerId: learnerId,
        status: 'pending',
        otherDisplayName: profile.displayName,
        otherAvatarUrl: profile.avatarUrl || '',
        otherRole: profile.role
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
      // Update the current user's connection record
      await blink.db.connections.update(connId, { status: 'active' });
      
      // Update the paired record (swap _sender/_receiver suffix)
      const pairedId = connId.endsWith('_sender') 
        ? connId.replace('_sender', '_receiver')
        : connId.replace('_receiver', '_sender');
      
      try {
        await blink.db.connections.update(pairedId, { status: 'active' });
      } catch {
        // Paired record might not exist or user doesn't have access - that's okay
      }
      
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
              {searchResults.map((result) => {
                const displayName = result.displayName || result.display_name || result.email || 'Unknown';
                const avatarUrl = result.avatarUrl || result.avatar_url;
                return (
                  <div key={result.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{displayName}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{result.role || 'user'}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => invitePerson(result)}>
                      <UserPlus className="mr-2 h-4 w-4" /> Connect
                    </Button>
                  </div>
                );
              })}
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
                            <AvatarImage src={conn.otherAvatarUrl} />
                            <AvatarFallback>{conn.otherDisplayName?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <CardTitle className="truncate">{conn.otherDisplayName}</CardTitle>
                            <CardDescription className="capitalize">{conn.otherRole}</CardDescription>
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
                          <AvatarImage src={conn.otherAvatarUrl} />
                          <AvatarFallback>{conn.otherDisplayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{conn.otherDisplayName}</span>
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
