import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface User {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  district?: string;
  street?: string;
  image?: string;
  resetOtp?: string;
  resetOtpExpireAt?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => null,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
