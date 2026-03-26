import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Chat, Member } from "@/types/chat";
import GroupInfoPanel from "./GroupInfoPanel";

interface ChatViewProps {
  chat: Chat;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onUpdateMembers: (members: Member[]) => void;
  myId: number;
}

export default function ChatView({ chat, onBack, onSendMessage, onUpdateMembers, myId }: ChatViewProps) {
  const [input, setInput] = useState("");
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-color)", background: "var(--surface)" }}>
        <button onClick={onBack} className="p-1.5 rounded-lg transition-all hover:bg-white/5">
          <Icon name="ArrowLeft" size={20} style={{ color: "var(--text-muted)" }} />
        </button>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-black text-black" style={{ background: "var(--yellow)" }}>
          {chat.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm font-bold truncate">{chat.name}</p>
          <p className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
            {chat.isGroup
              ? `${chat.members?.length ?? 0} участников`
              : chat.online ? "в сети" : "не в сети"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="encryption-badge flex items-center gap-1">
            <Icon name="Lock" size={9} />
            E2E
          </div>
          {chat.isGroup && (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
            >
              <Icon name="Users" size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
        {chat.messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
          >
            <div className={`max-w-[75%] px-4 py-2.5 ${msg.from === "me" ? "chat-bubble-out" : "chat-bubble-in"}`}>
              {chat.isGroup && msg.from === "them" && msg.senderName && (
                <p className="text-xs font-display font-bold mb-1" style={{ color: "var(--yellow)" }}>
                  {msg.senderName}
                </p>
              )}
              <p className="text-sm font-body leading-relaxed">{msg.text}</p>
              <p
                className={`text-xs mt-1 font-body ${msg.from === "me" ? "text-black/50" : ""}`}
                style={msg.from !== "me" ? { color: "var(--text-muted)" } : {}}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border-color)", background: "var(--surface)" }}>
        <div className="flex gap-2 items-end">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Сообщение..."
            className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-body border transition-all"
            style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: "var(--yellow)" }}
          >
            <Icon name="Send" size={16} className="text-black" />
          </button>
        </div>
      </div>

      {showGroupInfo && chat.isGroup && (
        <GroupInfoPanel
          chat={chat}
          onClose={() => setShowGroupInfo(false)}
          onUpdateMembers={onUpdateMembers}
          myId={myId}
        />
      )}
    </div>
  );
}
