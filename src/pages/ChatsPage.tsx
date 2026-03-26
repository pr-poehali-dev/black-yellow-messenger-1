import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  encrypted: boolean;
  online: boolean;
  messages: { id: number; text: string; from: "me" | "them"; time: string }[];
}

const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    name: "Алексей Морозов",
    avatar: "АМ",
    lastMessage: "Окей, увидимся в 19:00 👍",
    time: "14:32",
    unread: 0,
    encrypted: true,
    online: true,
    messages: [
      { id: 1, text: "Привет! Как дела?", from: "them", time: "14:20" },
      { id: 2, text: "Хорошо! Встретимся сегодня?", from: "me", time: "14:25" },
      { id: 3, text: "Окей, увидимся в 19:00 👍", from: "them", time: "14:32" },
    ],
  },
  {
    id: 2,
    name: "Команда 2Keys",
    avatar: "2K",
    lastMessage: "Новое обновление готово к релизу",
    time: "13:10",
    unread: 3,
    encrypted: true,
    online: false,
    messages: [
      { id: 1, text: "Ребята, тесты прошли успешно", from: "them", time: "12:55" },
      { id: 2, text: "Супер, когда деплоим?", from: "me", time: "13:00" },
      { id: 3, text: "Новое обновление готово к релизу", from: "them", time: "13:10" },
    ],
  },
  {
    id: 3,
    name: "Маша Петрова",
    avatar: "МП",
    lastMessage: "Посмотри документ, который я скинула",
    time: "Вчера",
    unread: 1,
    encrypted: true,
    online: false,
    messages: [
      { id: 1, text: "Привет, есть минутка?", from: "them", time: "Вчера" },
      { id: 2, text: "Посмотри документ, который я скинула", from: "them", time: "Вчера" },
    ],
  },
  {
    id: 4,
    name: "Денис Васильев",
    avatar: "ДВ",
    lastMessage: "Спасибо за помощь!",
    time: "Пн",
    unread: 0,
    encrypted: true,
    online: true,
    messages: [
      { id: 1, text: "Можешь помочь с задачей?", from: "them", time: "Пн" },
      { id: 2, text: "Конечно, что нужно?", from: "me", time: "Пн" },
      { id: 3, text: "Спасибо за помощь!", from: "them", time: "Пн" },
    ],
  },
];

interface ChatsPageProps {
  userName: string;
}

export default function ChatsPage({ userName }: ChatsPageProps) {
  const [chats, setChats] = useState(MOCK_CHATS);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const filtered = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const msg = { id: Date.now(), text: input.trim(), from: "me" as const, time: "Сейчас" };
    const updatedChats = chats.map((c) =>
      c.id === activeChat.id
        ? { ...c, messages: [...c.messages, msg], lastMessage: input.trim(), time: "Сейчас", unread: 0 }
        : c
    );
    setChats(updatedChats);
    setActiveChat({ ...activeChat, messages: [...activeChat.messages, msg] });
    setInput("");
  };

  if (activeChat) {
    return (
      <div className="flex flex-col h-full animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-color)", background: "var(--surface)" }}>
          <button onClick={() => setActiveChat(null)} className="p-1.5 rounded-lg transition-all hover:bg-white/5">
            <Icon name="ArrowLeft" size={20} style={{ color: "var(--text-muted)" }} />
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-black text-black" style={{ background: "var(--yellow)" }}>
            {activeChat.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm font-bold truncate">{activeChat.name}</p>
            <div className="flex items-center gap-1.5">
              {activeChat.online && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              )}
              <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
                {activeChat.online ? "в сети" : "не в сети"}
              </span>
            </div>
          </div>
          <div className="encryption-badge flex items-center gap-1">
            <Icon name="Lock" size={9} />
            E2E
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
          {activeChat.messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <div className={`max-w-[75%] px-4 py-2.5 ${msg.from === "me" ? "chat-bubble-out" : "chat-bubble-in"}`}>
                <p className="text-sm font-body leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 font-body ${msg.from === "me" ? "text-black/50" : ""}`}
                  style={msg.from !== "me" ? { color: "var(--text-muted)" } : {}}>
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Сообщение..."
              className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-body border transition-all"
              style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)" }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "var(--yellow)" }}
            >
              <Icon name="Send" size={16} className="text-black" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-5 pb-3" style={{ background: "var(--surface)" }}>
        <h1 className="font-display text-xl font-black mb-4">Чаты</h1>
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
            onClick={() => {
              setActiveChat({ ...chat, unread: 0 });
              setChats(chats.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c));
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b transition-all hover:bg-white/5 animate-fade-in text-left"
            style={{ borderColor: "var(--border-color)", animationDelay: `${i * 0.06}s`, opacity: 0 }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-display font-black text-black"
                style={{ background: "var(--yellow)" }}>
                {chat.avatar}
              </div>
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2"
                  style={{ borderColor: "var(--surface)" }}></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-display text-sm font-bold truncate">{chat.name}</span>
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

      <div className="px-4 pb-3 pt-2">
        <button className="w-full py-3 rounded-xl border border-dashed text-sm font-body flex items-center justify-center gap-2 transition-all hover:border-yellow hover:text-yellow"
          style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          <Icon name="Plus" size={16} />
          Новый чат
        </button>
      </div>
    </div>
  );
}
