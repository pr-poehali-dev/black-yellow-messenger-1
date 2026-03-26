import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Member, Chat, ALL_CONTACTS } from "@/types/chat";

interface GroupInfoPanelProps {
  chat: Chat;
  onClose: () => void;
  onUpdateMembers: (members: Member[]) => void;
  myId: number;
}

export default function GroupInfoPanel({ chat, onClose, onUpdateMembers, myId }: GroupInfoPanelProps) {
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
