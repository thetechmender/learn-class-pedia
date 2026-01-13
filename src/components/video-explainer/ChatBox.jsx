import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Bot, User, Copy } from 'lucide-react';
import { sendChatMessage } from '../../services/chatApi';
import MarkdownRenderer from './MarkdownRenderer';

export default function ChatBox({ isOpen, onToggle, courseId = 1, isEmbedded = false }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Hello! How can I help you today?',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await sendChatMessage(inputValue, courseId);
            
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: response.message || response.text || 'I apologize, but I encountered an error.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        if (window.confirm('Clear chat history?')) {
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    text: 'Chat cleared. How can I help you?',
                    timestamp: new Date(),
                }
            ]);
        }
    };

    const handleCopyMessage = async (text, messageId) => {
        try {
            await navigator.clipboard.writeText(text);
            const originalText = inputRef.current?.value || '';
            inputRef.current?.focus();
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.value = originalText;
                }
            }, 100);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    if (!isOpen) {
        if (isEmbedded) return null;
        
        return (
            <button
                onClick={onToggle}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-50"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        );
    }

    return (
        <div className={`${isEmbedded 
            ? 'absolute inset-0 flex flex-col' 
            : `fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80 h-16' : 'w-[500px] h-[600px]'}`
        } bg-white border border-gray-200 ${isEmbedded ? 'rounded-none border-0' : 'rounded-lg'} shadow-xl transition-all flex flex-col overflow-hidden`}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Mark jacob</h3>
                        <p className="text-xs text-gray-500">
                            {isTyping ? 'Typing...' : 'Online'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClearChat}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Clear chat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title={isMinimized ? 'Maximize' : 'Minimize'}
                    >
                        {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={onToggle}
                        className="text-gray-500 hover:text-gray-700 p-1"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                            >
                                {message.type === 'bot' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                                    <div className={`p-3 rounded-lg ${
                                        message.type === 'bot'
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'bg-blue-600 text-white'
                                    }`}>
                                        <div className="text-sm">
                                            <MarkdownRenderer content={message.text} />
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs opacity-75">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {message.type === 'bot' && (
                                                <button
                                                    onClick={() => handleCopyMessage(message.text)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                                    title="Copy"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {message.type === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="text-sm text-gray-600">Typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none min-h-[48px] max-h-[120px]"
                                rows="1"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                                title="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Press Enter to send • Shift+Enter for new line
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}