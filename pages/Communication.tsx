
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Search, Paperclip, Loader2, MessageSquare, Inbox } from 'lucide-react';
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
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isContactsLoading, setIsContactsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setIsContactsLoading(true);
      try {
        const res = await api.get('/chats/contacts');
        setContacts(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load contacts", err);
      } finally {
        setIsContactsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!activeContact) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/chats/messages/${activeContact.id}`);
        setMessages(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();

    if ((window as any).Echo && user) {
      // Channel: private-chat.{userId} as per specification
      const channel = (window as any).Echo.private(`chat.${user.id}`)
        .listen('.MessageSent', (e: any) => {
          if (activeContact && e.sender_id === activeContact.id) {
            setMessages(prev => [...prev, e]);
          }
        });

      return () => {
        (window as any).Echo.leave(`chat.${user.id}`);
      };
    }
  }, [activeContact, user]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!msg.trim() || !activeContact) return;
    
    const messageContent = msg;
    setMsg('');

    try {
      const res = await api.post('/chats/send', {
        receiver_id: activeContact.id,
        message: messageContent
      });
      // Backend returns the created message object in res.data.data
      const newMessage = res.data.data || res.data;
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      <div className="lg:w-80 flex flex-col gap-4">
        <div className="card-premium p-4 flex-1 overflow-y-auto custom-scrollbar">
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Conversations</h2>
          <div className="relative mb-4 px-2">
            <Search size={16} className="absolute left-5 top-2.5 text-gray-400" />
            <input type="text" placeholder="Search contacts..." className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 ring-brand-primary/20 transition-all" />
          </div>
          <div className="space-y-1">
            {isContactsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-primary" size={24} /></div>
            ) : contacts.length > 0 ? (
              contacts.map((contact) => (
                <button 
                  key={contact.id} 
                  onClick={() => setActiveContact(contact)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeContact?.id === contact.id ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 ${activeContact?.id === contact.id ? 'border-white/40' : 'border-white bg-gray-100'}`}>
                     {contact.avatar ? <img src={contact.avatar} className="w-full h-full object-cover"/> : <User size={20} className={activeContact?.id === contact.id ? 'text-white/60' : 'text-gray-400'} />}
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-sm font-bold truncate">{contact.name}</p>
                      {contact.is_online && <span className="text-[10px] font-black uppercase text-green-400 animate-pulse">Live</span>}
                    </div>
                    <p className={`text-xs truncate ${activeContact?.id === contact.id ? 'text-blue-100' : 'text-gray-500'}`}>{contact.last_message || 'Start chatting'}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                <Inbox size={32} strokeWidth={1}/>
                <p className="text-xs font-bold uppercase tracking-widest">No contacts found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {activeContact ? (
          <>
            <div className="card-premium flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar relative">
              <div className="flex flex-col items-center gap-2 mb-10 text-center sticky top-0 bg-white/80 backdrop-blur-sm py-4 z-10 border-b border-gray-50">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-brand-primary flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                   {activeContact.avatar ? <img src={activeContact.avatar} className="w-full h-full object-cover"/> : <User size={28} />}
                </div>
                <h3 className="font-bold text-gray-800">{activeContact.name}</h3>
                <span className="text-xs font-semibold text-green-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Secure Connection</span>
              </div>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" size={32}/></div>
              ) : (
                <div className="flex flex-col gap-4 mt-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={`self-${m.sender_id === user?.id ? 'end' : 'start'} max-w-[80%] ${m.sender_id === user?.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700'} p-4 rounded-2xl ${m.sender_id === user?.id ? 'rounded-br-none' : 'rounded-bl-none'} text-sm font-medium shadow-sm transition-all animate-in slide-in-from-bottom-2`}>
                      {m.message}
                      <div className={`text-[8px] mt-1 text-right opacity-60 font-black`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="card-premium p-4 flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Paperclip size={20} /></button>
              <input 
                type="text" 
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..." 
                className="flex-1 text-sm font-semibold outline-none text-gray-800" 
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="card-premium flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-60">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
               <MessageSquare size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-800 tracking-tight">Enterprise Messaging</h3>
             <p className="text-sm text-gray-500 max-w-xs font-medium">Select a contact to start a secure, real-time academic conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
