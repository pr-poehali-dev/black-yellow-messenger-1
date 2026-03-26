import { useState } from "react";
import Icon from "@/components/ui/icon";

interface AuthPageProps {
  onAuth: (phone: string, name: string) => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [step, setStep] = useState<"phone" | "code" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 0) return "";
    let result = "+7";
    if (digits.length > 1) result += " (" + digits.slice(1, 4);
    if (digits.length >= 4) result += ") " + digits.slice(4, 7);
    if (digits.length >= 7) result += "-" + digits.slice(7, 9);
    if (digits.length >= 9) result += "-" + digits.slice(9, 11);
    return result;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const clamped = raw.startsWith("7") ? raw : "7" + raw.replace(/^7?/, "");
    setPhone(clamped.slice(0, 11));
  };

  const handleSendCode = () => {
    if (phone.length < 11) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("code");
    }, 1200);
  };

  const handleCodeInput = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...code];
    next[idx] = val;
    setCode(next);
    if (val && idx < 5) {
      const el = document.getElementById(`otp-${idx + 1}`);
      el?.focus();
    }
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("name");
      }, 900);
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      const el = document.getElementById(`otp-${idx - 1}`);
      el?.focus();
    }
  };

  const handleFinish = () => {
    if (!name.trim()) return;
    onAuth(phone, name.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.07) 0%, transparent 60%), var(--black)" }}>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center">
              <Icon name="KeyRound" size={20} className="text-black" />
            </div>
            <span className="font-display text-2xl font-black text-yellow tracking-tight">2Keys</span>
          </div>
          <p className="text-sm text-muted-foreground font-body" style={{ color: "var(--text-muted)" }}>
            Защищённые переписки с End-to-End шифрованием
          </p>
        </div>

        {step === "phone" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-body mb-2" style={{ color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Номер телефона
              </label>
              <input
                type="tel"
                value={formatPhone(phone)}
                onChange={handlePhoneInput}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3.5 rounded-xl text-base font-body border transition-all"
                style={{
                  background: "var(--surface2)",
                  borderColor: "var(--border-color)",
                  color: "var(--text)",
                  caretColor: "var(--yellow)",
                }}
                autoFocus
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={phone.length < 11 || loading}
              className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-40"
              style={{ background: "var(--yellow)", color: "var(--black)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Отправляю код...
                </span>
              ) : (
                "Получить код"
              )}
            </button>
            <p className="text-xs text-center font-body" style={{ color: "var(--text-muted)" }}>
              Мы отправим SMS с кодом подтверждения
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <p className="text-sm font-body mb-1" style={{ color: "var(--text-muted)" }}>Код отправлен на</p>
              <p className="font-display text-base font-bold text-yellow">{formatPhone(phone)}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(e.target.value, i)}
                  onKeyDown={(e) => handleCodeKeyDown(e, i)}
                  className="w-11 h-13 text-center text-xl font-display font-bold rounded-xl border transition-all"
                  style={{
                    background: "var(--surface2)",
                    borderColor: digit ? "var(--yellow)" : "var(--border-color)",
                    color: "var(--text)",
                    height: "52px",
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <Icon name="Loader2" size={14} className="animate-spin text-yellow" />
                Проверяю код...
              </div>
            )}
            <button
              onClick={() => { setStep("phone"); setCode(["", "", "", "", "", ""]); }}
              className="w-full text-sm font-body py-2 transition-all"
              style={{ color: "var(--text-muted)" }}
            >
              ← Изменить номер
            </button>
          </div>
        )}

        {step === "name" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="User" size={28} className="text-black" />
              </div>
              <p className="font-display text-lg font-bold">Как вас зовут?</p>
              <p className="text-sm font-body mt-1" style={{ color: "var(--text-muted)" }}>Ваше имя увидят в контактах</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              onKeyDown={(e) => e.key === "Enter" && handleFinish()}
              className="w-full px-4 py-3.5 rounded-xl text-base font-body border transition-all"
              style={{
                background: "var(--surface2)",
                borderColor: "var(--border-color)",
                color: "var(--text)",
                caretColor: "var(--yellow)",
              }}
              autoFocus
            />
            <button
              onClick={handleFinish}
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-40"
              style={{ background: "var(--yellow)", color: "var(--black)" }}
            >
              Войти в 2Keys
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.3s", opacity: 0 }}>
        <Icon name="ShieldCheck" size={12} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>End-to-End шифрование · Без рекламы · Без слежки</span>
      </div>
    </div>
  );
}
