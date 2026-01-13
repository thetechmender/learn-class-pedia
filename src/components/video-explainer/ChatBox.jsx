import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User, Copy, ThumbsUp, ThumbsDown, Clock, BookOpen, Trash2, Paperclip, Mic, MicOff } from 'lucide-react';
import { sendChatMessage, clearChatThread } from '../../services/chatApi';
import MarkdownRenderer from './MarkdownRenderer';

export default function ChatBox({ currentLecture, isOpen, onToggle, courseId = 1 }) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Hi! Feel free to ask me any questions about this lecture! I can help explain concepts, provide examples, or clarify difficult topics.',
            timestamp: new Date(),
            feedback: null,
            isCopied: false
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [threadId, setThreadId] = useState('');
        const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [attachment, setAttachment] = useState(null);
    const [inputHeight, setInputHeight] = useState('56px');
    const [conversationHistory, setConversationHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setInputValue(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            setRecognition(recognition);
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);

    // Load saved conversations
    useEffect(() => {
        const saved = localStorage.getItem(`chat_history_${courseId}`);
        if (saved) {
            setConversationHistory(JSON.parse(saved));
        }
    }, [courseId]);

    // Save conversation to history
    const saveToHistory = (messages) => {
        const historyItem = {
            id: Date.now(),
            title: messages[1]?.text?.substring(0, 50) + '...' || 'New Conversation',
            timestamp: new Date(),
            messageCount: messages.length,
            preview: messages.slice(-1)[0]?.text?.substring(0, 100) || ''
        };
        
        const updatedHistory = [historyItem, ...conversationHistory].slice(0, 10);
        setConversationHistory(updatedHistory);
        localStorage.setItem(`chat_history_${courseId}`, JSON.stringify(updatedHistory));
    };

    // Clear threadId and reset messages when chat is closed/reopened
    useEffect(() => {
        if (!isOpen) {
            setThreadId('');
        } else if (isOpen && messages.length === 1) {
            setMessages([
                {
                    id: 1,
                    type: 'bot',
                    text: 'Hi! Feel free to ask me any questions about this lecture! I can help explain concepts, provide examples, or clarify difficult topics.',
                    timestamp: new Date(),
                    feedback: null,
                    isCopied: false
                }
            ]);
        }
    }, [isOpen, currentLecture]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: inputValue,
            timestamp: new Date(),
            attachment
        };

        const questionText = inputValue;
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setAttachment(null);
        setIsTyping(true);
        setInputHeight('56px');

        try {
            const botResponseData = await sendChatMessage(questionText, currentLecture, courseId, threadId);
            
            if (botResponseData.threadId) {
                setThreadId(botResponseData.threadId);
            }
            
            const botResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: botResponseData.response,
                timestamp: new Date(),
                feedback: null,
                isCopied: false,
                sources: botResponseData.sources || []
            };
            setMessages(prev => [...prev, botResponse]);
            
            // Save conversation after bot response
            if (messages.length >= 3) {
                saveToHistory([...messages, userMessage, botResponse]);
            }
        } catch (error) {
            const errorResponse = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Sorry, I encountered an error. Please try asking your question again. If the problem persists, try rephrasing your question.',
                timestamp: new Date(),
                feedback: null,
                isCopied: false
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
        if (e.key === 'Enter' && e.shiftKey) {
            // Allow shift+enter for new line
            return;
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        // Auto-expand textarea
        if (e.target.scrollHeight > 56) {
            setInputHeight(Math.min(e.target.scrollHeight, 200) + 'px');
        } else {
            setInputHeight('56px');
        }
    };

    const handleVoiceInput = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert('File size must be less than 5MB');
                return;
            }
            setAttachment({
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleCopyMessage = async (text, messageId) => {
        try {
            await navigator.clipboard.writeText(text);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, isCopied: true } : msg
            ));
            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, isCopied: false } : msg
                ));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleFeedback = (messageId, feedback) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, feedback } : msg
        ));
        // Send feedback to backend
        // sendFeedbackToAPI(messageId, feedback);
    };

    const handleClearChat = async () => {
        if (window.confirm('Are you sure you want to clear the chat?')) {
            try {
                if (threadId) {
                    await clearChatThread(threadId);
                }
                setMessages([
                    {
                        id: 1,
                        type: 'bot',
                        text: 'Chat cleared! How can I help you now?',
                        timestamp: new Date(),
                        feedback: null,
                        isCopied: false
                    }
                ]);
                setThreadId('');
            } catch (error) {
                console.error('Failed to clear chat:', error);
            }
        }
    };

    const handleLoadHistory = (historyId) => {
        const history = conversationHistory.find(h => h.id === historyId);
        if (history) {
            setSelectedHistory(history);
            // Load conversation from history
            // You would need to store full conversations in history for this
        }
    };

    const renderMessageContent = (message) => {
        if (message.attachment) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">{message.attachment.name}</span>
                        <span className="text-xs text-slate-500">
                            ({Math.round(message.attachment.size / 1024)}KB)
                        </span>
                    </div>
                    <MarkdownRenderer content={message.text} />
                </div>
            );
        }
        return <MarkdownRenderer content={message.text} />;
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-full shadow-2xl transition-all z-50 group animate-bounce-slow"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {messages.filter(m => m.type === 'bot').length}
                </span>
                <div className="absolute -bottom-12 right-0 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Ask questions about the lecture
                </div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 transition-all ${
            isMinimized ? 'w-80 h-16' : 'w-[550px] h-[750px]'
        } flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base">Mark Jacob</h3>
                        <p className="text-xs text-blue-100 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {threadId ? 'Continuing conversation • ' + messages.length + ' messages' : 'Ready to help'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClearChat}
                        className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                        title="Clear chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                        title={isMinimized ? 'Maximize' : 'Minimize'}
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onToggle}
                        className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/80 to-slate-800/50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                                    message.type === 'bot' 
                                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500' 
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                                }`}>
                                    {message.type === 'bot' ? (
                                        <Bot className="w-5 h-5 text-white" />
                                    ) : (
                                        <User className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className={`flex-1 max-w-[85%] ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                                    <div className={`inline-block w-full p-3 rounded-2xl shadow-lg ${
                                        message.type === 'bot'
                                            ? 'bg-slate-700/90 text-white rounded-tl-none border-l-4 border-cyan-400'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                    }`}>
                                        <div className="prose prose-sm prose-invert max-w-none">
                                            {renderMessageContent(message)}
                                        </div>
                                        
                                        {message.sources && message.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-600/50">
                                                <p className="text-xs font-medium text-slate-300 mb-1">Sources:</p>
                                                <div className="space-y-1">
                                                    {message.sources.map((source, idx) => (
                                                        <div key={idx} className="text-xs text-cyan-300 hover:text-cyan-200 flex items-center gap-1">
                                                            <BookOpen className="w-3 h-3" />
                                                            {source}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs opacity-60">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {message.type === 'bot' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleCopyMessage(message.text, message.id)}
                                                            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                                            title={message.isCopied ? "Copied!" : "Copy"}
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            {message.isCopied ? "Copied!" : "Copy"}
                                                        </button>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleFeedback(message.id, 'like')}
                                                                className={`p-1 rounded ${message.feedback === 'like' ? 'text-green-400 bg-green-400/10' : 'text-slate-400 hover:text-green-400'}`}
                                                                title="Helpful"
                                                            >
                                                                <ThumbsUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleFeedback(message.id, 'dislike')}
                                                                className={`p-1 rounded ${message.feedback === 'dislike' ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:text-red-400'}`}
                                                                title="Not helpful"
                                                            >
                                                                <ThumbsDown className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-slate-700/90 p-3 rounded-2xl rounded-tl-none border-l-4 border-cyan-400">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="text-sm text-slate-300">Typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-700 bg-slate-800/95 backdrop-blur-sm">
                        {attachment && (
                            <div className="mb-3 flex items-center justify-between bg-slate-700/50 p-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-slate-300">{attachment.name}</span>
                                </div>
                                <button
                                    onClick={() => setAttachment(null)}
                                    className="text-slate-400 hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        
                        <div className="flex gap-2">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder="Ask a question about this lecture..."
                                className="flex-1 bg-slate-700 text-white placeholder-slate-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm resize-none overflow-hidden"
                                style={{ height: inputHeight }}
                                rows="1"
                            />
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25"
                                    title="Send message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleVoiceInput}
                                        className={`p-2 rounded-lg ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                                        title={isListening ? 'Stop listening' : 'Voice input'}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300"
                                        title="Attach file"
                                    >
                                        <Paperclip className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-slate-400">
                                Press Enter to send • Shift+Enter for new line
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                    {messages.filter(m => m.type === 'user').length} questions asked
                                </span>
                                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                                <span className="text-xs text-slate-500">
                                    Course ID: {courseId}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Conversation History Sidebar */}
                    {conversationHistory.length > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-48 bg-slate-900/95 border-r border-slate-700 transform -translate-x-full transition-transform hover:translate-x-0">
                            <div className="p-3 border-b border-slate-700">
                                <h4 className="text-sm font-medium text-slate-300">History</h4>
                            </div>
                            <div className="overflow-y-auto h-full p-2">
                                {conversationHistory.map((history) => (
                                    <button
                                        key={history.id}
                                        onClick={() => handleLoadHistory(history.id)}
                                        className={`w-full text-left p-2 rounded-lg mb-1 transition-all ${selectedHistory?.id === history.id ? 'bg-slate-700' : 'hover:bg-slate-800'}`}
                                    >
                                        <p className="text-xs font-medium text-slate-300 truncate">{history.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 truncate">{history.preview}</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {new Date(history.timestamp).toLocaleDateString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}