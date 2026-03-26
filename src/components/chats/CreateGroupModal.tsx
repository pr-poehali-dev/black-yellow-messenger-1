import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Member, ALL_CONTACTS } from "@/types/chat";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (name: string, members: Member[]) => void;
}

export default function CreateGroupModal({ onClose, onCreate }: CreateGroupModalProps) {
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
