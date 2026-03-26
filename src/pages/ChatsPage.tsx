import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Chat, Member, INITIAL_CHATS } from "@/types/chat";
import ChatView from "@/components/chats/ChatView";
import CreateGroupModal from "@/components/chats/CreateGroupModal";

const MY_ID = 0;

function chatsKey(phone: string) { return `2keys_chats_${phone}`; }

function loadChats(phone: string): Chat[] {
  try {
    const raw = localStorage.getItem(chatsKey(phone));
    return raw ? JSON.parse(raw) : INITIAL_CHATS;
  } catch { return INITIAL_CHATS; }
}

function saveChats(phone: string, chats: Chat[]) {
  try {
    localStorage.setItem(chatsKey(phone), JSON.stringify(chats));
  } catch { /* ignore quota errors */ }
}

interface ChatsPageProps {
  userPhone: string;
}

export default function ChatsPage({ userPhone }: ChatsPageProps) {
  const [chats, setChatsRaw] = useState<Chat[]>(() => loadChats(userPhone));
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const setChats = (updater: Chat[] | ((prev: Chat[]) => Chat[])) => {
    setChatsRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveChats(userPhone, next);
      return next;
    });
  };

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendMessage = (text: string) => {
    if (!activeChat) return;
    const msg = { id: Date.now(), text, from: "me" as const, time: "Сейчас" };
    const updatedChats = chats.map((c) =>
      c.id === activeChat.id
        ? { ...c, messages: [...c.messages, msg], lastMessage: text, time: "Сейчас", unread: 0 }
        : c
    );
    setChats(updatedChats);
    setActiveChat((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
  };

  const handleUpdateMembers = (members: Member[]) => {
    if (!activeChat) return;
    const updated = { ...activeChat, members };
    setActiveChat(updated);
    setChats((prev) => prev.map((c) => c.id === activeChat.id ? updated : c));
  };

  const handleCreateGroup = (name: string, members: Member[]) => {
    const newChat: Chat = {
      id: Date.now(),
      name,
      avatar: name.slice(0, 2).toUpperCase(),
      lastMessage: "Группа создана",
      time: "Сейчас",
      unread: 0,
      encrypted: true,
      online: false,
      isGroup: true,
      members,
      messages: [{ id: 1, text: `Группа «${name}» создана`, from: "them", senderName: "Система", time: "Сейчас" }],
    };
    setChats((prev) => [newChat, ...prev]);
    setShowCreateGroup(false);
    setActiveChat(newChat);
  };

  const handleOpenChat = (chat: Chat) => {
    setActiveChat({ ...chat, unread: 0 });
    setChats(chats.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c));
  };

  if (activeChat) {
    return (
      <ChatView
        chat={activeChat}
        onBack={() => setActiveChat(null)}
        onSendMessage={handleSendMessage}
        onUpdateMembers={handleUpdateMembers}
        myId={MY_ID}
      />
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-5 pb-3" style={{ background: "var(--surface)" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-black">Чаты</h1>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-bold text-black transition-all hover:opacity-80"
            style={{ background: "var(--yellow)" }}
          >
            <Icon name="Users" size={13} />
            Группа
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-body border"
            style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {filtered.map((chat, i) => (
          <button
            key={chat.id}
            onClick={() => handleOpenChat(chat)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b transition-all hover:bg-white/5 animate-fade-in text-left"
            style={{ borderColor: "var(--border-color)", animationDelay: `${i * 0.06}s`, opacity: 0 }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 flex items-center justify-center text-sm font-display font-black text-black"
                style={{
                  background: "var(--yellow)",
                  borderRadius: chat.isGroup ? "14px" : "50%",
                }}
              >
                {chat.isGroup ? <Icon name="Users" size={20} className="text-black" /> : chat.avatar}
              </div>
              {!chat.isGroup && chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2"
                  style={{ borderColor: "var(--surface)" }}></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-display text-sm font-bold truncate">{chat.name}</span>
                  {chat.isGroup && (
                    <span className="px-1.5 py-0.5 rounded font-display font-black flex-shrink-0"
                      style={{ background: "rgba(255,215,0,0.2)", color: "var(--yellow)", fontSize: "8px" }}>
                      ГРУППА
                    </span>
                  )}
                </div>
                <span className="text-xs font-body flex-shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-body truncate" style={{ color: "var(--text-muted)" }}>{chat.lastMessage}</span>
                {chat.unread > 0 && (
                  <span className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-display font-black text-black flex-shrink-0"
                    style={{ background: "var(--yellow)" }}>
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}
