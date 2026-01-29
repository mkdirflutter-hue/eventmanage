'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Send, Search, Users, MoreVertical, Phone, Video } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

interface Chat {
  id: string
  name: string
  type: 'club' | 'direct'
  lastMessage: string
  lastMessageTime: string
  unread: number
  avatar?: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: any
}

export default function OrganizerChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChats = async () => {
    try {
      const userId = auth.currentUser?.uid
      // In real implementation, fetch chats from Firebase
      // For now, using mock data
      setChats([
        { id: '1', name: 'Tech Club', type: 'club', lastMessage: 'Meeting at 4pm tomorrow', lastMessageTime: '2m ago', unread: 3 },
        { id: '2', name: 'Coding Club', type: 'club', lastMessage: 'Hackathon registrations open!', lastMessageTime: '1h ago', unread: 0 },
        { id: '3', name: 'Admin Team', type: 'direct', lastMessage: 'Budget approved', lastMessageTime: '3h ago', unread: 1 },
        { id: '4', name: 'Amit Sharma', type: 'direct', lastMessage: 'Thanks for the update', lastMessageTime: 'Yesterday', unread: 0 },
      ])
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    // Mock messages for selected chat
    setMessages([
      { id: '1', senderId: 'other', senderName: 'Admin', content: 'Hey, how is the event planning going?', timestamp: '10:30 AM' },
      { id: '2', senderId: auth.currentUser?.uid || 'me', senderName: 'You', content: 'Great! We have finalized the venue and speakers.', timestamp: '10:32 AM' },
      { id: '3', senderId: 'other', senderName: 'Admin', content: 'Perfect! What about the budget?', timestamp: '10:35 AM' },
      { id: '4', senderId: auth.currentUser?.uid || 'me', senderName: 'You', content: 'Budget is within limits. We might need an additional $500 for refreshments.', timestamp: '10:38 AM' },
      { id: '5', senderId: 'other', senderName: 'Admin', content: 'Budget approved. Let me know if you need anything else.', timestamp: '10:40 AM' },
    ])
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const newMsg = {
        id: Date.now().toString(),
        senderId: auth.currentUser?.uid || 'me',
        senderName: 'You',
        content: newMessage,
        timestamp: 'Just now',
      }
      setMessages([...messages, newMsg])
      setNewMessage('')

      // In real implementation, save to Firebase
      // await addDoc(collection(db, 'messages'), {
      //   chatId: selectedChat.id,
      //   senderId: auth.currentUser?.uid,
      //   content: newMessage,
      //   timestamp: serverTimestamp(),
      // })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout role="organizer">
      <div className="h-[calc(100vh-140px)] flex bg-card rounded-xl border border-border overflow-hidden">
        {/* Chats Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium flex-shrink-0">
                  {chat.type === 'club' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    chat.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground text-sm truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                  {selectedChat.type === 'club' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    selectedChat.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.type === 'club' ? 'Club Chat' : 'Direct Message'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Video className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isMe = message.senderId === auth.currentUser?.uid || message.senderId === 'me'
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
