import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
    clientId: string;
    playerName?: string;
    message: string;
    timestamp: number;
}

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    myClientId?: string;
}

const EMOJI_SHORTCUTS: Record<string, string> = {
    ':fire:': '🔥',
    ':check:': '✅',
    ':x:': '❌',
    ':wave:': '👋',
    ':thumbsup:': '👍',
    ':thumbsdown:': '👎',
    ':middlefinger:': '🖕',
    ':clap:': '👏',
    ':thinking:': '🤔',
    ':eyes:': '👀',
    ':rocket:': '🚀',
    ':party:': '🎉',
    ':gg:': '🎮'
};

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, myClientId }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        // Replace emoji shortcuts
        let processedMessage = input;
        Object.entries(EMOJI_SHORTCUTS).forEach(([shortcut, emoji]) => {
        processedMessage = processedMessage.replaceAll(shortcut, emoji);
        });
        
        onSendMessage(processedMessage);
        setInput('');
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        overflow: 'hidden'
        }}>
        {/* Header */}
        <div style={{
            padding: '16px',
            borderBottom: '1px solid #334155',
            fontWeight: '600',
            color: 'white',
            fontSize: '16px'
        }}>
            💬 Chat
        </div>

        {/* Messages */}
        <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            {messages.length === 0 ? (
            <div style={{
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px',
                marginTop: '20px'
            }}>
                No messages yet. Say hi! 👋
            </div>
            ) : (
            messages.map((msg, idx) => {
                const isMe = msg.clientId === myClientId;
                return (
                <div
                    key={idx}
                    style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    animation: 'slideUp 0.2s ease-out'
                    }}
                >
                    <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    marginBottom: '4px'
                    }}>
                    {!isMe && (
                        <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#94a3b8'
                        }}>
                        {msg.playerName || 'Anonymous'}
                        </span>
                    )}
                    <span style={{
                        fontSize: '11px',
                        color: '#64748b'
                    }}>
                        {formatTime(msg.timestamp)}
                    </span>
                    </div>
                    <div style={{
                    background: isMe ? '#3b82f6' : '#0f172a',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    border: isMe ? 'none' : '1px solid #334155'
                    }}>
                    {msg.message}
                    </div>
                </div>
                );
            })
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
            padding: '16px',
            borderTop: '1px solid #334155',
            display: 'flex',
            gap: '8px'
        }}>
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
                }
            }}
            placeholder="Type a message..."
            maxLength={200}
            style={{
                flex: 1,
                padding: '10px 14px',
                background: '#0f172a',
                border: '2px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#334155'}
            />
            <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
                padding: '10px 20px',
                background: input.trim() ? '#3b82f6' : '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                if (input.trim()) {
                e.currentTarget.style.background = '#2563eb';
                }
            }}
            onMouseLeave={(e) => {
                if (input.trim()) {
                e.currentTarget.style.background = '#3b82f6';
                }
            }}
            >
            Send
            </button>
        </div>

        {/* Emoji shortcuts hint */}
        <div style={{
            padding: '8px 16px',
            background: '#0f172a',
            borderTop: '1px solid #334155',
            fontSize: '11px',
            color: '#64748b',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
        }}>
            <span>💡 Try: :) :D &lt;3 :fire: :check: :wave: :thumbsup: :gg:</span>
        </div>

        <style>{`
            @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
            }
        `}</style>
        </div>
    );
};