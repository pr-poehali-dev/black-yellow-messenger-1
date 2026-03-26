import { useState } from "react";
import Icon from "@/components/ui/icon";

const CONTACTS = [
  { id: 1, name: "Алексей Морозов", phone: "+7 (916) 123-45-67", avatar: "АМ", online: true, encrypted: true },
  { id: 2, name: "Денис Васильев", phone: "+7 (903) 987-65-43", avatar: "ДВ", online: true, encrypted: true },
  { id: 3, name: "Маша Петрова", phone: "+7 (925) 111-22-33", avatar: "МП", online: false, encrypted: true },
  { id: 4, name: "Команда 2Keys", phone: "+7 (800) 000-20-00", avatar: "2K", online: false, encrypted: true },
  { id: 5, name: "Игорь Смирнов", phone: "+7 (912) 555-44-33", avatar: "ИС", online: false, encrypted: false },
];

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof CONTACTS[0] | null>(null);

  const filtered = CONTACTS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-5 pb-3" style={{ background: "var(--surface)" }}>
        <h1 className="font-display text-xl font-black mb-4">Контакты</h1>
        <div className="relative">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск контакта..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-body border"
            style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)" }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="px-4 py-2">
          <span className="text-xs font-body uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            {filtered.length} контактов
          </span>
        </div>
        {filtered.map((contact, i) => (
          <button
            key={contact.id}
            onClick={() => setSelected(selected?.id === contact.id ? null : contact)}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-b transition-all hover:bg-white/5 animate-fade-in text-left"
            style={{ borderColor: "var(--border-color)", animationDelay: `${i * 0.06}s`, opacity: 0 }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-display font-black text-black"
                style={{ background: selected?.id === contact.id ? "var(--yellow)" : "var(--yellow)" }}>
                {contact.avatar}
              </div>
              {contact.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2"
                  style={{ borderColor: "var(--surface)" }}></span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold truncate">{contact.name}</span>
                {contact.encrypted && (
                  <Icon name="Shield" size={12} style={{ color: "var(--yellow)", flexShrink: 0 }} />
                )}
              </div>
              <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>{contact.phone}</span>
            </div>
            <Icon name="ChevronRight" size={16} style={{ color: "var(--text-muted)" }} />
          </button>
        ))}

        {selected && (
          <div className="mx-4 my-3 p-4 rounded-2xl border animate-fade-in" style={{ borderColor: "var(--border-color)", background: "var(--surface2)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-display font-black text-black"
                style={{ background: "var(--yellow)" }}>
                {selected.avatar}
              </div>
              <div>
                <p className="font-display font-bold">{selected.name}</p>
                <p className="text-sm font-body" style={{ color: "var(--text-muted)" }}>{selected.phone}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl text-sm font-display font-bold text-black flex items-center justify-center gap-2"
                style={{ background: "var(--yellow)" }}>
                <Icon name="MessageSquare" size={14} />
                Написать
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-sm font-body border flex items-center justify-center gap-2 transition-all hover:border-yellow"
                style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                <Icon name="Phone" size={14} />
                Звонок
              </button>
            </div>
            {selected.encrypted && (
              <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg"
                style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)" }}>
                <Icon name="ShieldCheck" size={14} style={{ color: "var(--yellow)" }} />
                <span className="text-xs font-body" style={{ color: "var(--yellow)" }}>
                  Переписка защищена сквозным шифрованием
                </span>
              </div>
            )}
          </div>
        )}

        <div className="px-4 py-4">
          <button className="w-full py-3 rounded-xl border border-dashed text-sm font-body flex items-center justify-center gap-2 transition-all hover:border-yellow hover:text-yellow"
            style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
            <Icon name="UserPlus" size={16} />
            Добавить контакт
          </button>
        </div>
      </div>
    </div>
  );
}
