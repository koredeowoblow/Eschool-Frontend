
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Search, Paperclip, Loader2, MessageSquare, Inbox, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

const Communication: React.FC = () => {
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    setIsChatsLoading(true);
    try {
      const res = await api.get('/chats');
      setChats(res.data.data || res.data || []);
    } catch (err) {
      console.warn("Failed to load active chats", err);
    } finally {
      setIsChatsLoading(false);
    }
  };

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
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/chats/${activeChat.id}`);
        const history = res.data.data?.messages || res.data.messages || [];
        setMessages(history);
        await api.patch('/chats/mark-as-read', { chat_id: activeChat.id }).catch(() => {});
      } catch (err) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();

    // Setup Realtime Listener with cleanup
    if ((window as any).Echo && user) {
      const channel = (window as any).Echo.private(`chat.${user.id}`)
        .listen('.MessageSent', (e: any) => {
          // If message belongs to active chat, add it
          if (activeChat && (e.chat_id === activeChat.id || e.sender_id === activeChat.participant?.id)) {
            setMessages(prev => {
              // Deduplicate
              if (prev.find(m => m.id === e.id)) return prev;
              return [...prev, e];
            });
          }
          fetchChats(); // Refresh sidebar for last message snippet
        });

      return () => {
        (window as any).Echo.leave(`chat.${user.id}`);
      };
    }
  }, [activeChat?.id, user?.id]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!msg.trim() || !activeChat) return;
    
    const messageContent = msg;
    setMsg('');

    try {
      const res = await api.post('/chats', {
        receiver_id: activeChat.participant?.id || activeChat.receiver_id,
        message: messageContent
      });
      const newMessage = res.data.data || res.data;
      setMessages(prev => [...prev, newMessage]);
      fetchChats();
    } catch (err) {
      console.error("Failed to send", err);
    }
  };

  const startNewChat = async (contactId: string) => {
    try {
      const res = await api.post('/chats', { receiver_id: contactId, message: '👋 Hello!' });
      const newChat = res.data.data || res.data;
      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);
      setShowNewChat(false);
    } catch (err) {
      console.error("Start chat error", err);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      <div className="lg:w-80 flex flex-col gap-4">
        <div className="card-premium p-4 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-gray-800">Direct Messages</h2>
            <button onClick={() => setShowNewChat(true)} className="p-2 bg-blue-50 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all">
              <UserPlus size={18} />
            </button>
          </div>

          {showNewChat && (
            <div className="mb-4 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Available Contacts</p>
               <div className="space-y-1">
                 {availableContacts.map(c => (
                   <button key={c.id} onClick={() => startNewChat(c.id)} className="w-full flex items-center gap-2 p-2 hover:bg-white rounded-xl text-left transition-all">
                     <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-400 border border-blue-100">{c.name?.[0] || 'U'}</div>
                     <span className="text-xs font-bold text-gray-700">{c.name}</span>
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div className="space-y-1">
            {isChatsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" size={24} /></div>
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                <button 
                  key={chat.id} 
                  onClick={() => setActiveChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeChat?.id === chat.id ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white ${activeChat?.id === chat.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <User size={20} className={activeChat?.id === chat.id ? 'text-white/60' : 'text-gray-400'} />
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate">{chat.participant?.name || 'Academic Chat'}</p>
                    <p className={`text-[10px] truncate ${activeChat?.id === chat.id ? 'text-blue-100' : 'text-gray-400'} font-medium`}>{chat.last_message?.message || 'Started a conversation'}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                <Inbox size={32} strokeWidth={1}/>
                <p className="text-xs font-bold uppercase tracking-widest">No active chats</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {activeChat ? (
          <>
            <div className="card-premium flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
              <div className="flex flex-col items-center gap-2 mb-10 text-center sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10 border-b border-gray-50">
                <h3 className="font-bold text-gray-800">{activeChat.participant?.name}</h3>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Secure P2P Channel</span>
              </div>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>
              ) : (
                <div className="flex flex-col gap-4 mt-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`self-${m.sender_id === user?.id ? 'end' : 'start'} max-w-[80%] ${m.sender_id === user?.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700'} p-4 rounded-2xl shadow-sm animate-in slide-in-from-bottom-2`}>
                      <p className="text-sm font-medium">{m.message}</p>
                      <p className="text-[8px] mt-1 text-right opacity-60 font-black">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="card-premium p-4 flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Paperclip size={20} /></button>
              <input 
                type="text" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Securely transmit message..." 
                className="flex-1 text-sm font-semibold outline-none text-gray-800" 
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="card-premium flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-60">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300"><MessageSquare size={40} /></div>
             <h3 className="text-xl font-bold text-gray-800 tracking-tight">Enterprise Messaging</h3>
             <p className="text-sm text-gray-500 max-w-xs font-medium">Select a contact to start an end-to-end encrypted conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
