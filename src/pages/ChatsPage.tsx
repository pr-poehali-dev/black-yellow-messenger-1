import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Member {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  isAdmin: boolean;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  encrypted: boolean;
  online: boolean;
  isGroup: boolean;
  members?: Member[];
  messages: { id: number; text: string; from: "me" | "them"; senderName?: string; time: string }[];
}

const ALL_CONTACTS: Member[] = [
  { id: 1, name: "Алексей Морозов", avatar: "АМ", phone: "+7 (916) 123-45-67", isAdmin: false },
  { id: 2, name: "Маша Петрова", avatar: "МП", phone: "+7 (925) 111-22-33", isAdmin: false },
  { id: 3, name: "Денис Васильев", avatar: "ДВ", phone: "+7 (903) 987-65-43", isAdmin: false },
  { id: 4, name: "Игорь Смирнов", avatar: "ИС", phone: "+7 (912) 555-44-33", isAdmin: false },
];

const INITIAL_CHATS: Chat[] = [
  {
    id: 1,
    name: "Алексей Морозов",
    avatar: "АМ",
    lastMessage: "Окей, увидимся в 19:00 👍",
    time: "14:32",
    unread: 0,
    encrypted: true,
    online: true,
    isGroup: false,
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
    isGroup: true,
    members: [
      { id: 0, name: "Вы", avatar: "ВЫ", phone: "", isAdmin: true },
      { id: 1, name: "Алексей Морозов", avatar: "АМ", phone: "+7 (916) 123-45-67", isAdmin: true },
      { id: 2, name: "Маша Петрова", avatar: "МП", phone: "+7 (925) 111-22-33", isAdmin: false },
    ],
    messages: [
      { id: 1, text: "Ребята, тесты прошли успешно", from: "them", senderName: "Алексей", time: "12:55" },
      { id: 2, text: "Супер, когда деплоим?", from: "me", time: "13:00" },
      { id: 3, text: "Новое обновление готово к релизу", from: "them", senderName: "Маша", time: "13:10" },
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
    isGroup: false,
    messages: [
      { id: 1, text: "Привет, есть минутка?", from: "them", time: "Вчера" },
      { id: 2, text: "Посмотри документ, который я скинула", from: "them", time: "Вчера" },
    ],
  },
];

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, members: Member[]) => void;
}

