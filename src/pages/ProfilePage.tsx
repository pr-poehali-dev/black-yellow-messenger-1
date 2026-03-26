import { useState } from "react";
import Icon from "@/components/ui/icon";

interface ProfilePageProps {
  name: string;
  phone: string;
  onLogout: () => void;
}

const SETTINGS = [
  { id: "notifications", label: "Push-уведомления", icon: "Bell", enabled: true },
  { id: "sound", label: "Звук сообщений", icon: "Volume2", enabled: true },
  { id: "e2e", label: "Сквозное шифрование", icon: "Lock", enabled: true, locked: true },
  { id: "hide_phone", label: "Скрыть номер телефона", icon: "EyeOff", enabled: false },
  { id: "two_fa", label: "Двухфакторная аутентификация", icon: "ShieldCheck", enabled: true },
];

export default function ProfilePage({ name, phone, onLogout }: ProfilePageProps) {
  const [settings, setSettings] = useState(SETTINGS);
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(name);

  const toggle = (id: string) => {
    setSettings(settings.map((s) =>
      s.id === id && !s.locked ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const formatPhone = (p: string) => {
    const d = p.replace(/\D/g, "");
    if (d.length < 11) return p;
    return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
  };

  const initials = nameVal
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-y-auto scrollbar-none">
      <div className="px-4 pt-5 pb-4" style={{ background: "var(--surface)" }}>
        <h1 className="font-display text-xl font-black mb-4">Профиль</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-display font-black text-black animate-pulse-yellow"
              style={{ background: "var(--yellow)" }}>
              {initials || "?"}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface2)", border: "1.5px solid var(--border-color)" }}>
              <Icon name="Camera" size={11} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            {editName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onBlur={() => setEditName(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditName(false)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm font-display font-bold border"
                  style={{ background: "var(--surface2)", borderColor: "var(--yellow)", color: "var(--text)" }}
                  autoFocus
                />
              </div>
            ) : (
              <button onClick={() => setEditName(true)} className="flex items-center gap-2 group">
                <span className="font-display font-black text-base">{nameVal}</span>
                <Icon name="Pencil" size={12} style={{ color: "var(--text-muted)" }} className="group-hover:text-yellow transition-colors" />
              </button>
            )}
            <p className="text-sm font-body mt-0.5" style={{ color: "var(--text-muted)" }}>{formatPhone(phone)}</p>
            <div className="encryption-badge inline-flex items-center gap-1 mt-1.5">
              <Icon name="ShieldCheck" size={9} />
              Защищён
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="p-4 rounded-2xl" style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.15)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name="KeyRound" size={14} style={{ color: "var(--yellow)" }} />
            <span className="font-display text-sm font-bold text-yellow">E2E шифрование активно</span>
          </div>
          <p className="text-xs font-body leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Все сообщения шифруются на вашем устройстве. Никто, даже 2Keys, не может их прочитать.
          </p>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs font-body uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Настройки</p>
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
          {settings.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-4 py-3.5 transition-all ${i < settings.length - 1 ? "border-b" : ""}`}
              style={{ borderColor: "var(--border-color)", background: "var(--surface2)" }}
            >
              <Icon name={s.icon} size={16} style={{ color: s.locked ? "var(--yellow)" : "var(--text-muted)" }} />
              <span className="flex-1 text-sm font-body">{s.label}</span>
              {s.locked ? (
                <Icon name="Lock" size={12} style={{ color: "var(--yellow)" }} />
              ) : (
                <button
                  onClick={() => toggle(s.id)}
                  className="w-10 h-6 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: s.enabled ? "var(--yellow)" : "var(--border-color)" }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full transition-all"
                    style={{
                      background: s.enabled ? "var(--black)" : "var(--text-muted)",
                      left: s.enabled ? "calc(100% - 20px)" : "4px",
                    }}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs font-body uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Аккаунт</p>
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
          {[
            { icon: "HelpCircle", label: "Поддержка", color: "var(--text-muted)" },
            { icon: "Info", label: "О приложении", color: "var(--text-muted)" },
          ].map((item, i) => (
            <button key={i}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/5 text-left ${i === 0 ? "border-b" : ""}`}
              style={{ borderColor: "var(--border-color)", background: "var(--surface2)" }}
            >
              <Icon name={item.icon} size={16} style={{ color: item.color }} />
              <span className="flex-1 text-sm font-body">{item.label}</span>
              <Icon name="ChevronRight" size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 pb-6">
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-xl text-sm font-display font-bold flex items-center justify-center gap-2 transition-all border"
          style={{ borderColor: "rgba(255,100,100,0.3)", color: "#ff6b6b", background: "rgba(255,100,100,0.06)" }}
        >
          <Icon name="LogOut" size={14} />
          Выйти из аккаунта
        </button>
        <p className="text-center text-xs font-body mt-3" style={{ color: "var(--text-muted)" }}>
          2Keys v1.0.0 · End-to-End Encrypted
        </p>
      </div>
    </div>
  );
}