import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Groupe } from './entities/groupe.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Parent } from '../parents/entities/parent.entity';
import { ParentStudent } from '../relations/entities/parent-student.entity';
import { GroupService } from './group.service';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Groupe)
    private groupeRepository: Repository<Groupe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(ParentStudent)
    private parentStudentRepository: Repository<ParentStudent>,
    private groupService: GroupService,
  ) {}

  async getConversations(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['student', 'parent']
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Récupérer toutes les conversations où l'utilisateur est participant
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('conversation.groupe', 'groupe')
      .where('participants.user_id = :userId', { userId })
      .orderBy('conversation.updated_at', 'DESC')
      .getMany();

    // Formater les conversations selon le rôle
    const formattedConversations = [];

    for (const conversation of conversations) {
      // Pour le nouveau système simplifié, on utilise participant1 et participant2
      const otherParticipant = conversation.participant1_id === userId ? 
        conversation.participant2 : conversation.participant1;
      
      if (user.role === 'admin') {
        // Pour l'admin : afficher les groupes et les parents
        if (conversation.groupe) {
          // Conversation de groupe
          formattedConversations.push({
            id: conversation.id,
            type: 'group',
            title: conversation.groupe.title,
            class_level: conversation.groupe.class_level,
            participants: otherParticipant ? [{
              id: otherParticipant.id,
              firstName: otherParticipant.firstName,
              lastName: otherParticipant.lastName,
              role: otherParticipant.role
            }] : [],
            last_message: null,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at
          });
        } else {
          // Conversation directe avec un parent
          const parentParticipant = otherParticipant;
          if (parentParticipant) {
            formattedConversations.push({
              id: conversation.id,
              type: 'direct',
              title: `${parentParticipant.firstName} ${parentParticipant.lastName}`,
              participants: otherParticipant ? [{
                id: otherParticipant.id,
                firstName: otherParticipant.firstName,
                lastName: otherParticipant.lastName,
                role: otherParticipant.role
              }] : [],
              last_message: null,
              created_at: conversation.created_at,
              updated_at: conversation.updated_at
            });
          }
        }
      } else if (user.role === 'student') {
        // Pour l'étudiant : afficher son groupe de classe et ses parents
        if (conversation.groupe) {
          // Vérifier si c'est le groupe de classe de l'étudiant
          if (user.student && user.student.class_level === conversation.groupe.class_level) {
            formattedConversations.push({
              id: conversation.id,
              type: 'group',
              title: conversation.groupe.title,
              class_level: conversation.groupe.class_level,
              participants: otherParticipant ? [{
                id: otherParticipant.id,
                firstName: otherParticipant.firstName,
                lastName: otherParticipant.lastName,
                role: otherParticipant.role
              }] : [],
              last_message: null,
              created_at: conversation.created_at,
              updated_at: conversation.updated_at
            });
          }
        } else {
          // Conversation avec un parent
          const parentParticipant = otherParticipant;
          if (parentParticipant) {
            formattedConversations.push({
              id: conversation.id,
              type: 'direct',
              title: `${parentParticipant.firstName} ${parentParticipant.lastName}`,
              participants: otherParticipant ? [{
                id: otherParticipant.id,
                firstName: otherParticipant.firstName,
                lastName: otherParticipant.lastName,
                role: otherParticipant.role
              }] : [],
              last_message: null,
              created_at: conversation.created_at,
              updated_at: conversation.updated_at
            });
          }
        }
      } else if (user.role === 'parent') {
        // Pour le parent : afficher l'admin et ses enfants
        // otherParticipant est déjà défini plus haut
        if (otherParticipant) {
          formattedConversations.push({
            id: conversation.id,
            type: 'direct',
            title: otherParticipant.role === 'admin' 
              ? 'Administrateur' 
              : `${otherParticipant.firstName} ${otherParticipant.lastName}`,
            participants: otherParticipant ? [{
              id: otherParticipant.id,
              firstName: otherParticipant.firstName,
              lastName: otherParticipant.lastName,
              role: otherParticipant.role
            }] : [],
            last_message: null,
            created_at: conversation.created_at,
            updated_at: conversation.updated_at
          });
        }
      }
    }

    return formattedConversations;
  }

  async getConversation(id: number) {
    return this.conversationRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user', 'groupe']
    });
  }

  async createConversation(dto: CreateConversationDto) {
    // Cette méthode sera remplacée par la logique de création automatique des conversations
    throw new Error('Cette méthode est obsolète. Les conversations sont créées automatiquement.');
  }

  async getMessages(conversationId: number) {
    const messages = await this.messageRepository.find({
      where: { conversation_id: conversationId },
      relations: ['sender', 'recipient'],
      order: { created_at: 'ASC' }
    });
    
    console.log('🔍 Messages retrieved for conversation', conversationId, ':', JSON.stringify(messages.map(m => ({
      id: m.id,
      content: m.content,
      sender_id: m.sender_id,
      sender: m.sender ? { id: m.sender.id, first_name: m.sender.firstName, last_name: m.sender.lastName } : null
    })), null, 2));
    
    return messages;
  }

  async getMessage(messageId: number) {
    return this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'recipient']
    });
  }

  async sendMessage(dto: SendMessageDto) {
    // Vérifier que l'utilisateur ne s'envoie pas un message à lui-même
    if (dto.senderId === dto.recipientId) {
      throw new Error('Vous ne pouvez pas vous envoyer un message à vous-même');
    }

    const message = this.messageRepository.create({
      conversation_id: dto.conversationId,
      sender_id: dto.senderId,
      recipient_id: dto.recipientId || null,
      groupe_id: dto.groupeId || null,
      content: dto.content,
      message_type: dto.messageType || 'text',
      file_path: dto.filePath || null
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation's last message and timestamp
    await this.conversationRepository.update(dto.conversationId, {
      last_message_id: savedMessage.id,
      updated_at: new Date()
    });

    return savedMessage;
  }

  async markMessageAsRead(messageId: number) {
    return this.messageRepository.update(messageId, { is_read: true });
  }


  async searchMessages(conversationId: number, query: string) {
    return this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.content LIKE :query', { query: `%${query}%` })
      .orderBy('message.created_at', 'ASC')
      .getMany();
  }

  async uploadFile(file: Express.Multer.File, userId: number) {
    const fs = require('fs');
    const path = require('path');
    
    // Créer le dossier uploads/messages s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads', 'messages');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExtension);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storedName = `message-${timestamp}-${randomSuffix}-${fileName}${fileExtension}`;
    const filePath = path.join('uploads', 'messages', storedName);

    // Sauvegarder le fichier
    const fullPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(fullPath, file.buffer);

    console.log('✅ Fichier de message sauvegardé:', fullPath);

    return {
      fileName: file.originalname,
      storedName,
      filePath,
      fileType: file.mimetype,
      fileSize: file.size
    };
  }

  async getAvailableRecipients(currentUserId: number, currentUserRole: string) {
    return this.groupService.getAvailableRecipients(currentUserId, currentUserRole);
  }

  // Méthodes pour la gestion des messages (tous les utilisateurs peuvent modifier/supprimer leurs propres messages)
  async updateMessage(messageId: number, newContent: string, currentUserId: number, currentUserRole: string) {
    console.log(`🔍 Utilisateur ${currentUserId} (${currentUserRole}) met à jour le message ${messageId} avec le contenu: ${newContent}`);
    
    try {
      // Vérifier que le message existe
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['sender', 'conversation']
      });

      if (!message) {
        throw new Error('Message non trouvé');
      }

      // Vérifier les permissions : l'utilisateur peut modifier son propre message ou être admin
      if (message.sender_id !== currentUserId && currentUserRole !== 'admin') {
        throw new Error('Vous ne pouvez modifier que vos propres messages');
      }

      // Mettre à jour le contenu du message
      await this.messageRepository.update(messageId, {
        content: newContent,
        updated_at: new Date()
      });

      console.log(`✅ Message ${messageId} mis à jour par l'utilisateur ${currentUserId}`);
      
      // Retourner le message mis à jour
      return await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['sender', 'conversation']
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: number, currentUserId: number, currentUserRole: string) {
    console.log(`🔍 Utilisateur ${currentUserId} (${currentUserRole}) supprime le message ${messageId}`);
    
    try {
      // Vérifier que le message existe
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['sender', 'conversation']
      });

      if (!message) {
        throw new Error('Message non trouvé');
      }

      // Vérifier les permissions : l'utilisateur peut supprimer son propre message ou être admin
      if (message.sender_id !== currentUserId && currentUserRole !== 'admin') {
        throw new Error('Vous ne pouvez supprimer que vos propres messages');
      }

      // Supprimer le message de la base de données
      await this.messageRepository.delete(messageId);

      console.log(`✅ Message ${messageId} supprimé par l'utilisateur ${currentUserId}`);
      
      return { success: true, message: 'Message supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  // Méthodes pour l'admin - gestion des conversations
  async updateConversation(conversationId: number, updateData: { title?: string }, adminId: number) {
    console.log(`🔍 Admin ${adminId} met à jour la conversation ${conversationId} avec:`, updateData);
    
    try {
      // Vérifier que la conversation existe
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        throw new Error('Conversation non trouvée');
      }

      // Mettre à jour la conversation
      const updateFields: any = {
        updated_at: new Date()
      };

      if (updateData.title) {
        updateFields.title = updateData.title;
      }

      await this.conversationRepository.update(conversationId, updateFields);

      console.log(`✅ Conversation ${conversationId} mise à jour par l'admin ${adminId}`);
      
      // Retourner la conversation mise à jour
      return await this.conversationRepository.findOne({
        where: { id: conversationId },
        relations: ['participants', 'messages']
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: number, adminId: number) {
    console.log(`🔍 Admin ${adminId} supprime la conversation ${conversationId}`);
    
    try {
      // Vérifier que la conversation existe
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        throw new Error('Conversation non trouvée');
      }

      // Supprimer tous les messages de la conversation
      await this.messageRepository.delete({ conversation_id: conversationId });

      // Les participants sont maintenant gérés directement dans la table conversation

      // Supprimer la conversation
      await this.conversationRepository.delete(conversationId);

      console.log(`✅ Conversation ${conversationId} supprimée par l'admin ${adminId}`);
      
      return { success: true, message: 'Conversation supprimée avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la conversation:', error);
      throw error;
    }
  }

  async createOrGetConversation(currentUserId: number, currentUserRole: string, recipientId: number) {
    console.log(`🔍 createOrGetConversation - currentUserId: ${currentUserId}, currentUserRole: ${currentUserRole}, recipientId: ${recipientId} (type: ${typeof recipientId})`);
    
    // Vérifier que l'utilisateur ne peut pas s'envoyer un message à lui-même
    if (currentUserId === recipientId) {
      throw new Error('Vous ne pouvez pas vous envoyer un message à vous-même');
    }

    // Vérifier que le destinataire est disponible pour cet utilisateur
    const availableRecipients = await this.getAvailableRecipients(currentUserId, currentUserRole);
    console.log(`🔍 availableRecipients:`, availableRecipients.map(r => ({ id: r.id, name: `${r.firstName} ${r.lastName}`, role: r.role })));
    
    const recipient = availableRecipients.find(r => r.id === recipientId);
    console.log(`🔍 recipient trouvé:`, recipient ? `${recipient.firstName} ${recipient.lastName} (ID: ${recipient.id})` : 'AUCUN');
    
    if (!recipient) {
      console.log(`❌ Destinataire non autorisé - recipientId: ${recipientId}, IDs disponibles:`, availableRecipients.map(r => r.id));
      throw new Error('Destinataire non autorisé');
    }

    // Chercher une conversation existante entre ces deux utilisateurs
    // Utiliser la nouvelle structure avec participant1_id et participant2_id
    const existingConversation = await this.conversationRepository.findOne({
      where: [
        { participant1_id: currentUserId, participant2_id: recipientId },
        { participant1_id: recipientId, participant2_id: currentUserId }
      ]
    });

    if (existingConversation) {
      const response = {
        conversation: {
          ...existingConversation,
          participant1_id: currentUserId,
          participant2_id: recipientId
        },
        isNew: false
      };
      
      console.log('🔍 Returning existing conversation response:', JSON.stringify(response, null, 2));
      return response;
    }

    // Créer une nouvelle conversation avec la nouvelle structure
    const newConversation = this.conversationRepository.create({
      groupe_id: null, // Conversation directe
      last_message_id: null,
      type: 'direct',
      participant1_id: currentUserId,
      participant2_id: recipientId
    });

    const savedConversation = await this.conversationRepository.save(newConversation);

    const response = {
      conversation: {
        ...savedConversation,
        participant1_id: currentUserId,
        participant2_id: recipientId
      },
      isNew: true
    };
    
    console.log('🔍 Returning new conversation response:', JSON.stringify(response, null, 2));
    return response;
  }
}