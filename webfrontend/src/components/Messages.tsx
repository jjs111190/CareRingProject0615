import React, { useState, useEffect } from 'react';
import { Search, Edit, Phone, Video, Info, ArrowLeft, Send } from 'lucide-react';
import { apiClient } from '../services/api';
import type { User, MessageUser, Message } from '../types';

interface MessagesProps {
  currentUser: User;
}

const Messages: React.FC<MessagesProps> = ({ currentUser }) => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageUsers, setMessageUsers] = useState<MessageUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  useEffect(() => {
    loadMessageUsers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadConversationMessages(selectedChat);
      markMessagesAsRead(selectedChat);
    }
  }, [selectedChat]);

  const loadMessageUsers = async () => {
    try {
      const users = await apiClient.getMessageUsers();
      setMessageUsers(users);
    } catch (error) {
      console.error('Failed to load message users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (userId: number) => {
    try {
      const conversationMessages = await apiClient.getConversationMessages(userId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  };

  const markMessagesAsRead = async (senderId: number) => {
    try {
      await apiClient.markMessagesAsRead(senderId);
      // Update unread count in the UI
      setMessageUsers(prev => 
        prev.map(user => 
          user.user_id === senderId 
            ? { ...user, unread_count: 0 }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    setSendingMessage(true);
    try {
      const sentMessage = await apiClient.sendMessage(selectedChat, newMessage.trim());
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Update last message in user list
      setMessageUsers(prev => 
        prev.map(user => 
          user.user_id === selectedChat 
            ? { ...user, last_message: newMessage.trim(), time: 'now' }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedChatUser = selectedChat ? messageUsers.find(user => user.user_id === selectedChat) : null;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 mb-20 md:mb-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 mb-20 md:mb-0">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex">
        {/* Sidebar - Always visible on desktop, conditional on mobile */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${
          !showUserList && selectedChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{currentUser.nickname}</h2>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <Edit className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4387E5] focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {messageUsers.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 text-sm">Start a conversation with your friends</p>
              </div>
            ) : (
              messageUsers
                .filter(user => 
                  user.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => {
                      setSelectedChat(user.user_id);
                      setShowUserList(false);
                    }}
                    className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedChat === user.user_id ? 'bg-blue-50 border-r-2 border-[#4387E5]' : ''
                    }`}
                  >
                    <div className="relative">
                      {user.profile_image ? (
                        <img
                          src={`http://localhost:51235${user.profile_image}`}
                          alt={user.username}
                          className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#4387E5] rounded-full border-2 border-gray-200 flex items-center justify-center text-white font-semibold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {user.unread_count > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4387E5] border-2 border-white rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {user.unread_count > 9 ? '9+' : user.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {user.username}
                        </h3>
                        <span className="text-xs text-gray-500">{user.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{user.last_message}</p>
                        {user.unread_count > 0 && (
                          <span className="bg-[#4387E5] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                            {user.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex-col ${
          showUserList && !selectedChat ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedChatUser ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowUserList(true)}
                    className="md:hidden p-2 hover:bg-gray-50 rounded-xl transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="relative">
                    {selectedChatUser.profile_image ? (
                      <img
                        src={`http://localhost:51235${selectedChatUser.profile_image}`}
                        alt={selectedChatUser.username}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#4387E5] rounded-full border-2 border-gray-200 flex items-center justify-center text-white font-semibold">
                        {selectedChatUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedChatUser.username}</h3>
                    <p className="text-sm text-gray-500">Active now</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    <Info className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender_id === currentUser.id
                        ? 'bg-[#4387E5] text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMessage}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4387E5] focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="p-3 bg-[#4387E5] text-white rounded-full hover:bg-[#3a75d1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Messages</h3>
                <p className="text-gray-500">Send private messages to friends</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;