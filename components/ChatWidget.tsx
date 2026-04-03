"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageCircle, Send, X as CloseIcon } from "lucide-react";
import styles from "../app/page.module.css";

export default function ChatWidget({ userEmail: propEmail }: { userEmail?: string | null }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(propEmail || null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isSubmittingChat, setIsSubmittingChat] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!userEmail) {
            const stored = localStorage.getItem('seaura_user_email');
            if (stored) setUserEmail(stored);
        }
    }, []);

    const fetchChatHistory = async () => {
        if (!userEmail) return;
        try {
            const res = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `query($email: String!) { chatHistory(email: $email) { id content sender_role created_at } }`,
                    variables: { email: userEmail }
                })
            });
            const data = await res.json();
            setChatMessages(data.data?.chatHistory || []);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (userEmail && isChatOpen) {
            fetchChatHistory();
            const interval = setInterval(fetchChatHistory, 3000);
            return () => clearInterval(interval);
        }
    }, [userEmail, isChatOpen]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    const handleSendChat = async () => {
        if (!chatInput.trim() || !userEmail || isSubmittingChat) return;
        setIsSubmittingChat(true);
        try {
            await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `mutation($email: String!, $content: String!, $role: String!) { 
            sendChatMessage(email: $email, content: $content, role: $role) { id }
          }`,
                    variables: { email: userEmail, content: chatInput, role: 'CLIENT' }
                })
            });
            setChatInput("");
            fetchChatHistory();
        } catch (error) { console.error(error); }
        finally { setIsSubmittingChat(false); }
    };

    if (!userEmail) return null; // Chat only for identified users

    return (
        <>
            <button
                className={`${styles.chatBubble} ${isChatOpen ? styles.chatBubbleOpen : ""}`}
                onClick={() => setIsChatOpen(!isChatOpen)}
            >
                {isChatOpen ? <CloseIcon size={24} /> : <MessageCircle size={24} />}
                {!isChatOpen && <span className={styles.chatBadge}>1</span>}
            </button>

            {isChatOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white overflow-hidden border border-white/20">
                                <Image src="/images/hero.png" alt="Staff" fill className="object-cover opacity-80" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-black/90">SEAURA Concierge</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Artisan Online</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} className="text-black/30 hover:text-black">
                            <CloseIcon size={18} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className={styles.chatBody}>
                            <div className="mb-6 opacity-30 text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em]">Dialogue avec {userEmail}</p>
                            </div>
                            {chatMessages.map((msg: any) => (
                                <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender_role === 'ADMIN' ? styles.msgAdmin : styles.msgClient}`}>
                                    <div className={styles.messageBubble}>
                                        {msg.content}
                                    </div>
                                    <span className={styles.messageTime}>
                                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            ))}
                            {chatMessages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-[10px] items-center font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Comment pouvons-nous vous assister aujourd'hui ?</p>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className={styles.chatFooter}>
                            <input
                                type="text"
                                placeholder="Écrivez un message..."
                                className={styles.chatInput}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                            />
                            <button
                                onClick={handleSendChat}
                                disabled={isSubmittingChat}
                                className={styles.sendBtn}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
