import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AuthPage from "@/pages/AuthPage";
import ChatsPage from "@/pages/ChatsPage";
import ContactsPage from "@/pages/ContactsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";

type Tab = "chats" | "contacts" | "notifications" | "profile";

const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "chats", label: "Чаты", icon: "MessageSquare" },
  { id: "contacts", label: "Контакты", icon: "Users" },
  { id: "notifications", label: "События", icon: "Bell" },
  { id: "profile", label: "Профиль", icon: "User" },
];

const STORAGE_KEY = "2keys_user";

function loadUser(): { phone: string; name: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const saved = loadUser();
  const [authed, setAuthed] = useState(!!saved);
  const [user, setUser] = useState(saved ?? { phone: "", name: "" });
  const [tab, setTab] = useState<Tab>("chats");
  const [unreadNotifs] = useState(2);

  useEffect(() => {
    if (authed && user.phone) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [authed, user]);

  const handleAuth = (phone: string, name: string) => {
    setUser({ phone, name });
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setUser({ phone: "", name: "" });
    setTab("chats");
  };

  if (!authed) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div
      className="flex flex-col h-screen max-w-md mx-auto relative"
      style={{ background: "var(--black)" }}
    >
      <div
        className="flex-1 overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        <div className="h-full overflow-hidden">
          {tab === "chats" && <ChatsPage userName={user.name} />}
          {tab === "contacts" && <ContactsPage />}
          {tab === "notifications" && <NotificationsPage />}
          {tab === "profile" && (
            <ProfilePage
              name={user.name}
              phone={user.phone}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      <nav
        className="flex-shrink-0 border-t"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-color)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        <div className="flex items-stretch">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            const showBadge = item.id === "notifications" && unreadNotifs > 0;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all relative"
              >
                <div className="relative">
                  <Icon
                    name={item.icon}
                    size={22}
                    style={{ color: isActive ? "var(--yellow)" : "var(--text-muted)" }}
                  />
                  {showBadge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-display font-black text-black"
                      style={{ background: "var(--yellow)", fontSize: "9px" }}
                    >
                      {unreadNotifs}
                    </span>
                  )}
                </div>
                <span
                  className="font-body"
                  style={{
                    color: isActive ? "var(--yellow)" : "var(--text-muted)",
                    fontSize: "10px",
                    letterSpacing: "0.03em",
                  }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: "var(--yellow)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}