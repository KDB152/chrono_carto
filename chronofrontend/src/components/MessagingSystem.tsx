'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messagingAPI } from '../lib/api';
import { TextWithLinks } from '../utils/linkUtils';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Users,
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
  Upload,
  Save,
  Edit,
  RefreshCw
} from 'lucide-react';
import UserAvatar from './UserAvatar';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  childName?: string; // Nom de l'enfant pour les parents
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  is_read: boolean;
  file_path?: string;
  created_at: string;
  sender?: User;
}

interface Conversation {
  id: number;
  participant1_id: number;
  participant2_id: number;
  title?: string;
  type: string;
  last_message_id?: number;
  created_at: string;
  updated_at: string;
  participant1?: User;
  participant2?: User;
  lastMessage?: Message;
}

interface MessagingSystemProps {
  currentUserId: number;
  currentUserRole: string;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ currentUserId, currentUserRole }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la gestion admin
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [editingConversation, setEditingConversation] = useState<number | null>(null);
  const [editingConversationTitle, setEditingConversationTitle] = useState('');

  // Fonction pour vérifier si un message peut être modifié/supprimé (30 minutes max pour étudiants/parents)
  const canEditOrDeleteMessage = (message: Message): boolean => {
    // Les admins peuvent toujours modifier/supprimer
    if (currentUserRole === 'admin') {
      return true;
    }
    
    // Pour les étudiants et parents, vérifier si moins de 30 minutes se sont écoulées
    if (currentUserRole === 'student' || currentUserRole === 'parent') {
      const messageTime = new Date(message.created_at).getTime();
      const currentTime = new Date().getTime();
      const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutes en millisecondes
      
      return (currentTime - messageTime) < thirtyMinutesInMs;
    }
    
    // Par défaut, ne pas permettre la modification/suppression
    return false;
  };

  // Fonction pour vérifier si un message peut être édité (exclut les fichiers)
  const canEditMessage = (message: Message): boolean => {
    // Les messages de type fichier ne peuvent jamais être édités
    if (message.message_type === 'file' || message.file_path) {
      return false;
    }
    
    // Sinon, utiliser la même logique que canEditOrDeleteMessage
    return canEditOrDeleteMessage(message);
  };

  // Emojis corrigés et bien organisés
  const popularEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👻', '🤡', '👹',
    '👺', '💀', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼',
    '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙', '💜',
    '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️',
    '💣', '💬', '👁️', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️',
    '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙'
  ];

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
  }, [currentUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showEmojiPicker && !target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Load conversations for current user
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await messagingAPI.getConversations(currentUserId);
      
      // Enhance conversations with user information and last message
      const enhancedConversations = await Promise.all(
        data.map(async (conversation) => {
          try {
            // Get the other participant
            const otherUserId = conversation.participant1_id === currentUserId ? 
              conversation.participant2_id : conversation.participant1_id;
            
            // Get user info from available users or fetch it
            let otherUser = availableUsers.find(user => user.id === otherUserId);
            if (!otherUser) {
              // If not in available users, create a basic user object
              otherUser = {
                id: otherUserId,
                firstName: `Utilisateur ${otherUserId}`,
                lastName: '',
                email: '',
                role: 'user'
              };
            } else {
              // Map camelCase to snake_case for consistency
              otherUser = {
                ...otherUser,
                firstName: otherUser.firstName || `Utilisateur ${otherUserId}`,
                lastName: otherUser.lastName || ''
              };
            }

            // Si c'est un parent, récupérer le nom de l'enfant si pas déjà fait
            if (otherUser.role === 'parent' && !otherUser.childName) {
              try {
                const childInfo = await getChildInfoForParent(otherUser.id);
                if (childInfo) {
                  otherUser.childName = childInfo;
                }
              } catch (error) {
                console.log('Erreur lors de la récupération de l\'enfant pour le parent:', otherUser.id, error);
              }
            }

            // Get last message if conversation has messages
            let lastMessage = null;
            if (conversation.last_message_id) {
              try {
                const messages = await messagingAPI.getMessages(conversation.id);
                if (messages.length > 0) {
                  lastMessage = messages[messages.length - 1];
                }
              } catch (error) {
                console.error('Error loading last message:', error);
              }
            }

            return {
              ...conversation,
              participant1: conversation.participant1_id === currentUserId ? 
                { id: currentUserId, firstName: 'Vous', lastName: '', email: '', role: currentUserRole } : otherUser,
              participant2: conversation.participant2_id === currentUserId ? 
                { id: currentUserId, firstName: 'Vous', lastName: '', email: '', role: currentUserRole } : otherUser,
              lastMessage
            };
          } catch (error) {
            console.error('Error enhancing conversation:', error);
            return conversation;
          }
        })
      );
      
      setConversations(enhancedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Load available users for new conversations
  const loadAvailableUsers = async () => {
    try {
      setIsLoading(true);
      const data = await messagingAPI.getAvailableRecipients(currentUserId);
      
      // Map camelCase to snake_case for consistency and add child info for parents
      const mappedUsers = await Promise.all(data.map(async (user: any) => {
        const mappedUser = {
          ...user,
          firstName: user.firstName || 'Utilisateur',
          lastName: user.lastName || ''
        };

        // Si c'est un parent, récupérer le nom de l'enfant
        if (user.role === 'parent') {
          try {
            const childInfo = await getChildInfoForParent(user.id);
            if (childInfo) {
              mappedUser.childName = childInfo;
            }
          } catch (error) {
            console.log('Erreur lors de la récupération de l\'enfant pour le parent:', user.id, error);
          }
        }

        return mappedUser;
      }));
      
      setAvailableUsers(mappedUsers);
      console.log('Available users loaded:', mappedUsers.length);
    } catch (error) {
      console.error('Error loading available users:', error);
      setError('Erreur lors du chargement des utilisateurs disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer le nom de l'enfant d'un parent
  const getChildInfoForParent = async (userId: number): Promise<string | null> => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      if (!token) return null;

      // D'abord, récupérer l'ID du parent à partir de l'ID utilisateur
      const parentResponse = await fetch(`${API_BASE}/parents/by-user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!parentResponse.ok) {
        console.log(`Parent non trouvé pour l'utilisateur ${userId}: ${parentResponse.status}`);
        return null;
      }

      const parentData = await parentResponse.json();
      if (!parentData || !parentData.id) {
        console.log(`Aucun parent trouvé pour l'utilisateur ${userId}`);
        return null;
      }

      // Maintenant récupérer l'enfant avec l'ID parent
      const childResponse = await fetch(`${API_BASE}/parents/${parentData.id}/child`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (childResponse.ok) {
        // Vérifier si la réponse est vide ou null
        const text = await childResponse.text();
        if (!text || text.trim() === '') {
          console.log(`Aucun enfant trouvé pour le parent ${parentData.id}`);
          return null;
        }

        const childData = JSON.parse(text);
        if (childData && childData.firstName) {
          return `${childData.firstName} ${childData.lastName || ''}`.trim();
        }
      } else {
        console.log(`Erreur API pour le parent ${parentData.id}: ${childResponse.status} ${childResponse.statusText}`);
      }
    } catch (error) {
      console.log('Erreur lors de la récupération de l\'enfant:', error);
    }
    return null;
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: number) => {
    try {
      setIsLoading(true);
      const data = await messagingAPI.getMessages(conversationId);
      setMessages(data);
      return data;
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Erreur lors du chargement des messages');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrer un appel vidéo pour la conversation actuelle
  const startVideoCall = async () => {
    if (!currentConversation) return;

    try {
      // Nom de salle déterministe basé sur l'ID de la conversation
      const roomName = `ChronoCarto-Conversation-${currentConversation.id}`;
      const callLink = `https://meet.jit.si/${roomName}`;

      // Ouvrir l'appel dans un nouvel onglet (meet.jit.si bloque l'intégration en iframe)
      if (typeof window !== 'undefined') {
        window.open(callLink, '_blank', 'noopener,noreferrer');
      }

      // Envoyer un message avec le lien d'appel pour que l'autre participant puisse rejoindre
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: `📹 Appel vidéo démarré. Cliquez ici pour rejoindre : ${callLink}`,
        messageType: 'text' as const,
      };

      await messagingAPI.sendMessage(messageData);
      // Mettre à jour localement la liste des messages sans bloquer l'ouverture de la fenêtre vidéo
      await loadMessages(currentConversation.id);
      loadConversations();
    } catch (err) {
      console.error('Erreur lors du démarrage de l’appel vidéo:', err);
      setError('Erreur lors du démarrage de l’appel vidéo');
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: newMessage.trim(),
        messageType: 'text' as const
      };

      const sentMessage = await messagingAPI.sendMessage(messageData);
      
      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  // Send a file message
  const sendFileMessage = async (file: File) => {
    if (!currentConversation) return;

    try {
      setIsLoading(true);
      
      // Upload the file first
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResult = await messagingAPI.uploadFile(formData);
      console.log('File uploaded:', uploadResult);
      
      // Détecter si c'est une image
      const isImage = file.type.startsWith('image/');
      const messageType = isImage ? 'image' : 'file';
      
      // Send message with file info
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: uploadResult.fileName, // Use original filename as content
        messageType: messageType as 'image' | 'file',
        filePath: uploadResult.filePath,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType
      };

      const sentMessage = await messagingAPI.sendMessage(messageData);
      
      // Add the new message to the list
      setMessages(prev => [...prev, sentMessage]);
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error: any) {
      console.error('Error sending file:', error);
      const errorMessage = error.message || 'Erreur lors de l\'envoi du fichier';
      setError(errorMessage);
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Download a file
  const downloadFile = async (messageId: number, fileName: string) => {
    try {
      setIsLoading(true);
      console.log(`📥 Téléchargement du fichier: ${fileName} (messageId: ${messageId})`);
      
      // Vérifier le token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      console.log(`🔑 Token trouvé: ${token.substring(0, 20)}...`);
      
      const response = await messagingAPI.downloadFile(messageId);
      console.log(`📡 Réponse reçue:`, response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur de téléchargement:', response.status, response.statusText, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      console.log(`📄 Type de contenu: ${contentType}`);
      console.log(`📦 Taille du fichier: ${contentLength} bytes`);
      
      const blob = await response.blob();
      console.log(`📦 Blob créé: ${blob.size} bytes, type: ${blob.type}`);
      
      if (blob.size === 0) {
        throw new Error('Le fichier téléchargé est vide');
      }
      
      // Créer l'URL et télécharger
      const url = window.URL.createObjectURL(blob);
      console.log(`🔗 URL créée: ${url}`);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      
      console.log(`🖱️ Déclenchement du téléchargement...`);
      a.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log(`🧹 Nettoyage effectué`);
      }, 100);
      
      console.log(`✅ Fichier téléchargé avec succès: ${fileName}`);
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      setError(`Erreur lors du téléchargement du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Create or get conversation with a user
  const startConversation = async (user: User) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting conversation with user:', user);
      const response = await messagingAPI.createOrGetConversation(currentUserId, user.id);
      console.log('Conversation created/retrieved:', response);
      console.log('Response structure:', JSON.stringify(response, null, 2));
      
      const conversation = response.conversation;
      console.log('Extracted conversation:', conversation);
      console.log('Conversation ID:', conversation?.id);
      
      // Add user info to conversation
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
      
      // Load messages for this conversation
      await loadMessages(conversation.id);
      
      // Refresh conversations list
      await loadConversations();
      
      console.log('Conversation started successfully');
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Erreur lors de la création de la conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Select a conversation
  const selectConversation = async (conversation: Conversation) => {
    try {
      // Get user info for the other participant
      const otherUserId = conversation.participant1_id === currentUserId ? 
        conversation.participant2_id : conversation.participant1_id;
      
      const otherUser = availableUsers.find(user => user.id === otherUserId);
      
      const conversationWithUsers = {
        ...conversation,
        participant1: conversation.participant1_id === currentUserId ? 
          { id: currentUserId, first_name: 'Vous', last_name: '', email: '', role: currentUserRole } : otherUser,
        participant2: conversation.participant2_id === currentUserId ? 
          { id: currentUserId, first_name: 'Vous', last_name: '', email: '', role: currentUserRole } : otherUser
      };
      
      setCurrentConversation(conversationWithUsers);
      const messages = await loadMessages(conversation.id);
      
      // Mark unread messages as read
      const unreadMessages = messages.filter(msg => 
        !msg.is_read && msg.sender_id !== currentUserId
      );
      
      for (const message of unreadMessages) {
        await markMessageAsRead(message.id);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
      setError('Erreur lors de la sélection de la conversation');
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // Get conversation title
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) {
      // Supprimer les préfixes "Groupe" et "Conversation avec"
      return conversation.title
        .replace(/^Groupe\s+/i, '')
        .replace(/^Conversation avec\s+/i, '');
    }
    
    const otherUserId = conversation.participant1_id === currentUserId ? 
      conversation.participant2_id : conversation.participant1_id;
    
    const otherUser = availableUsers.find(user => user.id === otherUserId);
    
    if (otherUser) {
      // Si c'est un parent et qu'on a le nom de l'enfant, l'afficher
      if (otherUser.role === 'parent' && otherUser.childName) {
        return `${otherUser.childName} (${otherUser.firstName} ${otherUser.lastName})`;
      }
      return `${otherUser.firstName} ${otherUser.lastName}`;
    }
    
    return 'Conversation';
  };

  // Get other participant in current conversation
  const getOtherParticipant = () => {
    if (!currentConversation) return null;
    
    return currentConversation.participant1_id === currentUserId ? 
      currentConversation.participant2 : currentConversation.participant1;
  };

  // Fonctions pour la gestion des messages (tous les utilisateurs peuvent modifier/supprimer leurs propres messages)
  const handleEditMessage = (messageId: number, currentContent: string) => {
    setEditingMessage(messageId);
    setEditingMessageContent(currentContent);
  };

  const handleSaveMessage = async (messageId: number) => {
    try {
      setIsLoading(true);
      await messagingAPI.updateMessage(messageId, editingMessageContent);
      
      // Mettre à jour le message dans l'état local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: editingMessageContent, updated_at: new Date().toISOString() }
          : msg
      ));
      
      setEditingMessage(null);
      setEditingMessageContent('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      setError('Erreur lors de la mise à jour du message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    
    try {
      setIsLoading(true);
      await messagingAPI.deleteMessage(messageId);
      
      // Supprimer le message de l'état local
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      setError('Erreur lors de la suppression du message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditConversation = (conversationId: number, currentTitle: string) => {
    if (currentUserRole !== 'admin') return;
    setEditingConversation(conversationId);
    setEditingConversationTitle(currentTitle);
  };

  const handleSaveConversation = async (conversationId: number) => {
    if (currentUserRole !== 'admin') return;
    
    try {
      setIsLoading(true);
      await messagingAPI.updateConversation(conversationId, editingConversationTitle);
      
      // Mettre à jour la conversation dans l'état local
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title: editingConversationTitle, updated_at: new Date().toISOString() }
          : conv
      ));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title: editingConversationTitle } : null);
      }
      
      setEditingConversation(null);
      setEditingConversationTitle('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la conversation:', error);
      setError('Erreur lors de la mise à jour de la conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (currentUserRole !== 'admin') return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ? Tous les messages seront supprimés.')) return;
    
    try {
      setIsLoading(true);
      await messagingAPI.deleteConversation(conversationId);
      
      // Supprimer la conversation de l'état local
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      setError('Erreur lors de la suppression de la conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (50MB = 50 * 1024 * 1024 bytes)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Le fichier est trop volumineux. La taille maximale est de 50 MB.');
        return;
      }
      
      // Send the file immediately
      await sendFileMessage(file);
      
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
      setError(null);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !currentConversation) return;

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('conversationId', currentConversation.id.toString());
      formData.append('senderId', currentUserId.toString());
      formData.append('messageType', 'file');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file
      const uploadedMessage = await messagingAPI.uploadFile(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add the new message to the list
      setMessages(prev => [...prev, uploadedMessage]);
      setSelectedFile(null);
      setUploadProgress(0);
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Erreur lors de l\'envoi du fichier');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: number) => {
    try {
      await messagingAPI.markMessageAsRead(messageId);
      // Update local message state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Check if conversation has unread messages
  const hasUnreadMessages = (conversation: Conversation) => {
    return conversation.lastMessage && !conversation.lastMessage.is_read && 
           conversation.lastMessage.sender_id !== currentUserId;
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white/5 border-r border-white/10 flex flex-col backdrop-blur-sm">
        {/* Header avec gradient */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-blue-400" />
              Messages
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search améliorée */}
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

        {/* Conversations List améliorée */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Aucune conversation</p>
              <p className="text-sm">Commencez une nouvelle conversation</p>
            </div>
          ) : (
            conversations
              .filter(conv => {
                const title = getConversationTitle(conv).toLowerCase();
                return title.includes(searchQuery.toLowerCase());
              })
              .map(conversation => (
                <div
                  key={conversation.id}
                  className={`group p-4 border-b border-white/5 hover:bg-gradient-to-r hover:from-white/10 hover:to-blue-500/10 transition-all duration-300 ${
                    currentConversation?.id === conversation.id ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="cursor-pointer hover:scale-105 transition-all duration-300"
                      onClick={() => selectConversation(conversation)}
                    >
                      <UserAvatar
                        userId={conversation.participant1_id === currentUserId ? conversation.participant2_id : conversation.participant1_id}
                        firstName={availableUsers.find(user => user.id === (conversation.participant1_id === currentUserId ? conversation.participant2_id : conversation.participant1_id))?.firstName}
                        lastName={availableUsers.find(user => user.id === (conversation.participant1_id === currentUserId ? conversation.participant2_id : conversation.participant1_id))?.lastName}
                        size="lg"
                        className="shadow-lg hover:shadow-blue-500/25"
                      />
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => selectConversation(conversation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-semibold truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          {hasUnreadMessages(conversation) && (
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 animate-pulse shadow-lg"></div>
                          )}
                        </div>
                      </div>
                      {conversation.lastMessage?.content && (
                        <p className="text-gray-300 text-sm truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-blue-400 font-medium">
                          {conversation.type === 'direct' ? 
                            (() => {
                              const otherUserId = conversation.participant1_id === currentUserId ? 
                                conversation.participant2_id : conversation.participant1_id;
                              const otherUser = availableUsers.find(user => user.id === otherUserId);
                              if (otherUser?.role === 'parent' && otherUser?.childName) {
                                return otherUser.childName;
                              }
                              return 'Conversation privée';
                            })() 
                            : 'Groupe'
                          }
                        </span>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(conversation.lastMessage.created_at).toLocaleString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header amélioré */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCurrentConversation(null)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    {currentConversation.type === 'group' ? (
                      <Users className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold text-lg">
                        {getConversationTitle(currentConversation)}
                      </h3>
                    </div>
                    <p className="text-blue-300 text-sm capitalize">
                      {currentConversation.type === 'group' ? 'Groupe' : getOtherParticipant()?.role}
                    </p>
                  </div>
                </div>

                {/* Actions d'appel (audio / vidéo) */}
                {currentUserRole === 'admin' && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={startVideoCall}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 shadow-lg"
                    title="Démarrer un appel vidéo (écran partagé, chat, enregistrement via l'interface Jitsi)"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </div>
                )}
              </div>
            </div>

            {/* Messages Area améliorée */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-white/5 custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium mb-2">Aucun message</p>
                    <p className="text-sm">Commencez la conversation</p>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex items-end space-x-2 ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar pour les messages des autres utilisateurs */}
                    {message.sender_id !== currentUserId && (
                      <UserAvatar
                        userId={message.sender_id}
                        firstName={message.sender?.firstName}
                        lastName={message.sender?.lastName}
                        size="sm"
                        className="flex-shrink-0"
                      />
                    )}
                    
                    <div
                      className={`group max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                        message.sender_id === currentUserId
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      {/* Afficher le nom de l'expéditeur pour les messages des autres utilisateurs */}
                      {console.log('Message debug:', { 
                        messageId: message.id, 
                        senderId: message.sender_id, 
                        currentUserId, 
                        sender: message.sender,
                        isNotCurrentUser: message.sender_id !== currentUserId,
                        hasSender: !!message.sender
                      })}
                      {message.sender_id !== currentUserId && message.sender && (
                        <p className="text-xs text-gray-300 mb-1 font-medium">
                          {message.sender.firstName} {message.sender.lastName}
                        </p>
                      )}
                      {editingMessage === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingMessageContent}
                            onChange={(e) => setEditingMessageContent(e.target.value)}
                            className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 resize-none"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveMessage(message.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center space-x-1"
                              disabled={isLoading}
                            >
                              <Save className="w-4 h-4" />
                              <span>Sauvegarder</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingMessage(null);
                                setEditingMessageContent('');
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center space-x-1"
                            >
                              <X className="w-4 h-4" />
                              <span>Annuler</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {message.message_type === 'file' && message.file_path ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 max-w-xs">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {message.content || 'Fichier joint'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cliquez pour télécharger
                                  </p>
                                </div>
                                <button
                                  onClick={() => downloadFile(message.id, message.content || 'fichier')}
                                  className="flex-shrink-0 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Télécharger le fichier"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm leading-relaxed">
                              <TextWithLinks 
                                text={message.content} 
                                className="text-sm leading-relaxed"
                                linkClassName="underline hover:no-underline transition-all"
                              />
                            </div>
                          )}
                          
                          {/* Boutons d'édition/suppression pour les messages de l'utilisateur connecté */}
                          {message.sender_id === currentUserId && (canEditMessage(message) || canEditOrDeleteMessage(message)) && (
                            <div className="flex space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {canEditMessage(message) && (
                                <button
                                  onClick={() => handleEditMessage(message.id, message.content)}
                                  className="p-1 hover:bg-white/20 rounded transition-all"
                                  title="Modifier le message"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              {canEditOrDeleteMessage(message) && (
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="p-1 hover:bg-red-500/20 rounded transition-all text-red-400"
                                  title="Supprimer le message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                          
                        </div>
                      )}
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span>{new Date(message.created_at).toLocaleString('fr-FR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                        {message.sender_id === currentUserId && (
                          <CheckCircle className={`w-3 h-3 ${message.is_read ? 'text-green-300' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input amélioré */}
            <div className="mt-36 p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-blue-500/5 backdrop-blur-sm">
              {/* File Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Envoi en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Selected File Display amélioré */}
              {selectedFile && (
                <div className="mb-3 p-4 bg-gradient-to-r from-white/10 to-blue-500/10 rounded-xl border border-white/20 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <span className="text-sm text-white font-medium block">{selectedFile.name}</span>
                        <span className="text-xs text-gray-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-110"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  title="Ajouter une pièce jointe (max 25 MB)"
                >
                  <Paperclip className="w-5 h-5 text-blue-400" />
                </button>
                
                <div className="relative emoji-picker-container">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    title="Ajouter un emoji"
                  >
                    <Smile className="w-5 h-5 text-yellow-400" />
                  </button>
                  
                  {/* Emoji Picker amélioré */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-3 bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-6 shadow-2xl z-50 max-w-[400px] min-w-[350px]">
                      <div className="text-white text-sm font-medium mb-4 text-center">
                        Choisissez un emoji
                      </div>
                      <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                        {popularEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="w-10 h-10 flex items-center justify-center hover:bg-gray-700/80 rounded-xl text-2xl transition-all duration-300 bg-gray-800/50 hover:scale-125 hover:shadow-lg border border-gray-700/30"
                            title={`Emoji ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-600/50 text-xs text-gray-400 text-center">
                        Cliquez sur un emoji pour l'ajouter à votre message
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez votre message..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300 backdrop-blur-sm"
                    rows={1}
                    style={{ 
                      minHeight: '48px',
                      maxHeight: '120px'
                    }}
                  />
                </div>
                
                <button
                  onClick={selectedFile ? handleFileUpload : sendMessage}
                  disabled={!newMessage.trim() && !selectedFile}
                  className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:hover:scale-100"
                >
                  {selectedFile ? (
                    <Upload className="w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : showNewConversation ? (
          <NewConversationView
            availableUsers={availableUsers}
            onSelectUser={startConversation}
            onCancel={() => {
              setShowNewConversation(false);
              setSelectedUser(null);
            }}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gradient-to-br from-blue-900/10 to-purple-900/10">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <MessageSquare className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-400 text-lg">Ou commencez une nouvelle conversation</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display amélioré */}
      {error && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-500/30 backdrop-blur-xl z-50 max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500/30 rounded-full flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 hover:bg-red-700/50 rounded-lg px-2 py-1 transition-all duration-300 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Style pour la scrollbar personnalisée */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

// New Conversation Component amélioré
interface NewConversationViewProps {
  availableUsers: User[];
  onSelectUser: (user: User) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const NewConversationView: React.FC<NewConversationViewProps> = ({
  availableUsers,
  onSelectUser,
  onCancel,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = availableUsers.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-900/10 to-purple-900/10">
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Nouvelle conversation
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="flex items-center space-x-4 p-4 hover:bg-gradient-to-r hover:from-white/10 hover:to-blue-500/10 rounded-2xl cursor-pointer transition-all duration-300 border border-white/10 hover:border-blue-500/30 hover:shadow-lg hover:scale-[1.02]"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg">
                    {user.firstName} {user.lastName}
                  </h4>
                  <p className="text-gray-300 text-sm">{user.email}</p>
                  <p className="text-blue-400 text-xs font-medium capitalize mt-1 bg-blue-500/20 px-2 py-1 rounded-lg inline-block">
                    {user.role}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;


