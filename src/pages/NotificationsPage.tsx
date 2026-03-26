import { useState } from "react";
import Icon from "@/components/ui/icon";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "message",
    title: "Алексей Морозов",
    text: "Отправил вам сообщение",
    time: "2 мин назад",
    read: false,
    icon: "MessageSquare",
  },
  {
    id: 2,
    type: "security",
    title: "Новый вход",
    text: "Выполнен вход с устройства iPhone 15 Pro",
    time: "1 час назад",
    read: false,
    icon: "ShieldAlert",
  },
  {
    id: 3,
    type: "contact",
    title: "Маша Петрова",
    text: "Теперь в 2Keys. Начните общаться!",
    time: "3 часа назад",
    read: true,
    icon: "UserCheck",
  },
  {
    id: 4,
    type: "message",
    title: "Команда 2Keys",
    text: "Упомянул вас в чате",
    time: "Вчера",
    read: true,
    icon: "MessageSquare",
  },
  {
    id: 5,
    type: "security",
    title: "Ключи обновлены",
    text: "E2E ключи шифрования успешно обновлены",
    time: "Вчера",
    read: true,
    icon: "KeyRound",
  },
  {
    id: 6,
    type: "system",
    title: "Добро пожаловать в 2Keys!",
    text: "Ваш аккаунт защищён сквозным шифрованием",
    time: "2 дня назад",
    read: true,
    icon: "Sparkles",
  },
];

type IconName = "MessageSquare" | "ShieldAlert" | "UserCheck" | "KeyRound" | "Sparkles";

const iconColors: Record<string, string> = {
  message: "var(--yellow)",
  security: "#ff6b6b",
  contact: "#4ade80",
  system: "var(--yellow)",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between" style={{ background: "var(--surface)" }}>
        <div>
          <h1 className="font-display text-xl font-black">Уведомления</h1>
          {unreadCount > 0 && (
            <p className="text-xs font-body mt-0.5" style={{ color: "var(--text-muted)" }}>
              {unreadCount} непрочитанных
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-body px-3 py-1.5 rounded-lg transition-all"
            style={{ color: "var(--yellow)", background: "rgba(255,215,0,0.08)" }}
          >
            Прочитать все
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none">
        {notifications.map((n, i) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className="w-full flex items-start gap-3 px-4 py-4 border-b transition-all hover:bg-white/5 animate-fade-in text-left relative"
            style={{ borderColor: "var(--border-color)", animationDelay: `${i * 0.05}s`, opacity: 0 }}
          >
            {!n.read && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "var(--yellow)" }}></span>
            )}
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `${iconColors[n.type]}18`, border: `1px solid ${iconColors[n.type]}30` }}
            >
              <Icon name={n.icon as IconName} size={18} style={{ color: iconColors[n.type] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`font-display text-sm font-bold truncate ${!n.read ? "" : "opacity-70"}`}>
                  {n.title}
                </span>
                <span className="text-xs font-body flex-shrink-0" style={{ color: "var(--text-muted)" }}>{n.time}</span>
              </div>
              <p className="text-xs font-body leading-relaxed" style={{ color: n.read ? "var(--text-muted)" : "var(--text)" }}>
                {n.text}
              </p>
            </div>
          </button>
        ))}

        {notifications.every((n) => n.read) && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.15)" }}>
              <Icon name="Bell" size={28} style={{ color: "var(--yellow)" }} />
            </div>
            <p className="font-display text-sm font-bold">Всё прочитано</p>
            <p className="text-xs font-body" style={{ color: "var(--text-muted)" }}>Новых уведомлений нет</p>
          </div>
        )}
      </div>
    </div>
  );
}
