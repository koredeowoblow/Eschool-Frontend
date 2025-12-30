
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, User, Search, Paperclip, Loader2, MessageSquare, Inbox, UserPlus, ChevronLeft, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';

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
  partner: {
    id: string | number;
    name: string;
    avatar?: string;
    school?: { name: string };
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
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
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newMsgText, setNewMsgText] = useState('');
  const [isSendingNew, setIsSendingNew] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const groupChatsByPartner = useCallback((chats: Message[]) => {
    const map: Record<string, Conversation> = {};
    if (!user) return [];

    chats.forEach(chat => {
      const partnerId = String(chat.sender_id) === String(user.id) ? String(chat.receiver_id) : String(chat.sender_id);
      let partner = String(chat.sender_id) === String(user.id) ? chat.receiver : chat.sender;

      const partnerName = partner?.school 
        ? `${partner.name} (${partner.school.name})` 
        : (partner?.name || 'Academic Colleague');

      if (!map[partnerId]) {
        map[partnerId] = {
          partner: {
            id: partnerId,
            name: partnerName,
            avatar: partner?.avatar
          },
          lastMessage: chat.message,
          lastMessageTime: chat.created_at,
          unreadCount: 0,
          messages: []
        };
      } else {
        // Update latest message info if this chat is newer
        if (new Date(chat.created_at) > new Date(map[partnerId].lastMessageTime)) {
          map[partnerId].lastMessage = chat.message;
          map[partnerId].lastMessageTime = chat.created_at;
        }
      }

      map[partnerId].messages.push(chat);

      if (!chat.is_read && String(chat.receiver_id) === String(user.id)) {
        map[partnerId].unreadCount++;
      }
    });

    return Object.values(map).sort((a, b) =>
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  }, [user]);

  const fetchChats = useCallback(async () => {
    setIsChatsLoading(true);
    try {
      // Backend /chats returns flat messages as seen in legacy script
      const res = await api.get('/chats');
      const flatMessages = res.data.data || res.data || [];
      const grouped = groupChatsByPartner(flatMessages);
      setConversations(grouped);

      // Maintain sync for active conversation
      if (activeConversation) {
        const updated = grouped.find(c => String(c.partner.id) === String(activeConversation.partner.id));
        if (updated) setActiveConversation(updated);
      }
    } catch (err) {
      console.warn("Failed to load active chats", err);
    } finally {
      setIsChatsLoading(false);
    }
  }, [groupChatsByPartner, activeConversation]);

  const fetchAvailableContacts = async () => {
    try {
      const res = await api.get('/chats/available-contacts');
      setAvailableContacts(res.data.data || res.data || []);
    } catch (err) {
      console.warn("Failed to load contacts", err);
    }
  };

  useEffect(() => {
    fetchChats();
    fetchAvailableContacts();
  }, [fetchChats]);

  // Load history when a conversation is selected
  useEffect(() => {
    if (!activeConversation) return;

    const partnerId = activeConversation.partner.id;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/chats', { params: { partner_id: partnerId } });
        const history = res.data.data || res.data || [];
        setMessages(history);
        
        // Mark as read immediately on selection
        await api.patch('/chats/mark-as-read', { partner_id: partnerId }).catch(() => {});
        
        // Update local state to clear unread badge
        setConversations(prev => prev.map(c => 
          String(c.partner.id) === String(partnerId) ? { ...c, unreadCount: 0 } : c
        ));
      } catch (err) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();

    // Echo listener for incoming messages
    if ((window as any).Echo && user) {
      const channel = (window as any).Echo.private(`chat.${user.id}`)
        .listen('.MessageSent', (e: any) => {
          const senderId = String(e.sender_id);
          const currentPartnerId = String(partnerId);

          if (senderId === currentPartnerId) {
            setMessages(prev => {
              if (prev.find(m => String(m.id) === String(e.id))) return prev;
              return [...prev, e];
            });
            api.patch('/chats/mark-as-read', { partner_id: partnerId }).catch(() => {});
          }
          fetchChats();
        });

      return () => {
        (window as any).Echo.leave(`chat.${user.id}`);
      };
    }
  }, [activeConversation?.partner?.id, user?.id, fetchChats]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!msg.trim() || !activeConversation) return;
    
    const partnerId = activeConversation.partner.id;
    const messageContent = msg;
    setMsg('');

    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const tempMsg: Message = {
      id: tempId,
      sender_id: user?.id || '0',
      receiver_id: partnerId,
      message: messageContent,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.post('/chats', {
        receiver_id: partnerId,
        message: messageContent
      });
      fetchChats();
    } catch (err) {
      console.error("Failed to transmit", err);
      // Remove failed message
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleSendNew = async () => {
    if (!newRecipient || !newMsgText.trim()) return;
    setIsSendingNew(true);
    try {
      await api.post('/chats', {
        receiver_id: newRecipient,
        message: newMsgText
      });
      setIsNewMessageModalOpen(false);
      setNewMsgText('');
      setNewRecipient('');
      
      // Select the new conversation
      const contact = availableContacts.find(c => String(c.id) === String(newRecipient));
      if (contact) {
        setActiveConversation({
          partner: { id: contact.id, name: contact.name, avatar: contact.avatar },
          lastMessage: newMsgText,
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          messages: []
        });
      }
      fetchChats();
    } catch (err) {
      console.error("Failed to start new thread", err);
    } finally {
      setIsSendingNew(false);
    }
  };

  const getAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 relative">
      {/* Sidebar: Conversations List */}
      <div className={`lg:w-80 flex flex-col gap-4 ${activeConversation ? 'hidden lg:flex' : 'flex w-full'}`}>
        <div className="card-premium p-4 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-gray-800">Messages</h2>
            <button 
              onClick={() => setIsNewMessageModalOpen(true)}
              className="p-2 bg-blue-50 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all shadow-sm"
              title="New Conversation"
            >
              <UserPlus size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {isChatsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" size={24} /></div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeConversation?.partner?.id === conv.partner.id;
                return (
                  <button 
                    key={conv.partner.id} 
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative ${isActive ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white flex-shrink-0 ${isActive ? 'bg-white/20 shadow-none' : 'bg-gray-100 shadow-sm'}`}>
                      <img src={conv.partner.avatar || getAvatarUrl(conv.partner.name)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="text-left overflow-hidden flex-1">
                      <p className="text-sm font-bold truncate">{conv.partner.name}</p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-blue-100' : 'text-gray-400'} font-medium`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute top-3 right-3 min-w-[1.25rem] h-5 bg-brand-secondary text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-sm ring-2 ring-white px-1.5">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                <Inbox size={32} strokeWidth={1}/>
                <p className="text-xs font-bold uppercase tracking-widest">No conversations</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel: Message Thread */}
      <div className={`flex-1 flex flex-col gap-4 ${activeConversation ? 'flex' : 'hidden lg:flex'}`}>
        {activeConversation ? (
          <>
            <div className="card-premium flex-1 p-6 flex flex-col overflow-hidden relative border-gray-100 shadow-2xl shadow-brand-primary/5">
              {/* Thread Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveConversation(null)} className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-brand-primary">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                    <img src={activeConversation.partner.avatar || getAvatarUrl(activeConversation.partner.name)} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{activeConversation.partner.name}</h3>
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Node Synchronized
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secure Gateway</span>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 flex flex-col">
                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>
                ) : (
                  <>
                    <div className="mt-auto" />
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-2">
                        <MessageSquare size={48} strokeWidth={1} />
                        <p className="font-bold text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((m) => {
                        const isSent = String(m.sender_id) === String(user?.id);
                        return (
                          <div key={m.id} className={`self-${isSent ? 'end' : 'start'} max-w-[85%] md:max-w-[70%] animate-in slide-in-from-bottom-2`}>
                            <div className={`p-4 rounded-2xl shadow-sm ${isSent ? 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/10' : 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-200/50'}`}>
                              <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.message}</p>
                              <p className={`text-[8px] mt-2 font-black uppercase tracking-tighter ${isSent ? 'text-white/60' : 'text-gray-400'}`}>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Input Footer */}
            <div className="card-premium p-3 flex items-center gap-3 border-gray-100 shadow-xl shadow-brand-primary/5">
              <button className="p-2 text-gray-400 hover:text-brand-primary hover:bg-blue-50 rounded-xl transition-all"><Paperclip size={20} /></button>
              <textarea 
                rows={1}
                value={msg} 
                onChange={(e) => setMsg(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Securely transmit message..." 
                className="flex-1 text-sm font-semibold outline-none text-gray-800 bg-transparent py-2 resize-none max-h-32" 
              />
              <button 
                onClick={handleSend}
                disabled={!msg.trim()}
                className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:scale-100 transition-all active:scale-90"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="card-premium flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-60 border-gray-100 bg-gray-50/20">
             <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-gray-300 border border-gray-100 shadow-xl shadow-gray-200/50"><MessageSquare size={40} /></div>
             <h3 className="text-xl font-bold text-gray-800 tracking-tight">Academic Communications</h3>
             <p className="text-sm text-gray-500 max-w-xs font-medium">Select a conversation or start a new thread with a colleague from the institutional registry.</p>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <Modal isOpen={isNewMessageModalOpen} onClose={() => setIsNewMessageModalOpen(false)} title="New Message">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipient</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
              <select 
                value={newRecipient} 
                onChange={e => setNewRecipient(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-bold text-sm appearance-none"
              >
                <option value="">Select recipient...</option>
                {availableContacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Body</label>
            <textarea 
              rows={4}
              value={newMsgText}
              onChange={e => setNewMsgText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-brand-primary font-medium text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsNewMessageModalOpen(false)}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSendNew}
              disabled={isSendingNew || !newRecipient || !newMsgText.trim()}
              className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSendingNew ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Send Message"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Communication;
