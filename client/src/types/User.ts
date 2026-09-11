export type User = {
  id: number;
  firstname: string;
  email: string;
  login: string;
  role: "user" | "admin";
  avatar: string;
  isPegi16: boolean;
  darkTheme: boolean;
};
