export interface Member {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  isAdmin: boolean;
}

export interface Message {
  id: number;
  text: string;
  from: "me" | "them";
  senderName?: string;
  time: string;
}

export interface Chat {
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
  messages: Message[];
}

export const ALL_CONTACTS: Member[] = [
  { id: 1, name: "Алексей Морозов", avatar: "АМ", phone: "+7 (916) 123-45-67", isAdmin: false },
  { id: 2, name: "Маша Петрова", avatar: "МП", phone: "+7 (925) 111-22-33", isAdmin: false },
  { id: 3, name: "Денис Васильев", avatar: "ДВ", phone: "+7 (903) 987-65-43", isAdmin: false },
  { id: 4, name: "Игорь Смирнов", avatar: "ИС", phone: "+7 (912) 555-44-33", isAdmin: false },
];

export const INITIAL_CHATS: Chat[] = [
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
