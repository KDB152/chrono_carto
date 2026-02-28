'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messagingAPI } from '../lib/api';
import { TextWithLinks } from '../utils/linkUtils';
import { User, Message, Conversation, Group } from '../types/messaging';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Users,
  Plus,
  X,
  MoreVertical,
  CheckCircle,
  Clock,
  Paperclip,
  Smile,
  Mic,
  Video,
  Phone,
  Download,
  Settings,
  Trash2,
  Archive,
  Star,
  Reply,
  Forward,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload
} from 'lucide-react';

interface MessagingSystemProps {
  currentUserId: number;
  currentUserRole: string;
}

const MessagingSystemWithGroups: React.FC<MessagingSystemProps> = ({ currentUserId, currentUserRole }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversations' | 'groups'>('conversations');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Emojis
  const popularEmojis = [
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '?', '??', '???', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '?', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '???', '??', '??', '??', '??', '??', '??', '??',
    '?', '?', '?', '?', '?', '?', '?', '?', '?', '?',
    '?', '?', '?', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '???', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '???', '???', '??', '??', '???',
    '??', '?', '?', '??', '?', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '?', '?', '?',
    '?', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '?', '??', '??', '??', '??', '?', '??', '??',
    '??', '??', '??', '??', '??', '?', '???', '??', '???', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '??', '??', '??', '??', '??', '??', '??', '??', '??',
    '??', '0??', '1??', '2??', '3??', '4??', '5??', '6??', '7??', '8??',
    '9??', '??'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les conversations et groupes en parallèle
      const [conversationsData, groupsData, usersData] = await Promise.all([
        messagingAPI.getConversations(),
        messagingAPI.getUserGroups(),
        messagingAPI.getAvailableRecipients()
      ]);

      setConversations(conversationsData);
      setGroups(groupsData);
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrer une conversation directe
  const startDirectConversation = async (user: User) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await messagingAPI.createOrGetConversation(currentUserId, user.id);
      const conversation = response.conversation;
      
      // Ajouter les informations utilisateur à la conversation
      const conversationWithUsers = {
        ...conversation,
        participant1: conversation.participant1_id === currentUserId ? 
          { id: currentUserId, firstName: 'Vous', lastName: '', email: '', role: currentUserRole } : user,
        participant2: conversation.participant2_id === currentUserId ? 
          { id: currentUserId, first_name: 'Vous', last_name: '', email: '', role: currentUserRole } : user
      };
      
      setCurrentConversation(conversationWithUsers);
      setMessages([]);
      setShowNewConversation(false);
      setSelectedUser(null);
      
      // Charger les messages pour cette conversation
      await loadMessages(conversation.id);
      
      // Actualiser la liste des conversations
      await loadData();
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Erreur lors de la création de la conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrer une conversation de groupe
  const startGroupConversation = async (group: Group) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const conversation = await messagingAPI.getGroupConversation(group.id);
      
      // Ajouter les informations du groupe à la conversation
      const conversationWithGroup = {
        ...conversation,
        group: group
      };
      
      setCurrentConversation(conversationWithGroup);
      setMessages([]);
      setShowNewConversation(false);
      
      // Charger les messages pour cette conversation
      await loadMessages(conversation.id);
      
    } catch (error) {
      console.error('Error starting group conversation:', error);
      setError('Erreur lors de l\'accès au groupe');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: number) => {
    try {
      const messagesData = await messagingAPI.getMessages(conversationId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Erreur lors du chargement des messages');
    }
  };

  // Sélectionner une conversation
  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages([]);
    await loadMessages(conversation.id);
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: newMessage.trim(),
        messageType: 'text'
      };

      await messagingAPI.sendMessage(messageData);
      setNewMessage('');
      
      // Recharger les messages
      await loadMessages(currentConversation.id);
      
      // Actualiser la liste des conversations
      await loadData();
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  // Gérer la sélection de fichier
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Envoyer un fichier
  const sendFile = async () => {
    if (!selectedFile || !currentConversation) return;

    try {
      setIsLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResult = await messagingAPI.uploadFile(formData);
      
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: `Fichier: ${uploadResult.fileName}`,
        messageType: 'file'
      };

      await messagingAPI.sendMessage(messageData);
      
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Recharger les messages
      await loadMessages(currentConversation.id);
      
    } catch (error) {
      console.error('Error sending file:', error);
      setError('Erreur lors de l\'envoi du fichier');
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un emoji
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Obtenir le nom d'affichage pour une conversation
  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.type === 'group' && conversation.group) {
      // Supprimer le préfixe "Groupe" des noms de groupes
      return conversation.group.name.replace(/^Groupe\s+/i, '');
    }
    
    if (conversation.participant1_id === currentUserId) {
      return `${conversation.participant2?.firstName} ${conversation.participant2?.lastName}`;
    } else {
      return `${conversation.participant1?.firstName} ${conversation.participant1?.lastName}`;
    }
  };

  // Obtenir l'avatar pour une conversation
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return <Users className="w-8 h-8 text-blue-500" />;
    }
    
    return <User className="w-8 h-8 text-gray-500" />;
  };

  // Filtrer les conversations et groupes
  const filteredConversations = conversations.filter(conv => 
    getConversationDisplayName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.replace(/^Groupe\s+/i, '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs - Masquer pour les parents */}
        {currentUserRole !== 'parent' && (
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'conversations'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'groups'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Groupes
            </button>
          </div>
        )}

        {/* Conversations/Groups List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (currentUserRole === 'parent' || activeTab === 'conversations') ? (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                    currentConversation?.id === conversation.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getConversationAvatar(conversation)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getConversationDisplayName(conversation)}
                      </p>
                      {conversation.lastMessage?.content && (
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => startGroupConversation(group)}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {group.name.replace(/^Groupe\s+/i, '')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {group.description || group.class_level}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getConversationAvatar(currentConversation)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getConversationDisplayName(currentConversation)}
                    </h3>
                    {currentConversation.type === 'group' && (
                      <p className="text-sm text-gray-500">
                        {currentConversation.group?.participants?.length || 0} participants
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === currentUserId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {/* Afficher le nom de l'expéditeur pour les messages des autres utilisateurs */}
                    {message.sender_id !== currentUserId && message.sender && (
                      <p className="text-xs text-gray-600 mb-1 font-medium">
                        {message.sender.firstName} {message.sender.lastName}
                      </p>
                    )}
                    <div className="text-sm">
                      <TextWithLinks 
                        text={message.content} 
                        className="text-sm"
                        linkClassName="underline hover:no-underline transition-all"
                      />
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleString('fr-FR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {selectedFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={selectedFile ? sendFile : sendMessage}
                  disabled={!newMessage.trim() && !selectedFile}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => addEmoji(emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Aucune conversation sélectionnée</h3>
              <p className="text-sm">Sélectionnez une conversation ou créez-en une nouvelle</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Modal */}
      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="text-red-500 mb-4">
              <h3 className="text-lg font-semibold">Erreur</h3>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingSystemWithGroups;