function CreateGroupModal({ onClose, onCreate }: CreateGroupModalProps) {
  const [step, setStep] = useState<"members" | "name">("members");
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<Member[]>([]);

  const toggle = (contact: Member) => {
    setSelected((prev) =>
      prev.find((m) => m.id === contact.id)
        ? prev.filter((m) => m.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selected.length === 0) return;
    const meAsAdmin: Member = { id: 0, name: "Вы", avatar: "ВЫ", phone: "", isAdmin: true };
    onCreate(groupName.trim(), [meAsAdmin, ...selected]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl animate-fade-in overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border-color)", maxHeight: "85vh" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <p className="font-display font-black text-base">Новая группа</p>
            <p className="text-xs font-body mt-0.5" style={{ color: "var(--text-muted)" }}>
              {step === "members" ? `Выбрано: ${selected.length}` : "Назовите группу"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10">
            <Icon name="X" size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {step === "members" && (
          <>
            <div className="overflow-y-auto scrollbar-none" style={{ maxHeight: "50vh" }}>
              {ALL_CONTACTS.map((contact, i) => {
                const isSelected = !!selected.find((m) => m.id === contact.id);
                return (
                  <button
                    key={contact.id}
                    onClick={() => toggle(contact)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 border-b transition-all hover:bg-white/5 text-left animate-fade-in"
                    style={{ borderColor: "var(--border-color)", animationDelay: `${i * 0.05}s`, opacity: 0 }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-black"
                      style={{
                        background: isSelected ? "var(--yellow)" : "var(--surface2)",
                        color: isSelected ? "var(--black)" : "var(--text-muted)",
                        transition: "all 0.2s",
                      }}
                    >
                      {isSelected ? <Icon name="Check" size={16} /> : contact.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-bold">{contact.name}</p>
                      <p className="text-xs font-body" style={{ color: "var(--text-muted)" }}>{contact.phone}</p>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--yellow)" }}>
                        <Icon name="Check" size={11} className="text-black" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-4">
              <button
                onClick={() => setStep("name")}
                disabled={selected.length === 0}
                className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wide transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "var(--yellow)", color: "var(--black)" }}
              >
                Далее
                <Icon name="ArrowRight" size={15} />
              </button>
            </div>
          </>
        )}

        {step === "name" && (
          <div className="px-5 py-4 space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {selected.map((m) => (
                <span key={m.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold text-black"
                  style={{ background: "var(--yellow)" }}>
                  {m.avatar}
                  <button onClick={() => toggle(m)}>
                    <Icon name="X" size={10} className="text-black/60" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Название группы..."
              className="w-full px-4 py-3.5 rounded-xl text-base font-body border transition-all"
              style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)" }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setStep("members")}
                className="flex-1 py-3 rounded-xl font-body text-sm border transition-all hover:bg-white/5"
                style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
              >
                ← Назад
              </button>
              <button
                onClick={handleCreate}
                disabled={!groupName.trim()}
                className="flex-1 py-3 rounded-xl font-display text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: "var(--yellow)", color: "var(--black)" }}
              >
                Создать группу
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface GroupInfoPanelProps {
  chat: Chat;
  onClose: () => void;
  onUpdateMembers: (members: Member[]) => void;
  myId: number;
}

function GroupInfoPanel({ chat, onClose, onUpdateMembers, myId }: GroupInfoPanelProps) {
  const [members, setMembers] = useState<Member[]>(chat.members || []);
  const [addMode, setAddMode] = useState(false);

  const iAmAdmin = members.find((m) => m.id === myId)?.isAdmin ?? false;

  const toggleAdmin = (memberId: number) => {
    if (!iAmAdmin || memberId === myId) return;
    const updated = members.map((m) =>
      m.id === memberId ? { ...m, isAdmin: !m.isAdmin } : m
    );
    setMembers(updated);
    onUpdateMembers(updated);
  };

  const removeMember = (memberId: number) => {
    if (!iAmAdmin || memberId === myId) return;
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    onUpdateMembers(updated);
  };

  const addContact = (contact: Member) => {
    if (members.find((m) => m.id === contact.id)) return;
    const updated = [...members, contact];
    setMembers(updated);
    onUpdateMembers(updated);
    setAddMode(false);
  };

  const available = ALL_CONTACTS.filter((c) => !members.find((m) => m.id === c.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-t-3xl animate-fade-in overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border-color)", maxHeight: "85vh" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <p className="font-display font-black text-base">{chat.name}</p>
            <p className="text-xs font-body mt-0.5" style={{ color: "var(--text-muted)" }}>
              {members.length} участников
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10">
            <Icon name="X" size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-none" style={{ maxHeight: "60vh" }}>
          {members.map((member, i) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-5 py-3.5 border-b animate-fade-in"
              style={{ borderColor: "var(--border-color)", animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-black text-black flex-shrink-0"
                style={{ background: "var(--yellow)" }}
              >
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold truncate">
                    {member.id === myId ? "Вы" : member.name}
                  </span>
                  {member.isAdmin && (
                    <span className="px-1.5 py-0.5 rounded text-black font-display font-black"
                      style={{ background: "var(--yellow)", fontSize: "9px", letterSpacing: "0.05em" }}>
                      ADMIN
                    </span>
                  )}
                </div>
                {member.phone && (
                  <p className="text-xs font-body" style={{ color: "var(--text-muted)" }}>{member.phone}</p>
                )}
              </div>

              {iAmAdmin && member.id !== myId && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleAdmin(member.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                    title={member.isAdmin ? "Снять права" : "Сделать админом"}
                  >
                    <Icon
                      name={member.isAdmin ? "ShieldMinus" : "ShieldPlus"}
                      size={15}
                      style={{ color: member.isAdmin ? "#ff6b6b" : "var(--yellow)" }}
                    />
                  </button>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                    title="Удалить из группы"
                  >
                    <Icon name="UserMinus" size={15} style={{ color: "#ff6b6b" }} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {addMode && available.length > 0 && (
            <div className="border-t" style={{ borderColor: "var(--border-color)" }}>
              <p className="px-5 py-2 text-xs font-body uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Добавить участника
              </p>
              {available.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => addContact(contact)}
                  className="w-full flex items-center gap-3 px-5 py-3 border-b transition-all hover:bg-white/5 text-left"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-display font-black text-black"
                    style={{ background: "var(--yellow)" }}>
                    {contact.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold">{contact.name}</p>
                  </div>
                  <Icon name="Plus" size={16} style={{ color: "var(--yellow)" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {iAmAdmin && (
          <div className="px-5 py-4 border-t" style={{ borderColor: "var(--border-color)" }}>
            <button
              onClick={() => setAddMode(!addMode)}
              className="w-full py-3 rounded-xl text-sm font-body border flex items-center justify-center gap-2 transition-all hover:border-yellow"
              style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}
            >
              <Icon name={addMode ? "ChevronUp" : "UserPlus"} size={15} />
              {addMode ? "Скрыть" : "Добавить участника"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatsPageProps {
  userName: string;
}

export default function ChatsPage({ userName }: ChatsPageProps) {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const MY_ID = 0;

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
    setActiveChat((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
    setInput("");
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

  const handleUpdateMembers = (members: Member[]) => {
    if (!activeChat) return;
    const updated = { ...activeChat, members };
    setActiveChat(updated);
    setChats((prev) => prev.map((c) => c.id === activeChat.id ? updated : c));
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
            <p className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
              {activeChat.isGroup
                ? `${activeChat.members?.length ?? 0} участников`
                : activeChat.online ? "в сети" : "не в сети"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="encryption-badge flex items-center gap-1">
              <Icon name="Lock" size={9} />
              E2E
            </div>
            {activeChat.isGroup && (
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
          {activeChat.messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} animate-fade-in`}
              style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
            >
              <div className={`max-w-[75%] px-4 py-2.5 ${msg.from === "me" ? "chat-bubble-out" : "chat-bubble-in"}`}>
                {activeChat.isGroup && msg.from === "them" && msg.senderName && (
                  <p className="text-xs font-display font-bold mb-1" style={{ color: "var(--yellow)" }}>
                    {msg.senderName}
                  </p>
                )}
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

        {showGroupInfo && activeChat.isGroup && (
          <GroupInfoPanel
            chat={activeChat}
            onClose={() => setShowGroupInfo(false)}
            onUpdateMembers={handleUpdateMembers}
            myId={MY_ID}
          />
        )}
      </div>
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
            onClick={() => {
              setActiveChat({ ...chat, unread: 0 });
              setChats(chats.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c));
            }}
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
                    <span className="px-1.5 py-0.5 rounded text-black font-display font-black flex-shrink-0"
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
