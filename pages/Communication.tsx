
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, User, Loader2, MessageSquare, UserPlus, ChevronLeft, Clock, Wifi, WifiOff } from 'lucide-react';
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
  const [searchParams] = useSearchParams();
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isEchoConnected, setIsEchoConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePartnerIdRef = useRef<string | number | null>(null);
  const isMountedRef = useRef(true);

  const fetchChatsRef = useRef<() => Promise<void>>(async () => { });

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '...' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '...';
    }
  };

  const groupMessagesByPartner = useCallback((chats: Message[]) => {
    const map: Record<string, Conversation> = {};
    if (!user || !Array.isArray(chats)) return [];

    chats.filter(Boolean).forEach(chat => {
      if (!chat.sender_id || !chat.receiver_id) return;

      const partnerId = String(chat.sender_id) === String(user.id) ? String(chat.receiver_id) : String(chat.sender_id);
      let partner = String(chat.sender_id) === String(user.id) ? chat.receiver : chat.sender;

      if (!map[partnerId]) {
        map[partnerId] = {
          partner: partner ? {
            ...partner,
            name: partner.school?.name ? `${partner.name} (${partner.school.name})` : partner.name
          } : { id: partnerId, name: 'User' },
          lastMessage: chat.message || '',
          lastMessageTime: chat.created_at || new Date().toISOString(),
          unreadCount: 0
        };
      } else {
        const currentMsgTime = new Date(chat.created_at).getTime() || 0;
        const storedMsgTime = new Date(map[partnerId].lastMessageTime).getTime() || 0;
        if (currentMsgTime > storedMsgTime) {
          map[partnerId].lastMessage = chat.message || '';
          map[partnerId].lastMessageTime = chat.created_at;
        }
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
    // Only fetch if authenticated and token is available
    const token = localStorage.getItem('eschool_token');
    if (!user || !token) return;

    try {
      const res = await api.get('/chats');
      if (!isMountedRef.current) return;
      const rawData = res.data?.data ?? res.data;
      const flat = Array.isArray(rawData) ? rawData : [];
      const grouped = groupMessagesByPartner(flat);
      setConversations(grouped);

      // Handle deep linking from partner_id in URL
      const partnerIdParam = searchParams.get('partner_id');
      if (partnerIdParam && !activePartnerIdRef.current) {
        const targetConv = grouped.find(c => String(c.partner.id) === String(partnerIdParam));
        if (targetConv) {
          setActiveConversation(targetConv);
        } else {
          // If not in conversations, check available contacts
          api.get('/chats/available-contacts').then(res => {
            const contacts = res.data?.data ?? res.data;
            const contact = contacts.find((c: any) => String(c.id) === String(partnerIdParam));
            if (contact) {
              setActiveConversation({
                partner: {
                  ...contact,
                  name: contact.school?.name ? `${contact.name} (${contact.school.name})` : contact.name
                },
                lastMessage: '',
                lastMessageTime: '',
                unreadCount: 0
              });
            }
          }).catch(() => { });
        }
      }
    } catch (err) {
      console.warn("Chat synchronization offline.");
    } finally {
      if (isMountedRef.current) setIsChatsLoading(false);
    }
  }, [groupMessagesByPartner, user]);

  useEffect(() => {
    fetchChatsRef.current = fetchChats;
  }, [fetchChats]);

  useEffect(() => {
    if (!user || !localStorage.getItem('eschool_token')) return;

    fetchChats();
    api.get('/chats/available-contacts').then(res => {
      if (!isMountedRef.current) return;
      const rawData = res.data?.data ?? res.data;
      const contacts = Array.isArray(rawData) ? rawData : [];
      const normalizedContacts = contacts.map(c => ({
        ...c,
        name: c.school?.name ? `${c.name} (${c.school.name})` : c.name
      }));
      setAvailableContacts(normalizedContacts);
    }).catch(() => { });
  }, [fetchChats, user]);

  useEffect(() => {
    const Echo = (window as any).Echo;
    if (!Echo || !user?.id) return;

    const onConnected = () => setIsEchoConnected(true);
    const onDisconnected = () => setIsEchoConnected(false);

    try {
      // Defensive implementation to prevent crashes if Pusher internals are missing
      const connection = Echo.connector?.pusher?.connection;
      if (connection) {
        connection.bind('connected', onConnected);
        connection.bind('disconnected', onDisconnected);
        if (connection.state === 'connected') setIsEchoConnected(true);
      }

      const channel = Echo.private(`chat.${user.id}`);

      const handleMessage = (payload: any) => {
        const e = payload?.message || payload;
        if (!e || !isMountedRef.current) return;

        if (String(e.sender_id) === String(activePartnerIdRef.current)) {
          setMessages(prev => {
            const current = Array.isArray(prev) ? prev : [];
            if (current.find(m => m && m.id === e.id)) return current;
            return [...current, e];
          });
          api.patch('/chats/mark-as-read', { partner_id: e.sender_id }).catch(() => { });
        }
        fetchChatsRef.current();
      };

      // Handle both standard and prefixed event names for maximum reliability
      channel.listen('.MessageSent', handleMessage);
      channel.listen('MessageSent', handleMessage);

    } catch (err) {
      console.warn("WebSocket node binding error:", err);
    }

    return () => {
      try {
        const connection = Echo.connector?.pusher?.connection;
        if (connection) {
          connection.unbind('connected', onConnected);
          connection.unbind('disconnected', onDisconnected);
        }
        Echo.leave(`chat.${user.id}`);
      } catch (e) { }
    };
  }, [user?.id]);

  useEffect(() => {
    const partnerId = activeConversation?.partner?.id;
    activePartnerIdRef.current = partnerId || null;

    if (!partnerId || !user) {
      setMessages([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/chats', { params: { partner_id: partnerId } });
        if (!isMountedRef.current) return;
        const rawData = res.data?.data ?? res.data;
        setMessages(Array.isArray(rawData) ? rawData : []);

        setConversations(prev => {
          const current = Array.isArray(prev) ? prev : [];
          return current.map(c =>
            String(c?.partner?.id) === String(partnerId) ? { ...c, unreadCount: 0 } : c
          );
        });

        api.patch('/chats/mark-as-read', { partner_id: partnerId }).catch(() => { });
      } catch (err) {
        if (isMountedRef.current) setMessages([]);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    fetchHistory();
  }, [activeConversation?.partner?.id, user]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleSend = async () => {
    const partnerId = activeConversation?.partner?.id;
    if (!msg.trim() || !partnerId || !user) return;

    const content = msg;
    setMsg('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user?.id || '0',
      receiver_id: partnerId,
      message: content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => {
      const current = Array.isArray(prev) ? prev : [];
      return [...current, tempMsg];
    });

    try {
      const res = await api.post('/chats', {
        receiver_id: partnerId,
        message: content
      });

      if (!isMountedRef.current) return;
      const realMsg = res.data?.data ?? res.data;
      setMessages(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return current.map(m => (m && m.id === tempMsg.id) ? (realMsg?.message ? realMsg : (realMsg.data || realMsg)) : m);
      });
      fetchChats();
    } catch (err) {
      if (isMountedRef.current) {
        setMessages(prev => {
          const current = Array.isArray(prev) ? prev : [];
          return current.filter(m => m && m.id !== tempMsg.id);
        });
      }
    }
  };

  const safeConversations = Array.isArray(conversations) ? conversations.filter(Boolean) : [];
  const safeContacts = Array.isArray(availableContacts) ? availableContacts.filter(Boolean) : [];

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      <div className={`lg:w-80 flex flex-col gap-4 ${activeConversation ? 'hidden lg:flex' : 'flex w-full'}`}>
        <div className="card-premium p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">Messages</h2>
              {isEchoConnected ? (
                /* Fix: Lucide icons do not support the 'title' prop. Wrapping in a span with the title attribute instead. */
                <span title="Connected"><Wifi size={14} className="text-green-500" /></span>
              ) : (
                /* Fix: Lucide icons do not support the 'title' prop. Wrapping in a span with the title attribute instead. */
                <span title="Offline"><WifiOff size={14} className="text-gray-300" /></span>
              )}
            </div>
            <button onClick={() => setShowNewChat(!showNewChat)} className="p-2 bg-blue-50 text-brand-primary rounded-xl transition-colors hover:bg-blue-100">
              <UserPlus size={18} />
            </button>
          </div>

          {showNewChat && (
            <div className="mb-4 p-3 bg-blue-50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">Available Contacts</p>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {safeContacts.map((c, idx) => (
                  <button
                    key={c?.id || `contact-${idx}`}
                    onClick={() => { setActiveConversation({ partner: c, lastMessage: '', lastMessageTime: '', unreadCount: 0 }); setShowNewChat(false); }}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-xl text-left transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-[10px] font-bold text-brand-primary">{(c?.name || 'C')[0]}</div>
                    <span className="text-xs font-bold text-gray-700 truncate">{c?.name || 'Unknown'}</span>
                  </button>
                ))}
                {safeContacts.length === 0 && <p className="p-4 text-center text-[10px] font-bold text-gray-400">Empty directory</p>}
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
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${String(activeConversation?.partner?.id) === String(conv?.partner?.id) ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User size={20} className={String(activeConversation?.partner?.id) === String(conv?.partner?.id) ? 'text-white/60' : 'text-gray-400'} />
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate">{conv?.partner?.name || 'Unknown'}</p>
                    <p className={`text-[10px] truncate font-medium ${String(activeConversation?.partner?.id) === String(conv?.partner?.id) ? 'text-blue-100' : 'text-gray-400'}`}>{conv?.lastMessage}</p>
                  </div>
                  {conv?.unreadCount > 0 && <div className="w-2.5 h-2.5 bg-brand-secondary rounded-full animate-pulse shadow-sm" />}
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p className="text-xs font-bold">No active threads</p>
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
                <button onClick={() => setActiveConversation(null)} className="lg:hidden text-gray-400 hover:text-brand-primary transition-colors"><ChevronLeft size={24} /></button>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-brand-primary font-black border border-blue-100">
                  {(activeConversation?.partner?.name || 'U')[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 leading-none">{activeConversation?.partner?.name || 'Chat'}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-[10px] font-bold text-green-500 uppercase">Secured Channel</p>
                    <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                    <p className="text-[10px] font-bold text-gray-300 uppercase">{isEchoConnected ? 'Real-time' : 'Cached'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="animate-spin text-brand-primary" size={32} />
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Parsing Archive...</p>
                  </div>
                ) : (
                  Array.isArray(messages) && messages.filter(Boolean).map((m, idx) => {
                    const isOwn = String(m.sender_id) === String(user?.id);
                    return (
                      <div key={m.id || `msg-${idx}`} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>
                        <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${isOwn ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-200'}`}>
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
                className="flex-1 text-sm font-bold outline-none py-3 px-4 resize-none bg-gray-50 rounded-xl focus:bg-white transition-all custom-scrollbar"
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
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6 border border-gray-100 shadow-inner">
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
