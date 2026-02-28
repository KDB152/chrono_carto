import React, { useState, useEffect, useRef } from 'react';
import { TextWithLinks } from '../utils/linkUtils';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Users, 
  User,
  Loader2,
  Plus,
  Download,
  X
} from 'lucide-react';
import { messagingAPI } from '../lib/api';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

interface Conversation {
  id: number;
  type: 'group' | 'direct';
  title: string;
  class_level?: string;
  participants: User[];
  last_message?: {
    id: number;
    content: string;
    sender: {
      id: number;
      firstName: string;
      lastName: string;
    };
    created_at: string;
  };
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  content: string;
  sender: User;
  recipient?: User;
  message_type: string;
  file_path?: string;
  is_read: boolean;
  created_at: string;
}

interface NewMessagingSystemProps {
  currentUserId: number;
  currentUserRole: string;
}

const NewMessagingSystem: React.FC<NewMessagingSystemProps> = ({ 
  currentUserId, 
  currentUserRole 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Emojis populaires
  const popularEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
    '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👶',
    '👧', '🧒', '👦', '👩', '🧑', '👨', '👱', '👴',
    '👵', '🧓', '👲', '👳', '👮', '👷', '💂', '🕵️',
    '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓', '👨‍🎓',
    '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻',
    '👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨',
    '👩‍🚒', '👨‍🚒', '👩‍✈️', '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️',
    '👰', '🤵', '👸', '🤴', '🦸', '🦹', '🤶', '🎅',
    '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆',
    '💇', '🚶', '🏃', '💃', '🕺', '👯', '🧖', '🧗',
    '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊',
    '⛹️', '🏋️', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾',
    '🤹', '🧘', '🛀', '🛌', '👭', '👫', '👬', '💏',
    '💑', '👪', '🗣️', '👤', '👥', '👣', '🐵', '🐒',
    '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺',
    '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆',
    '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃',
    '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐',
    '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭',
    '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦔', '🦇',
    '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡',
    '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦',
    '🦅', '🦆', '🦢', '🦉', '🦚', '🦜', '🐸', '🐊',
    '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳',
    '🐋', '🐬', '🦈', '🐟', '🐠', '🐡', '🦀', '🦞',
    '🦐', '🦑', '🐙', '🦆', '🦢', '🦉', '🦚', '🦜',
    '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕',
    '🦖', '🐳', '🐋', '🐬', '🦈', '🐟', '🐠', '🐡',
    '🦀', '🦞', '🦐', '🦑', '🐙', '🦆', '🦢', '🦉',
    '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲',
    '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦈', '🐟',
    '🐠', '🐡', '🦀', '🦞', '🦐', '🦑', '🐙'
  ];

  // Charger les conversations
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await messagingAPI.getConversations(currentUserId);
      setConversations(response);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: number) => {
    try {
      const response = await messagingAPI.getMessages(conversationId);
      setMessages(response);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setError('Erreur lors du chargement des messages');
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: newMessage.trim(),
        messageType: 'text' as const
      };

      await messagingAPI.sendMessage(messageData);
      setNewMessage('');
      
      // Recharger les messages
      await loadMessages(currentConversation.id);
      await loadConversations(); // Mettre à jour la liste des conversations
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  // Sélectionner une conversation
  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conversation =>
    conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtenir le nom d'affichage d'une conversation
  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      // Supprimer le préfixe "Groupe" des noms de groupes
      return conversation.title.replace(/^Groupe\s+/i, '');
    } else {
      // Pour les conversations directes, afficher le nom de l'autre participant
      const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
      return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : conversation.title;
    }
  };

  // Obtenir l'avatar d'une conversation
  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
      );
    } else {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      );
    }
  };

  // Ajouter un emoji
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Gérer l'upload de fichier
  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await messagingAPI.uploadFile(formData);
      
      if (currentConversation) {
        const messageData = {
          conversationId: currentConversation.id,
          senderId: currentUserId,
          content: `Fichier: ${response.fileName}`,
          messageType: 'file' as const
        };

        await messagingAPI.sendMessage(messageData);
        await loadMessages(currentConversation.id);
        await loadConversations();
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Erreur lors de l\'upload du fichier');
    }
  };

  // Télécharger un fichier
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const response = await messagingAPI.downloadFile(filePath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setError('Erreur lors du téléchargement du fichier');
    }
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations();
  }, [currentUserId]);

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white/5 border-r border-white/10 flex flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-blue-400" />
              Messages
            </h2>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 hover:bg-white/10 cursor-pointer rounded-xl transition-all duration-300 ${
                    currentConversation?.id === conversation.id
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getConversationAvatar(conversation)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {getConversationDisplayName(conversation)}
                      </p>
                      {conversation.last_message?.content && (
                        <p className="text-xs text-gray-400 truncate">
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <div className="flex items-center space-x-3">
                {getConversationAvatar(currentConversation)}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {getConversationDisplayName(currentConversation)}
                  </h3>
                  {currentConversation.type === 'group' && currentConversation.class_level && (
                    <p className="text-sm text-gray-400">{currentConversation.class_level}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender.id === currentUserId
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    {message.sender.id !== currentUserId && (
                      <p className="text-xs text-gray-400 mb-1">
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
                    {message.file_path && (
                      <div className="mt-2">
                        <button
                          onClick={() => downloadFile(message.file_path!, 'fichier')}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-xs">Télécharger le fichier</span>
                        </button>
                      </div>
                    )}
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
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/20 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-8 gap-1">
                        {popularEmojis.slice(0, 64).map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
              <p className="text-gray-400">
                {currentUserRole === 'admin' 
                  ? 'Choisissez un groupe ou un parent pour commencer à discuter'
                  : 'Choisissez une conversation pour commencer à discuter'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Erreur</h3>
              <button
                onClick={() => setError(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewMessagingSystem;


