import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Loader2, MessageSquare, UserPlus, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Message {
  id: string | number;
  sender_id: string | number;
  receiver_id: string | number;
  message: string;
  created_at: string;
  sender?: any;
  receiver?: any;
  is_read?: boolean;
}

interface Conversation {
  partner: any;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Communication: React.FC = () => {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePartnerIdRef = useRef<string | number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const groupMessagesByPartner = useCallback((chats: Message[]) => {
    const map: Record<string, Conversation> = {};
    if (!user || !Array.isArray(chats)) return [];

    chats.forEach(chat => {
      const partnerId = String(chat.sender_id) === String(user.id) ? String(chat.receiver_id) : String(chat.sender_id);
      let partner = String(chat.sender_id) === String(user.id) ? chat.receiver : chat.sender;

      if (!map[partnerId]) {
        map[partnerId] = {
          partner: partner || { id: partnerId, name: 'User' },
          lastMessage: chat.message,
          lastMessageTime: chat.created_at,
          unreadCount: 0
        };
      } else if (new Date(chat.created_at) > new Date(map[partnerId].lastMessageTime)) {
        map[partnerId].lastMessage = chat.message;
        map[partnerId].lastMessageTime = chat.created_at;
      }

      if (!chat.is_read && String(chat.receiver_id) === String(user.id)) {
        map[partnerId].unreadCount++;
      }
    });

    return Object.values(map).sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [user?.id]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get('/chats');
      const rawData = res.data?.data ?? res.data;
      const flat = Array.isArray(rawData) ? rawData : [];
      const grouped = groupMessagesByPartner(flat);
      setConversations(grouped);
    } catch (err) {
      setConversations([]);
      console.warn("Failed to load conversation list", err);
    } finally {
      setIsChatsLoading(false);
    }
  }, [groupMessagesByPartner]);

  useEffect(() => {
    fetchChats();
    api.get('/chats/available-contacts').then(res => {
      const rawData = res.data?.data ?? res.data;
      setAvailableContacts(Array.isArray(rawData) ? rawData : []);
    }).catch(() => setAvailableContacts([]));
  }, [fetchChats]);

  // Real-time Chat Listener
  useEffect(() => {
    if ((window as any).Echo && user) {
      const channel = (window as any).Echo.private(`chat.${user.id}`)
        .listen('.MessageSent', (e: any) => {
          // Update messages if the sender is currently the active chat partner
          if (String(e.sender_id) === String(activePartnerIdRef.current)) {
            setMessages(prev => {
              const current = Array.isArray(prev) ? prev : [];
              if (current.find(m => m.id === e.id)) return current;
              return [...current, e];
            });
            api.post('/chats/mark-as-read', { partner_id: e.sender_id }).catch(() => {});
          }
          
          // Refresh list to show updated snippets/unread indicators
          fetchChats();
        });

      return () => {
        (window as any).Echo.leave(`chat.${user.id}`);
      };
    }
  }, [user?.id, fetchChats]);

  useEffect(() => {
    if (!activeConversation?.partner?.id) {
      activePartnerIdRef.current = null;
      return;
    }

    const partnerId = activeConversation.partner.id;
    activePartnerIdRef.current = partnerId;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/chats', { params: { partner_id: partnerId } });
        const rawData = res.data?.data ?? res.data;
        setMessages(Array.isArray(rawData) ? rawData : []);
        api.post('/chats/mark-as-read', { partner_id: partnerId }).catch(() => {});
        setConversations(prev => Array.isArray(prev) ? prev.map(c => 
          String(c.partner.id) === String(partnerId) ? { ...c, unreadCount: 0 } : c
        ) : []);
      } catch (err) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [activeConversation?.partner?.id]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!msg.trim() || !activeConversation) return;
    
