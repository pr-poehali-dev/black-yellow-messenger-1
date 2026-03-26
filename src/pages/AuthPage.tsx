import { useState } from "react";
import Icon from "@/components/ui/icon";

const AUTH_URL = "https://functions.poehali.dev/e4851a1d-533d-4c6c-95b0-1ee66d8165f9";

async function authApi(body: Record<string, string>) {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// Шаги:
// "phone"    — ввод номера (всегда первый экран)
// "login"    — повторный вход: номер уже есть → вводим пароль
// "code"     — новый номер: вводим SMS-код
// "register" — новый номер после кода: имя + создание пароля

type Step = "phone" | "login" | "code" | "register";

interface AuthPageProps {
  onAuth: (phone: string, name: string) => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredName, setRegisteredName] = useState(""); // имя уже зарегистрированного

  const formatPhone = (val: string) => {
    const d = val.replace(/\D/g, "");
    if (d.length === 0) return "";
    let r = "+7";
    if (d.length > 1) r += " (" + d.slice(1, 4);
    if (d.length >= 4) r += ") " + d.slice(4, 7);
    if (d.length >= 7) r += "-" + d.slice(7, 9);
    if (d.length >= 9) r += "-" + d.slice(9, 11);
    return r;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const cl = raw.startsWith("7") ? raw : "7" + raw.replace(/^7?/, "");
    setPhone(cl.slice(0, 11));
    setError("");
  };

  // После ввода номера — проверяем зарегистрирован ли
  const handlePhoneNext = async () => {
    if (phone.length < 11) return;
    setLoading(true);
    setError("");
    const { data } = await authApi({ action: "check-phone", phone });
    setLoading(false);
    if (data.registered) {
      setRegisteredName(data.name);
      setStep("login");
    } else {
      // Новый номер — отправляем OTP
      const res = await authApi({ action: "send-code", phone });
      if (!res.ok) {
        setError(res.data.error || "Ошибка отправки кода");
        return;
      }
      setStep("code");
    }
  };

  // OTP ввод
  const handleOtpInput = (val: string, idx: number) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError("");
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      handleVerifyCode(next.join(""));
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleVerifyCode = async (code: string) => {
    setLoading(true);
    setError("");
    const res = await authApi({ action: "verify-code", phone, code });
    setLoading(false);
    if (!res.ok) {
      setError(res.data.error || "Неверный код");
      return;
    }
    if (res.data.registered) {
      // Номер уже есть (восстановление) — идём к паролю
      setRegisteredName(res.data.name);
      setStep("login");
    } else {
      setStep("register");
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    await authApi({ action: "send-code", phone });
    setLoading(false);
  };

  // Повторный вход: телефон + пароль
  const handleLogin = async () => {
    if (!password) { setError("Введите пароль"); return; }
    setLoading(true);
    setError("");
    const res = await authApi({ action: "login", phone, password });
    setLoading(false);
    if (!res.ok) {
      setError(res.data.error || "Ошибка входа");
      return;
    }
    onAuth(phone, res.data.name);
  };

  // Первый вход: имя + создание пароля
  const handleRegister = async () => {
    if (!name.trim()) { setError("Введите имя"); return; }
    if (password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    if (password !== passwordConfirm) { setError("Пароли не совпадают"); return; }
    setLoading(true);
    setError("");
    const res = await authApi({ action: "register", phone, name: name.trim(), password });
    setLoading(false);
    if (!res.ok) {
      setError(res.data.error || "Ошибка регистрации");
      return;
    }
    onAuth(phone, name.trim());
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.07) 0%, transparent 60%), var(--black)" }}
    >
      <div className="w-full max-w-sm animate-fade-in">

        {/* Лого */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center">
              <Icon name="KeyRound" size={20} className="text-black" />
            </div>
            <span className="font-display text-2xl font-black text-yellow tracking-tight">2Keys</span>
          </div>
          <p className="text-sm font-body" style={{ color: "var(--text-muted)" }}>
            {step === "login"
              ? <>С возвращением, <span style={{ color: "var(--text)" }}>{registeredName}</span></>
              : "Защищённые переписки с End-to-End шифрованием"}
          </p>
        </div>

        {/* ── Шаг 1: Телефон ── */}
        {step === "phone" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-body mb-2"
                style={{ color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Номер телефона
              </label>
              <input
                type="tel"
                value={formatPhone(phone)}
                onChange={handlePhoneInput}
                onKeyDown={(e) => e.key === "Enter" && handlePhoneNext()}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3.5 rounded-xl text-base font-body border transition-all"
                style={{ background: "var(--surface2)", borderColor: error ? "#ff6b6b" : "var(--border-color)", color: "var(--text)", caretColor: "var(--yellow)" }}
                autoFocus
              />
            </div>
            {error && <p className="text-xs font-body" style={{ color: "#ff6b6b" }}>{error}</p>}
            <button
              onClick={handlePhoneNext}
              disabled={phone.length < 11 || loading}
              className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wide transition-all disabled:opacity-40"
              style={{ background: "var(--yellow)", color: "var(--black)" }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" /> Проверяю...</span>
                : "Продолжить"}
            </button>
            <p className="text-xs text-center font-body" style={{ color: "var(--text-muted)" }}>
              Новый номер — получите SMS-код. Зарегистрированный — войдёте по паролю.
            </p>
          </div>
        )}

        {/* ── Шаг 2а: Повторный вход по паролю ── */}
        {step === "login" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 rounded-xl flex items-center gap-2"
              style={{ background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}>
              <Icon name="Phone" size={14} style={{ color: "var(--yellow)" }} />
              <span className="text-sm font-body" style={{ color: "var(--text)" }}>{formatPhone(phone)}</span>
              <button onClick={() => { setStep("phone"); setError(""); setPassword(""); }}
                className="ml-auto text-xs font-body" style={{ color: "var(--text-muted)" }}>
                Изменить
              </button>
            </div>
            <div>
              <label className="block text-xs font-body mb-2"
                style={{ color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Введите пароль"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-base font-body border transition-all"
                  style={{ background: "var(--surface2)", borderColor: error ? "#ff6b6b" : "var(--border-color)", color: "var(--text)", caretColor: "var(--yellow)" }}
                  autoFocus
                />
                <button onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                  <Icon name={showPw ? "EyeOff" : "Eye"} size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>
            {error && <p className="text-xs font-body" style={{ color: "#ff6b6b" }}>{error}</p>}
            <button
              onClick={handleLogin}
              disabled={!password || loading}
              className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wide transition-all disabled:opacity-40"
              style={{ background: "var(--yellow)", color: "var(--black)" }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" /> Вхожу...</span>
                : "Войти"}
            </button>
          </div>
        )}

        {/* ── Шаг 2б: OTP-код ── */}
        {step === "code" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <p className="text-sm font-body mb-1" style={{ color: "var(--text-muted)" }}>Код отправлен на</p>
              <p className="font-display text-base font-bold text-yellow">{formatPhone(phone)}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-11 text-center text-xl font-display font-bold rounded-xl border transition-all"
                  style={{ background: "var(--surface2)", borderColor: digit ? "var(--yellow)" : error ? "#ff6b6b" : "var(--border-color)", color: "var(--text)", height: "52px" }}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className="text-xs text-center font-body" style={{ color: "#ff6b6b" }}>{error}</p>}
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <Icon name="Loader2" size={14} className="animate-spin text-yellow" />
                Проверяю код...
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                className="text-sm font-body py-2 transition-all" style={{ color: "var(--text-muted)" }}>
                ← Изменить номер
              </button>
              <button onClick={handleResendCode} disabled={loading}
                className="text-sm font-body py-2 transition-all" style={{ color: "var(--yellow)" }}>
                Отправить снова
              </button>
            </div>
          </div>
        )}

        {/* ── Шаг 3: Регистрация — имя + создание пароля ── */}
        {step === "register" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="ShieldCheck" size={28} className="text-black" />
              </div>
              <p className="font-display text-lg font-bold">Создайте аккаунт</p>
              <p className="text-sm font-body mt-1" style={{ color: "var(--text-muted)" }}>
                Номер подтверждён. Придумайте имя и пароль.
              </p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Ваше имя"
              className="w-full px-4 py-3.5 rounded-xl text-base font-body border transition-all"
              style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)", caretColor: "var(--yellow)" }}
              autoFocus
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Пароль (минимум 6 символов)"
                className="w-full px-4 py-3.5 pr-12 rounded-xl text-base font-body border transition-all"
                style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)", caretColor: "var(--yellow)" }}
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                <Icon name={showPw ? "EyeOff" : "Eye"} size={16} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <input
              type={showPw ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => { setPasswordConfirm(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Повторите пароль"
              className="w-full px-4 py-3.5 rounded-xl text-base font-body border transition-all"
              style={{ background: "var(--surface2)", borderColor: "var(--border-color)", color: "var(--text)", caretColor: "var(--yellow)" }}
            />
            {/* Индикатор силы пароля */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all"
                    style={{ background: password.length >= i * 3 ? "var(--yellow)" : "var(--border-color)" }} />
                ))}
              </div>
            )}
            {error && <p className="text-xs font-body" style={{ color: "#ff6b6b" }}>{error}</p>}
            <button
              onClick={handleRegister}
              disabled={!name.trim() || !password || !passwordConfirm || loading}
              className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wide transition-all disabled:opacity-40"
              style={{ background: "var(--yellow)", color: "var(--black)" }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Icon name="Loader2" size={16} className="animate-spin" /> Создаю аккаунт...</span>
                : "Создать аккаунт"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center gap-2" style={{ opacity: 0.4 }}>
        <Icon name="ShieldCheck" size={12} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
          End-to-End шифрование · Без рекламы · Без слежки
        </span>
      </div>
    </div>
  );
}
