import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  currentUserId: string;
}

const QUICK_EMOJIS = ['👍', '⚔️', '👏', '😮', '😅', '👑', '🤝', '🔥'];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUserId
}) => {
  const [inputText, setInputText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickEmoji = (emoji: string) => {
    onSendMessage(emoji);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl p-3 text-slate-800 shadow-xs">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <MessageSquare className="w-4 h-4 text-[#fe4c6f]" />
        <span className="font-extrabold text-[11px] uppercase tracking-wider text-slate-600">
          Obrolan Room (Live)
        </span>
      </div>

      {/* Messages List */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto py-2 space-y-2 max-h-[140px] text-xs">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-4 italic">
            Kirim pesan pertama atau gunakan emoji reaksi.
          </div>
        ) : (
          messages.map((m) => {
            if (m.isSystem) {
              return (
                <div
                  key={m.id}
                  className="bg-slate-100 text-slate-600 p-2 rounded-lg text-[10px] text-center border border-slate-200 italic font-medium"
                >
                  {m.message}
                </div>
              );
            }

            const isMe = m.senderId === currentUserId;

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-500 font-bold mb-0.5 px-1">
                  {m.senderName}
                </span>
                <div
                  className={`px-3 py-1.5 rounded-xl max-w-[85%] break-words text-xs ${
                    isMe
                      ? 'bg-[#fe4c6f] text-white rounded-br-none shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  {m.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Reaction Emojis */}
      <div className="py-1.5 border-t border-slate-100 flex items-center justify-between gap-1 overflow-x-auto">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleQuickEmoji(emoji)}
            className="p-1 rounded-lg hover:bg-slate-100 text-base transition-transform active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-1">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#fe4c6f]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-[#fe4c6f] text-white disabled:opacity-50 hover:bg-[#e03a5b] transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
