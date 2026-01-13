import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/use-profile';
import { blink } from '@/lib/blink';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, Send, ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Covenant {
  id: string;
  content: string;
  leaderSigned: number;
  learnerSigned: number;
}

export default function ConnectionDetail() {
  const { id } = useParams();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<any>(null);
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [covenant, setCovenant] = useState<Covenant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const channelRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchDetail = async () => {
    if (!id || !profile) return;
    try {
      const conn = await blink.db.connections.get(id);
      if (!conn) {
        navigate('/dashboard');
        return;
      }
      setConnection(conn);

      // Profile info is embedded in connection record
      setOtherProfile({
        id: profile.role === 'leader' ? (conn as any).learnerId : (conn as any).leaderId,
        displayName: (conn as any).otherDisplayName,
        avatarUrl: (conn as any).otherAvatarUrl,
        role: (conn as any).otherRole,
        userId: null // We don't have this but may not need it
      });

      const covs = await blink.db.covenants.list({ where: { userId: profile.userId } });
      // Filter to find covenant for this connection
      const connCov = covs.find((c: any) => c.connectionId === id);
      if (connCov) {
        setCovenant(connCov as unknown as Covenant);
      } else if (profile.role === 'leader') {
        const newCov = await blink.db.covenants.create({
          userId: profile.userId,
          connectionId: id,
          content: 'This covenant outlines our commitment to regular meetings, prayer, and shared learning...',
          leaderSigned: 0,
          learnerSigned: 0
        });
        setCovenant(newCov as unknown as Covenant);
      }

      const msgList = await blink.db.messages.list({
        where: { userId: profile.userId },
        orderBy: { createdAt: 'asc' }
      });
      // Filter to messages for this connection
      const connMsgs = msgList.filter((m: any) => m.connectionId === id);
      setMessages(connMsgs as unknown as Message[]);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast.error('Failed to load connection details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, profile]);

  useEffect(() => {
    if (!id || !profile) return;

    let channel: any = null;
    const setupRealtime = async () => {
      try {
        channel = blink.realtime.channel(`connection-${id}`);
        channelRef.current = channel;

        await channel.subscribe({ userId: profile.id });

        channel.onMessage((msg: any) => {
          if (msg.type === 'chat') {
            setMessages(prev => [...prev, {
              id: msg.id,
              content: msg.data.content,
              senderId: msg.userId,
              createdAt: new Date(msg.timestamp).toISOString()
            }]);
          } else if (msg.type === 'covenant_update') {
            setCovenant(msg.data.covenant);
            toast.info('Covenant has been updated');
          }
        });
      } catch (error) {
        console.error('Realtime setup error:', error);
      }
    };

    setupRealtime();
    return () => { channel?.unsubscribe(); };
  }, [id, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !id || !profile) return;
    try {
      const msgData = {
        userId: profile.userId,
        connectionId: id,
        senderId: profile.id,
        content: newMessage.trim()
      };

      await blink.db.messages.create(msgData);
      
      // Also create a message for the other user so they can see it
      if (otherProfile?.userId) {
        await blink.db.messages.create({
          userId: otherProfile.userId,
          connectionId: id,
          senderId: profile.id,
          content: newMessage.trim()
        });
      }
      
      await channelRef.current?.publish('chat', {
        content: newMessage.trim()
      }, { userId: profile.id });

      // Notify the other person via email
      if (otherProfile?.email) {
        await blink.notifications.email({
          to: otherProfile.email,
          subject: `New message from ${profile.displayName}`,
          text: `Hi ${otherProfile.displayName}, you have a new message: "${newMessage.trim()}"`
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send message');
    }
  };

  const signCovenant = async () => {
    if (!covenant || !profile) return;
    try {
      const updateData = profile.role === 'leader' 
        ? { leaderSigned: 1 } 
        : { learnerSigned: 1 };
      
      const updated = await blink.db.covenants.update(covenant.id, updateData);
      setCovenant(updated as unknown as Covenant);

      await channelRef.current?.publish('covenant_update', {
        covenant: updated
      }, { userId: profile.id });
      
      toast.success('Covenant signed!');
      setActiveTab('chat');
      } catch (error) {
      console.error('Signing error:', error);
    }
  };

  const updateCovenantContent = async (newContent: string) => {
    if (!covenant || profile?.role !== 'leader') return;
    try {
      const updated = await blink.db.covenants.update(covenant.id, {
        content: newContent,
        leaderSigned: 0,
        learnerSigned: 0
      });
      setCovenant(updated as unknown as Covenant);

      await channelRef.current?.publish('covenant_update', {
        covenant: updated
      }, { userId: profile.id });
    } catch (error) {
      console.error('Update covenant error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isSigned = profile?.role === 'leader' ? Number(covenant?.leaderSigned) > 0 : Number(covenant?.learnerSigned) > 0;
  const otherSigned = profile?.role === 'leader' ? Number(covenant?.learnerSigned) > 0 : Number(covenant?.leaderSigned) > 0;

  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      <header className="border-b bg-background px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-primary/5">
              <AvatarImage src={otherProfile?.avatarUrl} />
              <AvatarFallback>{otherProfile?.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-sm font-bold leading-none">{otherProfile?.displayName}</h1>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{otherProfile?.role}</p>
            </div>
          </div>
        </div>
        <Badge className={covenant?.leaderSigned && covenant?.learnerSigned ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"}>
          {Number(covenant?.leaderSigned) > 0 && Number(covenant?.learnerSigned) > 0 ? "Covenant Signed" : "Awaiting Signatures"}
        </Badge>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-background border-b px-4">
            <TabsList className="bg-transparent border-none p-0 h-12">
              <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2">
                <MessageCircle className="h-4 w-4" /> Message
              </TabsTrigger>
              <TabsTrigger value="covenant" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-6 flex gap-2">
                <ShieldCheck className="h-4 w-4" /> Covenant
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 m-0 p-0 overflow-hidden outline-none">
            <div className="flex flex-col h-full bg-background">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === profile?.id;
                    const showHeader = idx === 0 || messages[idx-1].senderId !== msg.senderId;
                    
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {showHeader && !isMe && (
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 ml-1">{otherProfile?.displayName}</span>
                        )}
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-secondary rounded-tl-none'}`}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <div className="p-4 bg-background border-t">
                <div className="max-w-3xl mx-auto relative">
                  <Textarea 
                    placeholder="Type a message..." 
                    className="min-h-[50px] max-h-[150px] rounded-2xl pr-14 resize-none border-border/50 shadow-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button size="icon" className="absolute right-2 bottom-2 h-10 w-10 rounded-xl" onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="covenant" className="flex-1 m-0 p-4 overflow-auto outline-none">
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5 pb-6">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-bold tracking-tight">Discipleship Covenant</CardTitle>
                    <Badge variant="outline" className="bg-background">Formal Agreement</Badge>
                  </div>
                  <CardDescription>
                    This document serves as a spiritual commitment between leader and learner.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                    {profile?.role === 'leader' ? (
                      <Textarea 
                        value={covenant?.content}
                        onChange={(e) => updateCovenantContent(e.target.value)}
                        className="min-h-[300px] border-none shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed resize-none"
                        placeholder="Define the terms of your discipleship journey..."
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-base leading-relaxed min-h-[300px]">
                        {covenant?.content}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-8 grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leader Signature</p>
                      {Number(covenant?.leaderSigned) > 0 ? (
                        <div className="flex items-center gap-2 text-green-600 font-medium italic border-b border-green-200 pb-2">
                          <ShieldCheck className="h-4 w-4" /> {profile?.role === 'leader' ? profile.displayName : otherProfile?.displayName}
                        </div>
                      ) : (
                        <div className="h-10 border-b border-dashed border-muted flex items-center text-muted-foreground italic text-xs">
                          {profile?.role === 'leader' ? 'Sign below to commit' : 'Pending leader signature'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Learner Signature</p>
                      {Number(covenant?.learnerSigned) > 0 ? (
                        <div className="flex items-center gap-2 text-green-600 font-medium italic border-b border-green-200 pb-2">
                          <ShieldCheck className="h-4 w-4" /> {profile?.role === 'learner' ? profile.displayName : otherProfile?.displayName}
                        </div>
                      ) : (
                        <div className="h-10 border-b border-dashed border-muted flex items-center text-muted-foreground italic text-xs">
                          {profile?.role === 'learner' ? 'Sign below to commit' : 'Pending learner signature'}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isSigned && (
                    <Button className="w-full h-12 text-lg rounded-xl shadow-lg" onClick={signCovenant}>
                      Agree to Covenant
                    </Button>
                  )}

                  {isSigned && !otherSigned && (
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      <p className="text-sm">You have signed. Waiting for {otherProfile?.displayName} to sign.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
