"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
    userEmail: string | null;
    setUserEmail: (email: string | null) => void;
    isEmailModalOpen: boolean;
    setIsEmailModalOpen: (open: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a Providers");
    return context;
}

export function Providers({ children }: { children: ReactNode }) {
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('seaura_user_email');
        if (storedEmail) {
            setUserEmail(storedEmail);
            setIsEmailModalOpen(false);
        } else {
            // Only auto-open modal on homepage or if needed?
            // User requested "only one time" so if it's not saved, we might show it.
            // But let's leave it to the components to decide when to open.
        }
    }, []);

    return (
        <SessionProvider>
            <UserContext.Provider value={{ userEmail, setUserEmail, isEmailModalOpen, setIsEmailModalOpen }}>
                {children}
            </UserContext.Provider>
        </SessionProvider>
    );
}

