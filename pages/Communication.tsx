
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, User, Loader2, MessageSquare, UserPlus, ChevronLeft, Clock } from 'lucide-react';
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
  const listenerAttachedRef = useRef<boolean>(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '...';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '...';
    }
  };

  const groupMessagesByPartner = useCallback((chats: Message[]) => {
    const map: Record<string, Conversation> = {};
    if (!user || !Array.isArray(chats)) return [];

    chats.forEach(chat => {
      if (!chat || !chat.sender_id || !chat.receiver_id) return;
      
      const partnerId = String(chat.sender_id) === String(user.id) ? String(chat.receiver_id) : String(chat.sender_id);
      let partner = String(chat.sender_id) === String(user.id) ? chat.receiver : chat.sender;

      if (!map[partnerId]) {
        map[partnerId] = {
          partner: partner || { id: partnerId, name: 'User' },
          lastMessage: chat.message || '',
          lastMessageTime: chat.created_at || new Date().toISOString(),
          unreadCount: 0
        };
      } else if (new Date(chat.created_at).getTime() > new Date(map[partnerId].lastMessageTime).getTime()) {
        map[partnerId].lastMessage = chat.message || '';
        map[partnerId].lastMessageTime = chat.created_at || map[partnerId].lastMessageTime;
      }

      if (!chat.is_read && String(chat.receiver_id) === String(user.id)) {
        map[partnerId].unreadCount++;
      }
    });

    return Object.values(map).sort((a, b) => {
      const timeA = new Date(a.lastMessageTime).getTime() || 0;
      const timeB = new Date(b.lastMessageTime).getTime() || 0;
      return timeB - timeA;
    });
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
      console.warn("Chat ledger sync issue:", err);
    } finally {
      setIsChatsLoading(false);
    }
  }, [groupMessagesByPartner]);

  // Initial data fetch
  useEffect(() => {
    fetchChats();
    api.get('/chats/available-contacts').then(res => {
      const rawData = res.data?.data ?? res.data;
      setAvailableContacts(Array.isArray(rawData) ? rawData : []);
    }).catch(() => setAvailableContacts([]));
  }, [fetchChats]);

  // Real-time synchronization
  useEffect(() => {
    const Echo = (window as any).Echo;
    if (Echo && user?.id && !listenerAttachedRef.current) {
      try {
        Echo.private(`chat.${user.id}`)
          .listen('.MessageSent', (e: any) => {
            if (!e) return;
            if (String(e.sender_id) === String(activePartnerIdRef.current)) {
              setMessages(prev => {
                if (prev.find(m => m && m.id === e.id)) return prev;
                return [...prev, e];
              });
              api.post('/chats/mark-as-read', { partner_id: e.sender_id }).catch(() => {});
            }
            fetchChats();
          });
        listenerAttachedRef.current = true;
      } catch (err) {
        console.warn("WebSocket layer unavailable.");
      }
    }

    return () => {
      if (Echo && user?.id) {
        Echo.leave(`chat.${user.id}`);
        listenerAttachedRef.current = false;
      }
    };
  }, [user?.id, fetchChats]);

  // Conversation history fetch
  useEffect(() => {
    const partnerId = activeConversation?.partner?.id;
    if (!partnerId) {
      activePartnerIdRef.current = null;
      setMessages([]);
      return;
    }

    activePartnerIdRef.current = partnerId;
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/chats', { params: { partner_id: partnerId } });
        const rawData = res.data?.data ?? res.data;
        setMessages(Array.isArray(rawData) ? rawData : []);
        
        // Zero out unread count locally for better UX
        setConversations(prev => prev.map(c => 
          String(c?.partner?.id) === String(partnerId) ? { ...c, unreadCount: 0 } : c
        ));
        
        api.post('/chats/mark-as-read', { partner_id: partnerId }).catch(() => {});
      } catch (err) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [activeConversation?.partner?.id]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleSend = async () => {
    const partnerId = activeConversation?.partner?.id;
    if (!msg.trim() || !partnerId) return;
    
    const content = msg;
    setMsg('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || '0',
      receiver_id: partnerId,
      message: content,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await api.post('/chats', {
        receiver_id: partnerId,
        message: content
      });
      
      const realMsg = res.data?.data ?? res.data;
      setMessages(prev => prev.map(m => (m && m.id === tempMsg.id) ? realMsg : m));
      fetchChats();
    } catch (err) {
      setMessages(prev => prev.filter(m => m && m.id !== tempMsg.id));
    }
  };

  const safeConversations = useMemo(() => conversations.filter(Boolean), [conversations]);
  const safeAvailableContacts = useMemo(() => availableContacts.filter(Boolean), [availableContacts]);
  const safeMessages = useMemo(() => messages.filter(Boolean), [messages]);

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
            <div className="mb-4 p-3 bg-blue-50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
               <p className="text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">Available Contacts</p>
               <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                 {safeAvailableContacts.map((c, idx) => (
                   <button 
                     key={c?.id || `contact-${idx}`} 
                     onClick={() => { setActiveConversation({partner: c, lastMessage: '', lastMessageTime: '', unreadCount: 0}); setShowNewChat(false); }} 
                     className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-xl text-left transition-colors"
                   >
                     <div className="w-6 h-6 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-[10px] font-bold text-brand-primary">{(c?.name || 'C')[0]}</div>
                     <span className="text-xs font-bold text-gray-700 truncate">{c?.name || 'Unknown'}</span>
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div className="space-y-1">
            {isChatsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" size={24} /></div>
            ) : safeConversations.length > 0 ? (
              safeConversations.map((conv, idx) => (
                <button 
                  key={conv?.partner?.id || `conv-${idx}`} 
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${String(activeConversation?.partner?.id) === String(conv?.partner?.id) ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className={String(activeConversation?.partner?.id) === String(conv?.partner?.id) ? 'text-white/60' : 'text-gray-400'} />
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate">{conv?.partner?.name || 'Unknown'}</p>
                    <p className={`text-[10px] truncate font-medium ${String(activeConversation?.partner?.id) === String(conv?.partner?.id) ? 'text-blue-100' : 'text-gray-400'}`}>{conv?.lastMessage}</p>
                  </div>
                  {conv?.unreadCount > 0 && <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" />}
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
                <button onClick={() => setActiveConversation(null)} className="lg:hidden text-gray-400 hover:text-brand-primary"><ChevronLeft size={24} /></button>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-primary font-black border border-blue-100">
                  {(activeConversation?.partner?.name || 'U')[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none">{activeConversation?.partner?.name || 'Chat'}</h3>
                  <p className="text-[10px] font-bold text-green-500 uppercase mt-1">Secured Channel</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="animate-spin text-brand-primary" size={32}/>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Parsing Archive...</p>
                  </div>
                ) : (
                  safeMessages.map((m, idx) => {
                    const isOwn = String(m.sender_id) === String(user?.id);
                    return (
                      <div key={m.id || `msg-${idx}`} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-[85%] ${isOwn ? 'bg-brand-primary text-white rounded-tr-none shadow-sm' : 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-200'}`}>
                          <p className="text-sm font-medium leading-relaxed">{m.message}</p>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase flex items-center gap-1">
                          <Clock size={10} /> {formatTime(m.created_at)}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="card-premium p-3 flex items-center gap-3 shadow-xl border-gray-100">
              <textarea 
                rows={1}
                value={msg} 
                onChange={(e) => setMsg(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Compose message..." 
                className="flex-1 text-sm font-bold outline-none py-3 px-4 resize-none bg-gray-50 rounded-xl focus:bg-white transition-all" 
              />
              <button 
                onClick={handleSend}
                disabled={!msg.trim()}
                className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="card-premium flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60 border-gray-100">
             <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
                <MessageSquare size={48} strokeWidth={1} />
             </div>
             <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Encrypted Terminal</h3>
             <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">Select a peer from the side directory to initialize an encrypted communication session.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
