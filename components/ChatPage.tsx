import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, ChatBubbleIcon, SendIcon } from './Icons';
import { ApiService, Conversation, Message } from '../services/api';
import { socketService } from '../services/socket';

export const ChatPage: React.FC<{ initialChatId?: string; currentUserId?: string }> = ({ initialChatId, currentUserId }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeChat = conversations.find(c => c.id === selectedChatId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat?.messages, selectedChatId]);

    // Socket Integration: Listen for new messages
    useEffect(() => {
        const handleNewMessage = (msg: Message | any) => {
            console.log('Socket received message:', msg);
            // Defensive check
            if (!msg.conversationId && !msg.rideId) return;

            setConversations(prev => prev.map(c => {
                // Check if message belongs to this conversation
                // Note: msg.conversationId is the robust way, msg.rideId is legacy fallback
                if (c.id === msg.conversationId || (msg.rideId && c.id === msg.rideId)) {

                    // Determine sender type based on ID
                    const isMe = msg.senderId === currentUserId || msg.senderId === 'admin';
                    // 'admin' check kept for legacy/fallback if string is ever used

                    // Check for duplicates
                    // If optimistic update already added it (local temp ID), we might have overlap. 
                    // Usually real ID differs from temp ID, so we might check content + timestamp approx?
                    // Ideally, we replace the optimistic one. For now, simple dedupe on ID if backend returns same ID (unlikely if optimistic was temp)
                    // OR if we sent it, we typically ignore the echo if we trust optimistic. 
                    // BUT socket echo confirms receipt. 
                    // Let's filter duplicates by text + time window if needed, or simply ID.

                    // Improve duplication/echo check
                    // If it's my message (isMe), and I already have a message with same text sent "Just now" or recently, ignore it
                    // The optimistic message has a temp ID but same text.
                    const isDuplicate = c.messages.some(m => {
                        // Same ID (if server returned valid ID matching ours? rare for temp)
                        if (m.id === msg.id) return true;
                        // OR Same text and sender and recent timestamp (last 60s)
                        const timeDiff = Math.abs(new Date(m.timestamp).getTime() - new Date(msg.createdAt || Date.now()).getTime());
                        // Note: m.timestamp is string HH:MM, tricky to compare precise time.
                        // Lets stick to text + sender match for the very last message if it's 'agent'
                        if (isMe && m.sender === 'agent' && m.text === msg.text) return true;

                        return false;
                    });

                    if (isDuplicate) return c;

                    const incomingMsg: Message = {
                        id: msg.id || Date.now().toString(),
                        text: msg.text,
                        sender: isMe ? 'agent' : 'user',
                        timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };

                    return {
                        ...c,
                        messages: [...c.messages, incomingMsg],
                        lastMessage: msg.text,
                        time: 'Just now',
                        unread: (selectedChatId !== c.id) ? (c.unread || 0) + 1 : 0
                    };
                }
                return c;
            }));
        };

        socketService.on('new_message', handleNewMessage);

        return () => {
            socketService.off('new_message', handleNewMessage);
        };
    }, [selectedChatId]);

    // Join Conversation Room when selected
    useEffect(() => {
        if (selectedChatId) {
            console.log('Joining conversation room:', selectedChatId);
            socketService.emit('join_conversation', selectedChatId);
        }
    }, [selectedChatId]);

    useEffect(() => {
        if (initialChatId) {
            setSelectedChatId(initialChatId);
        }
    }, [initialChatId]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const items = await ApiService.getConversations();
                if (mounted && items) {
                    setConversations(items);
                    if (!initialChatId && items.length && !selectedChatId) {
                        setSelectedChatId(items[0].id);
                    }
                    if (initialChatId && items.some(c => c.id === initialChatId)) {
                        setSelectedChatId(initialChatId);
                    }
                }
            } catch (e) {
                console.warn('Failed to load conversations', e);
            }
        })();
        return () => { mounted = false; };
    }, [initialChatId]);

    const [inputMessage, setInputMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !activeChat) return;

        // Optimistic UI Update
        const tempId = Date.now().toString();
        const newMessage: Message = {
            id: tempId,
            text: inputMessage,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setConversations(prev => prev.map(c => {
            if (c.id === selectedChatId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: inputMessage,
                    time: 'Just now'
                };
            }
            return c;
        }));

        const messageText = inputMessage; // capture for closure
        setInputMessage('');

        // Emit to Server
        // We know 'activeChat' exists (checked above)
        // For conversation flow, we rely on conversationId.
        // RecipientId is optional but good for notifications if needed.
        const recipient = activeChat.participants && activeChat.participants.length > 0
            ? activeChat.participants[0]
            : undefined;

        socketService.emit('send_message', {
            conversationId: selectedChatId,
            text: messageText,
            // senderId: 'admin', // REMOVED: Let server use socket.userId (which is valid UUID)
            recipientId: recipient
        });
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-dark-800 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm overflow-hidden">
            {/* Sidebar - Conversation List */}
            <div className="w-full md:w-80 border-r border-gray-200 dark:border-dark-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 border-none rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {conversations.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${selectedChatId === chat.id ? 'bg-primary-50 dark:bg-primary-900/10 border-r-4 border-primary-500' : ''}`}
                        >
                            <div className="relative">
                                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                                <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-dark-800 rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            </div>
                            <div className="ml-3 flex-1 overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{chat.name}</h3>
                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <span className="bg-primary-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block ${chat.role === 'Driver' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                    {chat.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col hidden md:flex">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center bg-gray-50 dark:bg-dark-700/30">
                            <div className="flex items-center">
                                <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                                <div className="ml-3">
                                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{activeChat.name}</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {activeChat.role} • {activeChat.status === 'online' ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-900/50 no-scrollbar">
                            {activeChat.messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'user' && (
                                        <img src={activeChat.avatar} alt={activeChat.name} className="w-8 h-8 rounded-full mr-2 self-end mb-1" />
                                    )}
                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'agent'
                                        ? 'bg-primary-500 text-black rounded-tr-none'
                                        : 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-tl-none'
                                        }`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'agent' ? 'text-primary-900/60' : 'text-gray-400'}`}>
                                            {msg.timestamp}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </button>
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 dark:bg-dark-700 border-transparent focus:border-primary-500 focus:ring-0 rounded-lg px-4 py-2 text-gray-900 dark:text-white outline-none transition-colors"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim()}
                                    className={`p-2 rounded-lg transition-colors ${inputMessage.trim()
                                        ? 'bg-primary-500 text-black hover:bg-primary-600'
                                        : 'bg-gray-200 dark:bg-dark-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <SendIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <ChatBubbleIcon className="h-16 w-16 mb-4 text-gray-300 dark:text-dark-600" />
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};