    const partnerId = activeConversation.partner.id;
    const content = msg;
    setMsg('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || '0',
      receiver_id: partnerId,
      message: content,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...(Array.isArray(prev) ? prev : []), tempMsg]);

    try {
      const res = await api.post('/chats', {
        receiver_id: partnerId,
        message: content
      });
      
      const realMsg = res.data?.data ?? res.data;
      setMessages(prev => Array.isArray(prev) ? prev.map(m => m.id === tempMsg.id ? realMsg : m) : [realMsg]);
      fetchChats();
    } catch (err) {
      console.error("Message delivery failed", err);
      setMessages(prev => Array.isArray(prev) ? prev.filter(m => m.id !== tempMsg.id) : []);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      <div className={`lg:w-80 flex flex-col gap-4 ${activeConversation ? 'hidden lg:flex' : 'flex w-full'}`}>
        <div className="card-premium p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-gray-800">Messages</h2>
            <button onClick={() => setShowNewChat(!showNewChat)} className="p-2 bg-blue-50 text-brand-primary rounded-xl transition-colors hover:bg-blue-100">
              <UserPlus size={18} />
            </button>
          </div>

          {showNewChat && (
            <div className="mb-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Your Contacts</p>
               <div className="space-y-1">
                 {Array.isArray(availableContacts) && availableContacts.map(c => (
                   <button key={c.id} onClick={() => { setActiveConversation({partner: c, lastMessage: '', lastMessageTime: '', unreadCount: 0}); setShowNewChat(false); }} className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-xl text-left transition-colors">
                     <span className="text-xs font-bold text-gray-700">{c.name}</span>
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div className="space-y-1">
            {isChatsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" size={24} /></div>
            ) : Array.isArray(conversations) && conversations.length > 0 ? (
              conversations.map((conv) => (
                <button 
                  key={conv.partner.id} 
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeConversation?.partner?.id === conv.partner.id ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className={activeConversation?.partner?.id === conv.partner.id ? 'text-white/60' : 'text-gray-400'} />
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate">{conv.partner.name}</p>
                    <p className={`text-[10px] truncate ${activeConversation?.partner?.id === conv.partner.id ? 'text-blue-100' : 'text-gray-400'}`}>{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && <div className="w-2 h-2 bg-brand-secondary rounded-full" />}
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-xs font-bold">No conversations found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`flex-1 flex flex-col gap-4 ${activeConversation ? 'flex' : 'hidden lg:flex'}`}>
        {activeConversation ? (
          <>
            <div className="card-premium flex-1 p-6 flex flex-col overflow-hidden border-gray-100">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-50">
                <button onClick={() => setActiveConversation(null)} className="lg:hidden text-gray-400"><ChevronLeft size={24} /></button>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-primary font-bold">
                  {(activeConversation.partner.name || 'U')[0]}
                </div>
                <h3 className="font-bold text-gray-800">{activeConversation.partner.name}</h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center h-full"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>
                ) : Array.isArray(messages) && (
                  messages.map((m) => {
                    const isOwn = String(m.sender_id) === String(user?.id);
                    return (
                      <div key={m.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-[80%] ${isOwn ? 'bg-brand-primary text-white rounded-tr-none shadow-sm' : 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-200'}`}>
                          <p className="text-sm font-medium">{m.message}</p>
                        </div>
                        <p className="text-[8px] text-gray-400 font-bold mt-1 uppercase">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="card-premium p-3 flex items-center gap-3 shadow-lg border-gray-100">
              <textarea 
                rows={1}
                value={msg} 
                onChange={(e) => setMsg(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your message..." 
                className="flex-1 text-sm font-semibold outline-none py-2 resize-none bg-transparent" 
              />
              <button 
                onClick={handleSend}
                disabled={!msg.trim()}
                className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="card-premium flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60 border-gray-100">
             <MessageSquare size={40} className="text-gray-300 mb-4" />
             <h3 className="text-xl font-bold text-gray-800">Select a chat</h3>
             <p className="text-sm text-gray-500 max-w-xs">Choose a contact to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;