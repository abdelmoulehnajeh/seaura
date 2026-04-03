"use client";

import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by rendering a consistent static placeholder on server
    // and the animated version only on client
    if (!mounted) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                background: '#F8F3E8',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                 <div style={{
                    fontFamily: "'Kalnia', serif",
                    fontSize: '1.4rem',
                    letterSpacing: '0.8em',
                    fontWeight: 200,
                    color: '#1a1a1a',
                    textAlign: 'center',
                    marginLeft: '0.8em'
                }}>
                    SEAURA
                </div>
            </div>
        );
    }

    return (
        <div className="seaura-loader-container">
            <div className="loader-ring-wrapper">
                {/* Outer Breathing Ring */}
                <svg viewBox="0 0 100 100" className="loader-svg">
                    <circle 
                        cx="50" cy="50" r="48" 
                        fill="none" 
                        stroke="#1a1a1a" 
                        strokeWidth="0.5" 
                        strokeOpacity="0.1" 
                    />
                    <circle 
                        cx="50" cy="50" r="48" 
                        fill="none" 
                        stroke="#1a1a1a" 
                        strokeWidth="1" 
                        strokeDasharray="200 100" 
                        className="spinning-element"
                    />
                </svg>

                {/* SEAURA Text Emblem */}
                <div className="loader-text-emblem">
                    SEAURA
                </div>
            </div>

            {/* Subtle Progress Label */}
            <div className="loader-label">
                Chargement...
            </div>

            <style>{`
                .seaura-loader-container {
                    position: fixed;
                    inset: 0;
                    background: #F8F3E8;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    animation: fadeIn 0.5s ease-out;
                }
                .loader-ring-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .loader-svg {
                    width: 220px;
                    height: 220px;
                }
                .spinning-element {
                    transform-origin: center;
                    animation: ringRotate 3s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
                }
                .loader-text-emblem {
                    position: absolute;
                    font-family: 'Kalnia', serif;
                    font-size: 1.4rem;
                    letter-spacing: 0.8em;
                    font-weight: 200;
                    color: #1a1a1a;
                    text-align: center;
                    margin-left: 0.8em;
                    animation: textFade 2s ease-in-out infinite;
                }
                .loader-label {
                    margin-top: 1.5rem;
                    font-family: sans-serif;
                    font-size: 10px;
                    letter-spacing: 0.5em;
                    color: #1a1a1a;
                    opacity: 0.3;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                @keyframes ringRotate {
                    0% { transform: rotate(-90deg) scale(1); opacity: 0.2; }
                    50% { transform: rotate(180deg) scale(1.05); opacity: 0.8; }
                    100% { transform: rotate(450deg) scale(1); opacity: 0.2; }
                }
                @keyframes textFade {
                    0%, 100% { opacity: 0.4; transform: scale(0.98); }
                    50% { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
