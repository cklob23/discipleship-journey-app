import { useState, useEffect } from 'react';

export type Role = 'leader' | 'learner' | null;

export interface UserState {
  role: Role;
  name: string;
  partnerName: string;
  isCovenantSigned: boolean;
  currentWeek: number;
}

export interface ProgressState {
  completedAssignments: string[]; // IDs of assignments
  completedActionItems: string[]; // IDs of action items
}

export interface Message {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: string;
}

export const useJourney = () => {
  const [user, setUser] = useState<UserState>(() => {
    const saved = localStorage.getItem('dj_user');
    return saved ? JSON.parse(saved) : {
      role: null,
      name: '',
      partnerName: '',
      isCovenantSigned: false,
      currentWeek: 1
    };
  });

  const [progress, setProgress] = useState<ProgressState>(() => {
    const saved = localStorage.getItem('dj_progress');
    return saved ? JSON.parse(saved) : {
      completedAssignments: [],
      completedActionItems: []
    };
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('dj_messages');
    return saved ? JSON.parse(saved) : [
      { id: '1', sender: 'partner', text: 'Welcome to the journey! I am excited to walk with you.', timestamp: new Date().toISOString() }
    ];
  });

  const [notifications, setNotifications] = useState<string[]>(() => {
    const saved = localStorage.getItem('dj_notifications');
    return saved ? JSON.parse(saved) : ['Your journey has begun!'];
  });

  useEffect(() => {
    localStorage.setItem('dj_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('dj_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('dj_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('dj_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const updateRole = (role: Role) => setUser(prev => ({ ...prev, role }));
  const updateNames = (name: string, partnerName: string) => setUser(prev => ({ ...prev, name, partnerName }));
  const signCovenant = () => setUser(prev => ({ ...prev, isCovenantSigned: true }));
  
  const toggleAssignment = (id: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedAssignments.includes(id);
      return {
        ...prev,
        completedAssignments: isCompleted 
          ? prev.completedAssignments.filter(a => a !== id)
          : [...prev.completedAssignments, id]
      };
    });
  };

  const toggleActionItem = (id: string) => {
    setProgress(prev => {
      const isCompleted = prev.completedActionItems.includes(id);
      return {
        ...prev,
        completedActionItems: isCompleted 
          ? prev.completedActionItems.filter(a => a !== id)
          : [...prev.completedActionItems, id]
      };
    });
  };

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addNotification = (text: string) => {
    setNotifications(prev => [text, ...prev]);
  };

  const clearProgress = () => {
    localStorage.removeItem('dj_user');
    localStorage.removeItem('dj_progress');
    localStorage.removeItem('dj_messages');
    localStorage.removeItem('dj_notifications');
    window.location.href = '/';
  };

  return {
    user,
    progress,
    messages,
    notifications,
    updateRole,
    updateNames,
    signCovenant,
    toggleAssignment,
    toggleActionItem,
    sendMessage,
    addNotification,
    clearProgress
  };
};
