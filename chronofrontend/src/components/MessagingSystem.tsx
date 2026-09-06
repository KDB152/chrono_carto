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
  childName?: string;
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
  updated_at?: string;
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

const MessagingSystem: React.FC<MessagingSystemProps> = ({
  currentUserId,
  currentUserRole
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
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

  // Etats pour la gestion admin
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [editingConversation, setEditingConversation] =
    useState<number | null>(null);
  const [editingConversationTitle, setEditingConversationTitle] =
    useState('');

  // Verifier si un message peut etre modifie ou supprime
  const canEditOrDeleteMessage = (message: Message): boolean => {
    // Les admins peuvent toujours modifier ou supprimer
    if (currentUserRole === 'admin') {
      return true;
    }

    // Pour les etudiants et parents, limite de 30 minutes
    if (
      currentUserRole === 'student' ||
      currentUserRole === 'parent'
    ) {
      const messageTime = new Date(message.created_at).getTime();
      const currentTime = new Date().getTime();
      const thirtyMinutesInMs = 30 * 60 * 1000;

      return currentTime - messageTime < thirtyMinutesInMs;
    }

    return false;
  };

  // Verifier si un message peut etre edite
  const canEditMessage = (message: Message): boolean => {
    if (message.message_type === 'file' || message.file_path) {
      return false;
    }

    return canEditOrDeleteMessage(message);
  };

  const popularEmojis: string[] = [
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '??',
    '?',
    '?',
    '?',
    '??',
    '??'
  ];

  // Charger les conversations au montage du composant
  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
  }, [currentUserId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer le selecteur d'emojis en cliquant a l'exterieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        showEmojiPicker &&
        !target.closest('.emoji-picker-container')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Charger les conversations
  const loadConversations = async () => {
    try {
      setIsLoading(true);

      const data = await messagingAPI.getConversations(currentUserId);

      const enhancedConversations = await Promise.all(
        data.map(async (conversation) => {
          try {
            const otherUserId =
              conversation.participant1_id === currentUserId
                ? conversation.participant2_id
                : conversation.participant1_id;

            let otherUser = availableUsers.find(
              (user) => user.id === otherUserId
            );

            if (!otherUser) {
              otherUser = {
                id: otherUserId,
                firstName: `Utilisateur ${otherUserId}`,
                lastName: '',
                email: '',
                role: 'user'
              };
            } else {
              otherUser = {
                ...otherUser,
                firstName:
                  otherUser.firstName ||
                  `Utilisateur ${otherUserId}`,
                lastName: otherUser.lastName || ''
              };
            }

            // Si c'est un parent, recuperer le nom de l'enfant
            if (otherUser.role === 'parent' && !otherUser.childName) {
              try {
                const childInfo = await getChildInfoForParent(
                  otherUser.id
                );

                if (childInfo) {
                  otherUser.childName = childInfo;
                }
              } catch (error) {
                console.log(
                  'Erreur lors de la recuperation de l enfant pour le parent:',
                  otherUser.id,
                  error
                );
              }
            }

            let lastMessage: Message | null = null;

            if (conversation.last_message_id) {
              try {
                const conversationMessages =
                  await messagingAPI.getMessages(conversation.id);

                if (conversationMessages.length > 0) {
                  lastMessage =
                    conversationMessages[
                      conversationMessages.length - 1
                    ];
                }
              } catch (error) {
                console.error(
                  'Erreur lors du chargement du dernier message:',
                  error
                );
              }
            }

            return {
              ...conversation,
              participant1:
                conversation.participant1_id === currentUserId
                  ? {
                      id: currentUserId,
                      firstName: 'Vous',
                      lastName: '',
                      email: '',
                      role: currentUserRole
                    }
                  : otherUser,

              participant2:
                conversation.participant2_id === currentUserId
                  ? {
                      id: currentUserId,
                      firstName: 'Vous',
                      lastName: '',
                      email: '',
                      role: currentUserRole
                    }
                  : otherUser,

              lastMessage
            };
          } catch (error) {
            console.error(
              'Erreur lors de la preparation de la conversation:',
              error
            );

            return conversation;
          }
        })
      );

      setConversations(enhancedConversations);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des conversations:',
        error
      );

      setError(
        'Erreur lors du chargement des conversations'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les utilisateurs disponibles
  const loadAvailableUsers = async () => {
    try {
      setIsLoading(true);

      const data =
        await messagingAPI.getAvailableRecipients(currentUserId);

      const mappedUsers = await Promise.all(
        data.map(async (user: any) => {
          const mappedUser = {
            ...user,
            firstName: user.firstName || 'Utilisateur',
            lastName: user.lastName || ''
          };

          // Si c'est un parent, recuperer le nom de l'enfant
          if (user.role === 'parent') {
            try {
              const childInfo =
                await getChildInfoForParent(user.id);

              if (childInfo) {
                mappedUser.childName = childInfo;
              }
            } catch (error) {
              console.log(
                'Erreur lors de la recuperation de l enfant:',
                user.id,
                error
              );
            }
          }

          return mappedUser;
        })
      );

      setAvailableUsers(mappedUsers);

      console.log(
        'Utilisateurs disponibles charges:',
        mappedUsers.length
      );
    } catch (error) {
      console.error(
        'Erreur lors du chargement des utilisateurs disponibles:',
        error
      );

      setError(
        'Erreur lors du chargement des utilisateurs disponibles'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Recuperer le nom de l'enfant d'un parent
  const getChildInfoForParent = async (
    userId: number
  ): Promise<string | null> => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:3001';

      const token = localStorage.getItem('token');

      if (!token) {
        return null;
      }

      const parentResponse = await fetch(
        `${API_BASE}/parents/by-user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!parentResponse.ok) {
        console.log(
          `Parent non trouve pour l utilisateur ${userId}: ${parentResponse.status}`
        );

        return null;
      }

      const parentData = await parentResponse.json();

      if (!parentData || !parentData.id) {
        console.log(
          `Aucun parent trouve pour l utilisateur ${userId}`
        );

        return null;
      }

      const childResponse = await fetch(
        `${API_BASE}/parents/${parentData.id}/child`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (childResponse.ok) {
        const text = await childResponse.text();

        if (!text || text.trim() === '') {
          console.log(
            `Aucun enfant trouve pour le parent ${parentData.id}`
          );

          return null;
        }

        const childData = JSON.parse(text);

        if (childData && childData.firstName) {
          return `${childData.firstName} ${
            childData.lastName || ''
          }`.trim();
        }
      } else {
        console.log(
          `Erreur API pour le parent ${parentData.id}: ${childResponse.status} ${childResponse.statusText}`
        );
      }
    } catch (error) {
      console.log(
        'Erreur lors de la recuperation de l enfant:',
        error
      );
    }

    return null;
  };

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: number) => {
    try {
      setIsLoading(true);

      const data =
        await messagingAPI.getMessages(conversationId);

      setMessages(data);

      return data;
    } catch (error) {
      console.error(
        'Erreur lors du chargement des messages:',
        error
      );

      setError(
        'Erreur lors du chargement des messages'
      );

      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Demarrer un appel video
  const startVideoCall = async () => {
    if (!currentConversation) {
      return;
    }

    try {
      const roomName =
        `ChronoCarto-Conversation-${currentConversation.id}`;

      const callLink =
        `https://meet.jit.si/${roomName}`;

      if (typeof window !== 'undefined') {
        window.open(
          callLink,
          '_blank',
          'noopener,noreferrer'
        );
      }

      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content:
          `Appel video demarre. Cliquez ici pour rejoindre : ${callLink}`,
        messageType: 'text' as const
      };

      await messagingAPI.sendMessage(messageData);

      await loadMessages(currentConversation.id);
      loadConversations();
    } catch (error) {
      console.error(
        "Erreur lors du demarrage de l'appel video:",
        error
      );

      setError(
        "Erreur lors du demarrage de l'appel video"
      );
    }
  };

  // Envoyer un nouveau message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) {
      return;
    }

    try {
      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: newMessage.trim(),
        messageType: 'text' as const
      };

      const sentMessage =
        await messagingAPI.sendMessage(messageData);

      setMessages((prev) => [
        ...prev,
        sentMessage
      ]);

      setNewMessage('');

      loadConversations();
    } catch (error) {
      console.error(
        'Erreur lors de l envoi du message:',
        error
      );

      setError(
        'Erreur lors de l envoi du message'
      );
    }
  };

  // Envoyer un fichier
  const sendFileMessage = async (file: File) => {
    if (!currentConversation) {
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const uploadResult =
        await messagingAPI.uploadFile(formData);

      console.log(
        'Fichier charge:',
        uploadResult
      );

      const isImage =
        file.type.startsWith('image/');

      const messageType =
        isImage ? 'image' : 'file';

      const messageData = {
        conversationId: currentConversation.id,
        senderId: currentUserId,
        content: uploadResult.fileName,
        messageType:
          messageType as 'image' | 'file',
        filePath: uploadResult.filePath,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType
      };

      const sentMessage =
        await messagingAPI.sendMessage(messageData);

      setMessages((prev) => [
        ...prev,
        sentMessage
      ]);

      loadConversations();
    } catch (error: any) {
      console.error(
        'Erreur lors de l envoi du fichier:',
        error
      );

      const errorMessage =
        error.message ||
        'Erreur lors de l envoi du fichier';

      setError(errorMessage);

      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Telecharger un fichier
  const downloadFile = async (
    messageId: number,
    fileName: string
  ) => {
    try {
      setIsLoading(true);

      console.log(
        `Telechargement du fichier: ${fileName} (messageId: ${messageId})`
      );

      const token =
        localStorage.getItem('token');

      if (!token) {
        throw new Error(
          "Token d'authentification manquant"
        );
      }

      console.log(
        'Token trouve:',
        token.substring(0, 20) + '...'
      );

      const response =
        await messagingAPI.downloadFile(messageId);

      console.log(
        'Reponse recue:',
        response
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          'Erreur de telechargement:',
          response.status,
          response.statusText,
          errorText
        );

        throw new Error(
          `Erreur ${response.status}: ${errorText}`
        );
      }

      const contentType =
        response.headers.get('content-type');

      const contentLength =
        response.headers.get('content-length');

      console.log(
        'Type de contenu:',
        contentType
      );

      console.log(
        'Taille du fichier:',
        contentLength,
        'bytes'
      );

      const blob =
        await response.blob();

      console.log(
        'Blob cree:',
        blob.size,
        'bytes, type:',
        blob.type
      );

      if (blob.size === 0) {
        throw new Error(
          'Le fichier telecharge est vide'
        );
      }

      const url =
        window.URL.createObjectURL(blob);

      console.log(
        'URL creee:',
        url
      );

      const a =
        document.createElement('a');

      a.href = url;
      a.download = fileName;
      a.style.display = 'none';

      document.body.appendChild(a);

      console.log(
        'Declenchement du telechargement...'
      );

      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        console.log(
          'Nettoyage effectue'
        );
      }, 100);

      console.log(
        'Fichier telecharge avec succes:',
        fileName
      );
    } catch (error) {
      console.error(
        'Erreur lors du telechargement:',
        error
      );

      setError(
        `Erreur lors du telechargement du fichier: ${
          error instanceof Error
            ? error.message
            : 'Erreur inconnue'
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Creer ou recuperer une conversation
  const startConversation = async (
    user: User
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        'Demarrage de la conversation avec:',
        user
      );

      const response =
        await messagingAPI.createOrGetConversation(
          currentUserId,
          user.id
        );

      console.log(
        'Conversation creee ou recuperee:',
        response
      );

      const conversation =
        response.conversation;

      console.log(
        'Conversation extraite:',
        conversation
      );

      const conversationWithUsers = {
        ...conversation,

        participant1:
          conversation.participant1_id ===
          currentUserId
            ? {
                id: currentUserId,
                firstName: 'Vous',
                lastName: '',
                email: '',
                role: currentUserRole
              }
            : user,

        participant2:
          conversation.participant2_id ===
          currentUserId
            ? {
                id: currentUserId,
                firstName: 'Vous',
                lastName: '',
                email: '',
                role: currentUserRole
              }
            : user
      };

      setCurrentConversation(
        conversationWithUsers
      );

      setMessages([]);
      setShowNewConversation(false);
      setSelectedUser(null);

      await loadMessages(
        conversation.id
      );

      await loadConversations();

      console.log(
        'Conversation demarree avec succes'
      );
    } catch (error) {
      console.error(
        'Erreur lors de la creation de la conversation:',
        error
      );

      setError(
        'Erreur lors de la creation de la conversation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Selectionner une conversation
  const selectConversation = async (
    conversation: Conversation
  ) => {
    try {
      const otherUserId =
        conversation.participant1_id ===
        currentUserId
          ? conversation.participant2_id
          : conversation.participant1_id;

      const otherUser =
        availableUsers.find(
          (user) => user.id === otherUserId
        );

      const conversationWithUsers = {
        ...conversation,

        participant1:
          conversation.participant1_id ===
          currentUserId
            ? {
                id: currentUserId,
                firstName: 'Vous',
                lastName: '',
                email: '',
                role: currentUserRole
              }
            : otherUser,

        participant2:
          conversation.participant2_id ===
          currentUserId
            ? {
                id: currentUserId,
                firstName: 'Vous',
                lastName: '',
                email: '',
                role: currentUserRole
              }
            : otherUser
      };

      setCurrentConversation(
        conversationWithUsers
      );

      const loadedMessages =
        await loadMessages(
          conversation.id
        );

      const unreadMessages =
        loadedMessages.filter(
          (msg: Message) =>
            !msg.is_read &&
            msg.sender_id !== currentUserId
        );

      for (const message of unreadMessages) {
        await markMessageAsRead(
          message.id
        );
      }
    } catch (error) {
      console.error(
        'Erreur lors de la selection de la conversation:',
        error
      );

      setError(
        'Erreur lors de la selection de la conversation'
      );
    }
  };

  // Scroll automatique
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Obtenir le titre de la conversation
  const getConversationTitle = (
    conversation: Conversation
  ) => {
    if (conversation.title) {
      return conversation.title
        .replace(
          /^Groupe\s+/i,
          ''
        )
        .replace(
          /^Conversation avec\s+/i,
          ''
        );
    }

    const otherUserId =
      conversation.participant1_id ===
      currentUserId
        ? conversation.participant2_id
        : conversation.participant1_id;

    const otherUser =
      availableUsers.find(
        (user) => user.id === otherUserId
      );

    if (otherUser) {
      if (
        otherUser.role === 'parent' &&
        otherUser.childName
      ) {
        return `${otherUser.childName} (${otherUser.firstName} ${otherUser.lastName})`;
      }

      return `${otherUser.firstName} ${otherUser.lastName}`;
    }

    return 'Conversation';
  };

  // Obtenir l'autre participant
  const getOtherParticipant = () => {
    if (!currentConversation) {
      return null;
    }

    return currentConversation.participant1_id ===
      currentUserId
      ? currentConversation.participant2
      : currentConversation.participant1;
  };

  // Modifier un message
  const handleEditMessage = (
    messageId: number,
    currentContent: string
  ) => {
    setEditingMessage(messageId);
    setEditingMessageContent(
      currentContent
    );
  };

  // Sauvegarder un message
  const handleSaveMessage = async (
    messageId: number
  ) => {
    try {
      setIsLoading(true);

      await messagingAPI.updateMessage(
        messageId,
        editingMessageContent
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                content:
                  editingMessageContent,
                updated_at:
                  new Date().toISOString()
              }
            : msg
        )
      );

      setEditingMessage(null);
      setEditingMessageContent('');
    } catch (error) {
      console.error(
        'Erreur lors de la mise a jour du message:',
        error
      );

      setError(
        'Erreur lors de la mise a jour du message'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un message
  const handleDeleteMessage = async (
    messageId: number
  ) => {
    if (
      !window.confirm(
        'Etes-vous sur de vouloir supprimer ce message ?'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      await messagingAPI.deleteMessage(
        messageId
      );

      setMessages((prev) =>
        prev.filter(
          (msg) => msg.id !== messageId
        )
      );
    } catch (error) {
      console.error(
        'Erreur lors de la suppression du message:',
        error
      );

      setError(
        'Erreur lors de la suppression du message'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier une conversation
  const handleEditConversation = (
    conversationId: number,
    currentTitle: string
  ) => {
    if (currentUserRole !== 'admin') {
      return;
    }

    setEditingConversation(
      conversationId
    );

    setEditingConversationTitle(
      currentTitle
    );
  };

  // Sauvegarder une conversation
  const handleSaveConversation = async (
    conversationId: number
  ) => {
    if (currentUserRole !== 'admin') {
      return;
    }

    try {
      setIsLoading(true);

      await messagingAPI.updateConversation(
        conversationId,
        editingConversationTitle
      );

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                title:
                  editingConversationTitle,
                updated_at:
                  new Date().toISOString()
              }
            : conv
        )
      );

      if (
        currentConversation?.id ===
        conversationId
      ) {
        setCurrentConversation(
          (prev) =>
            prev
              ? {
                  ...prev,
                  title:
                    editingConversationTitle
                }
              : null
        );
      }

      setEditingConversation(null);
      setEditingConversationTitle('');
    } catch (error) {
      console.error(
        'Erreur lors de la mise a jour de la conversation:',
        error
      );

      setError(
        'Erreur lors de la mise a jour de la conversation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une conversation
  const handleDeleteConversation = async (
    conversationId: number
  ) => {
    if (currentUserRole !== 'admin') {
      return;
    }

    if (
      !window.confirm(
        'Etes-vous sur de vouloir supprimer cette conversation ? Tous les messages seront supprimes.'
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      await messagingAPI.deleteConversation(
        conversationId
      );

      setConversations((prev) =>
        prev.filter(
          (conv) =>
            conv.id !== conversationId
        )
      );

      if (
        currentConversation?.id ===
        conversationId
      ) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de la conversation:',
        error
      );

      setError(
        'Erreur lors de la suppression de la conversation'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Touche Entree pour envoyer
  const handleKeyPress = (
    e: React.KeyboardEvent
  ) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Selectionner un fichier
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (file) {
      const maxSize =
        50 * 1024 * 1024;

      if (file.size > maxSize) {
        setError(
          'Le fichier est trop volumineux. La taille maximale est de 50 MB.'
        );

        return;
      }

      await sendFileMessage(file);

      if (event.target) {
        event.target.value = '';
      }

      setError(null);
    }
  };

  // Selectionner un emoji
  const handleEmojiSelect = (
    emoji: string
  ) => {
    setNewMessage(
      (prev) => prev + emoji
    );

    setShowEmojiPicker(false);
  };

  // Upload de fichier
  const handleFileUpload = async () => {
    if (
      !selectedFile ||
      !currentConversation
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(0);

      const formData = new FormData();

      formData.append(
        'file',
        selectedFile
      );

      formData.append(
        'conversationId',
        currentConversation.id.toString()
      );

      formData.append(
        'senderId',
        currentUserId.toString()
      );

      formData.append(
        'messageType',
        'file'
      );

      const progressInterval =
        setInterval(() => {
          setUploadProgress(
            (prev) => {
              if (prev >= 90) {
                clearInterval(
                  progressInterval
                );

                return 90;
              }

              return prev + 10;
            }
          );
        }, 100);

      const uploadedMessage =
        await messagingAPI.uploadFile(
          formData
        );

      clearInterval(
        progressInterval
      );

      setUploadProgress(100);

      setMessages((prev) => [
        ...prev,
        uploadedMessage
      ]);

      setSelectedFile(null);
      setUploadProgress(0);

      loadConversations();
    } catch (error) {
      console.error(
        'Erreur lors de l upload du fichier:',
        error
      );

      setError(
        'Erreur lors de l envoi du fichier'
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Marquer un message comme lu
  const markMessageAsRead = async (
    messageId: number
  ) => {
    try {
      await messagingAPI.markMessageAsRead(
        messageId
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                is_read: true
              }
            : msg
        )
      );
    } catch (error) {
      console.error(
        'Erreur lors du marquage du message comme lu:',
        error
      );
    }
  };

  // Verifier les messages non lus
  const hasUnreadMessages = (
    conversation: Conversation
  ) => {
    return (
      conversation.lastMessage &&
      !conversation.lastMessage.is_read &&
      conversation.lastMessage.sender_id !==
        currentUserId
    );
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">

      {/* Sidebar - Liste des conversations */}
      <div className="w-80 bg-white/5 border-r border-white/10 flex flex-col backdrop-blur-sm">

        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-blue-400" />
              Messages
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  window.location.reload()
                }
                className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="p-4">
          <div className="relative">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />

            <input
              type="text"
              placeholder="Rechercher des conversations..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />

          </div>
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />

              <p className="text-lg font-medium mb-2">
                Aucune conversation
              </p>

              <p className="text-sm">
                Commencez une nouvelle conversation
              </p>
            </div>
          ) : (
            conversations
              .filter((conv) => {
                const title =
                  getConversationTitle(
                    conv
                  ).toLowerCase();

                return title.includes(
                  searchQuery.toLowerCase()
                );
              })
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group p-4 border-b border-white/5 hover:bg-gradient-to-r hover:from-white/10 hover:to-blue-500/10 transition-all duration-300 ${
                    currentConversation?.id ===
                    conversation.id
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">

                    <div
                      className="cursor-pointer hover:scale-105 transition-all duration-300"
                      onClick={() =>
                        selectConversation(
                          conversation
                        )
                      }
                    >
                      <UserAvatar
                        userId={
                          conversation.participant1_id ===
                          currentUserId
                            ? conversation.participant2_id
                            : conversation.participant1_id
                        }
                        firstName={
                          availableUsers.find(
                            (user) =>
                              user.id ===
                              (conversation.participant1_id ===
                              currentUserId
                                ? conversation.participant2_id
                                : conversation.participant1_id)
                          )?.firstName
                        }
                        lastName={
                          availableUsers.find(
                            (user) =>
                              user.id ===
                              (conversation.participant1_id ===
                              currentUserId
                                ? conversation.participant2_id
                                : conversation.participant1_id)
                          )?.lastName
                        }
                        size="lg"
                        className="shadow-lg hover:shadow-blue-500/25"
                      />
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() =>
                        selectConversation(
                          conversation
                        )
                      }
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex items-center space-x-2">

                          <h3 className="text-white font-semibold truncate">
                            {getConversationTitle(
                              conversation
                            )}
                          </h3>

                          {hasUnreadMessages(
                            conversation
                          ) && (
                            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 animate-pulse shadow-lg" />
                          )}

                        </div>
                      </div>

                      {conversation.lastMessage?.content && (
                        <p className="text-gray-300 text-sm truncate mt-1">
                          {
                            conversation
                              .lastMessage
                              .content
                          }
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">

                        <span className="text-xs text-blue-400 font-medium">

                          {conversation.type ===
                          'direct'
                            ? (() => {
                                const otherUserId =
                                  conversation.participant1_id ===
                                  currentUserId
                                    ? conversation.participant2_id
                                    : conversation.participant1_id;

                                const otherUser =
                                  availableUsers.find(
                                    (user) =>
                                      user.id ===
                                      otherUserId
                                  );

                                if (
                                  otherUser?.role ===
                                    'parent' &&
                                  otherUser?.childName
                                ) {
                                  return otherUser.childName;
                                }

                                return 'Conversation privee';
                              })()
                            : 'Groupe'}

                        </span>

                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(
                              conversation
                                .lastMessage
                                .created_at
                            ).toLocaleString(
                              'fr-FR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
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

      {/* Zone principale */}
      <div className="flex-1 flex flex-col">

        {currentConversation ? (
          <>
            {/* En-tete */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">

              <div className="flex items-center justify-between">

                <div className="flex items-center space-x-3">

                  <button
                    onClick={() =>
                      setCurrentConversation(
                        null
                      )
                    }
                    className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>

                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">

                    {currentConversation.type ===
                    'group' ? (
                      <Users className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}

                  </div>

                  <div>

                    <div className="flex items-center space-x-2">

                      <h3 className="text-white font-semibold text-lg">
                        {getConversationTitle(
                          currentConversation
                        )}
                      </h3>

                    </div>

                    <p className="text-blue-300 text-sm capitalize">
                      {currentConversation.type ===
                      'group'
                        ? 'Groupe'
                        : getOtherParticipant()
                            ?.role}
                    </p>

                  </div>
                </div>

                {/* Appel video */}
                {currentUserRole === 'admin' && (
                  <div className="flex items-center space-x-2">

                    <button
                      type="button"
                      onClick={startVideoCall}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 shadow-lg"
                      title="Demarrer un appel video"
                    >
                      <Video className="w-5 h-5" />
                    </button>

                  </div>
                )}

              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-white/5 custom-scrollbar">

              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">

                  <div className="text-center">

                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />

                    <p className="text-xl font-medium mb-2">
                      Aucun message
                    </p>

                    <p className="text-sm">
                      Commencez la conversation
                    </p>

                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end space-x-2 ${
                      message.sender_id ===
                      currentUserId
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    {message.sender_id !==
                      currentUserId && (
                      <UserAvatar
                        userId={
                          message.sender_id
                        }
                        firstName={
                          message.sender
                            ?.firstName
                        }
                        lastName={
                          message.sender
                            ?.lastName
                        }
                        size="sm"
                        className="flex-shrink-0"
                      />
                    )}

                    <div
                      className={`group max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                        message.sender_id ===
                        currentUserId
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                          : 'bg-white/10 text-white border border-white/10'
                      }`}
                    >

                      {message.sender_id !==
                        currentUserId &&
                        message.sender && (
                          <p className="text-xs text-gray-300 mb-1 font-medium">
                            {
                              message.sender
                                .firstName
                            }{' '}
                            {
                              message.sender
                                .lastName
                            }
                          </p>
                        )}

                      {editingMessage ===
                      message.id ? (
                        <div className="space-y-2">

                          <textarea
                            value={
                              editingMessageContent
                            }
                            onChange={(e) =>
                              setEditingMessageContent(
                                e.target.value
                              )
                            }
                            className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 resize-none"
                            rows={3}
                          />

                          <div className="flex space-x-2">

                            <button
                              onClick={() =>
                                handleSaveMessage(
                                  message.id
                                )
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center space-x-1"
                              disabled={
                                isLoading
                              }
                            >
                              <Save className="w-4 h-4" />
                              <span>
                                Sauvegarder
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingMessage(
                                  null
                                );
                                setEditingMessageContent(
                                  ''
                                );
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center space-x-1"
                            >
                              <X className="w-4 h-4" />
                              <span>
                                Annuler
                              </span>
                            </button>

                          </div>
                        </div>
                      ) : (
                        <div>

                          {message.message_type ===
                            'file' &&
                          message.file_path ? (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 max-w-xs">

                              <div className="flex items-center space-x-3">

                                <div className="flex-shrink-0">
                                  <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>

                                <div className="flex-1 min-w-0">

                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {message.content ||
                                      'Fichier joint'}
                                  </p>

                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Cliquez pour telecharger
                                  </p>

                                </div>

                                <button
                                  onClick={() =>
                                    downloadFile(
                                      message.id,
                                      message.content ||
                                        'fichier'
                                    )
                                  }
                                  className="flex-shrink-0 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Telecharger le fichier"
                                  disabled={
                                    isLoading
                                  }
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
                                text={
                                  message.content
                                }
                                className="text-sm leading-relaxed"
                                linkClassName="underline hover:no-underline transition-all"
                              />

                            </div>
                          )}

                          {/* Edition et suppression */}
                          {message.sender_id ===
                            currentUserId &&
                            (canEditMessage(
                              message
                            ) ||
                              canEditOrDeleteMessage(
                                message
                              )) && (
                              <div className="flex space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">

                                {canEditMessage(
                                  message
                                ) && (
                                  <button
                                    onClick={() =>
                                      handleEditMessage(
                                        message.id,
                                        message.content
                                      )
                                    }
                                    className="p-1 hover:bg-white/20 rounded transition-all"
                                    title="Modifier le message"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                )}

                                {canEditOrDeleteMessage(
                                  message
                                ) && (
                                  <button
                                    onClick={() =>
                                      handleDeleteMessage(
                                        message.id
                                      )
                                    }
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

                      <div
                        className={`flex items-center justify-between mt-2 text-xs ${
                          message.sender_id ===
                          currentUserId
                            ? 'text-blue-100'
                            : 'text-gray-400'
                        }`}
                      >

                        <span>
                          {new Date(
                            message.created_at
                          ).toLocaleString(
                            'fr-FR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )}
                        </span>

                        {message.sender_id ===
                          currentUserId && (
                          <CheckCircle
                            className={`w-3 h-3 ${
                              message.is_read
                                ? 'text-green-300'
                                : 'text-gray-400'
                            }`}
                          />
                        )}

                      </div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Zone d'envoi */}
            <div className="mt-36 p-4 border-t border-white/10 bg-gradient-to-r from-white/5 to-blue-500/5 backdrop-blur-sm">

              {uploadProgress > 0 &&
                uploadProgress < 100 && (
                  <div className="mb-3">

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">

                      <span>
                        Envoi en cours...
                      </span>

                      <span>
                        {uploadProgress}%
                      </span>

                    </div>

                    <div className="w-full bg-white/10 rounded-full h-2">

                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 shadow-lg"
                        style={{
                          width: `${uploadProgress}%`
                        }}
                      />

                    </div>
                  </div>
                )}

              {selectedFile && (
                <div className="mb-3 p-4 bg-gradient-to-r from-white/10 to-blue-500/10 rounded-xl border border-white/20 shadow-lg">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center space-x-3">

                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Paperclip className="w-4 h-4 text-blue-400" />
                      </div>

                      <div>

                        <span className="text-sm text-white font-medium block">
                          {selectedFile.name}
                        </span>

                        <span className="text-xs text-gray-400">
                          {(
                            selectedFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{' '}
                          MB
                        </span>

                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedFile(null)
                      }
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
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  title="Ajouter une piece jointe (max 50 MB)"
                >
                  <Paperclip className="w-5 h-5 text-blue-400" />
                </button>

                <div className="relative emoji-picker-container">

                  <button
                    onClick={() =>
                      setShowEmojiPicker(
                        !showEmojiPicker
                      )
                    }
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                    title="Ajouter un emoji"
                  >
                    <Smile className="w-5 h-5 text-yellow-400" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-3 bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-6 shadow-2xl z-50 max-w-[400px] min-w-[350px]">

                      <div className="text-white text-sm font-medium mb-4 text-center">
                        Choisissez un emoji
                      </div>

                      <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto custom-scrollbar">

                        {popularEmojis.map(
                          (
                            emoji,
                            index
                          ) => (
                            <button
                              key={index}
                              onClick={() =>
                                handleEmojiSelect(
                                  emoji
                                )
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-700/80 rounded-xl text-2xl transition-all duration-300 bg-gray-800/50 hover:scale-125 hover:shadow-lg border border-gray-700/30"
                              title={`Emoji ${emoji}`}
                            >
                              {emoji}
                            </button>
                          )
                        )}

                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-600/50 text-xs text-gray-400 text-center">
                        Cliquez sur un emoji pour l'ajouter a votre message
                      </div>

                    </div>
                  )}

                </div>

                <div className="flex-1 relative">

                  <textarea
                    value={newMessage}
                    onChange={(e) =>
                      setNewMessage(
                        e.target.value
                      )
                    }
                    onKeyPress={
                      handleKeyPress
                    }
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
                  onClick={
                    selectedFile
                      ? handleFileUpload
                      : sendMessage
                  }
                  disabled={
                    !newMessage.trim() &&
                    !selectedFile
                  }
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
            availableUsers={
              availableUsers
            }
            onSelectUser={
              startConversation
            }
            onCancel={() => {
              setShowNewConversation(
                false
              );
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
                Selectionnez une conversation
              </h3>

              <p className="text-gray-400 text-lg">
                Ou commencez une nouvelle conversation
              </p>

            </div>
          </div>
        )}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-2xl shadow-2xl border border-red-500/30 backdrop-blur-xl z-50 max-w-md">

          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-3">

              <div className="w-6 h-6 bg-red-500/30 rounded-full flex items-center justify-center">
                <X className="w-4 h-4" />
              </div>

              <span className="font-medium">
                {error}
              </span>

            </div>

            <button
              onClick={() =>
                setError(null)
              }
              className="ml-4 hover:bg-red-700/50 rounded-lg px-2 py-1 transition-all duration-300 hover:scale-110"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* Style scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            45deg,
            #3b82f6,
            #8b5cf6
          );
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            45deg,
            #2563eb,
            #7c3aed
          );
        }
      `}</style>
    </div>
  );
};

// Composant nouvelle conversation
interface NewConversationViewProps {
  availableUsers: User[];
  onSelectUser: (user: User) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const NewConversationView: React.FC<
  NewConversationViewProps
> = ({
  availableUsers,
  onSelectUser,
  onCancel,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] =
    useState('');

  const filteredUsers =
    availableUsers.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
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
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
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

              <p className="text-xl font-medium">
                Aucun utilisateur trouve
              </p>

            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() =>
                  onSelectUser(user)
                }
                className="flex items-center space-x-4 p-4 hover:bg-gradient-to-r hover:from-white/10 hover:to-blue-500/10 rounded-2xl cursor-pointer transition-all duration-300 border border-white/10 hover:border-blue-500/30 hover:shadow-lg hover:scale-[1.02]"
              >

                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">

                  <h4 className="text-white font-semibold text-lg">
                    {user.firstName}{' '}
                    {user.lastName}
                  </h4>

                  <p className="text-gray-300 text-sm">
                    {user.email}
                  </p>

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