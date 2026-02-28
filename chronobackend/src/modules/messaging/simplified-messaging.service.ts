import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { Parent } from '../parents/entities/parent.entity';
import { ParentStudent } from '../relations/entities/parent-student.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SimplifiedMessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(ParentStudent)
    private parentStudentRepository: Repository<ParentStudent>,
  ) {}

  async getConversationsForUser(userId: number) {
    try {
      
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouv?');
      }


      const conversations = [];

      if (user.role === 'student') {
        
        // Pour un ?tudiant : conversation avec son parent + conversation de classe
        const student = await this.studentRepository.findOne({
          where: { user_id: userId }
        });

        if (student) {
          
          // 1. Conversation avec le parent
          try {
            const parentRelation = await this.parentStudentRepository.findOne({
              where: { student_id: student.id },
              relations: ['parent', 'parent.user']
            });

            if (parentRelation && parentRelation.parent) {
              
              let parentConversation = await this.conversationRepository.findOne({
                where: [
                  { participant1_id: userId, participant2_id: parentRelation.parent.user_id, type: 'direct' },
                  { participant1_id: parentRelation.parent.user_id, participant2_id: userId, type: 'direct' }
                ]
              });

              if (!parentConversation) {
                parentConversation = await this.createDirectConversation(
                  userId, 
                  parentRelation.parent.user_id,
                  `${parentRelation.parent.user.firstName} ${parentRelation.parent.user.lastName}`
                );
              } else {
                // Mettre ? jour le titre si n?cessaire
                const expectedTitle = `${parentRelation.parent.user.firstName} ${parentRelation.parent.user.lastName}`;
                if (parentConversation.title !== expectedTitle) {
                  parentConversation.title = expectedTitle;
                  await this.conversationRepository.save(parentConversation);
                }
              }

              conversations.push(parentConversation);
            } else {
            }
          } catch (error) {
          }

          // 2. Conversation de classe
          if (student.class_level) {
            try {
              let classConversation = await this.conversationRepository.findOne({
                where: { 
                  class_level: student.class_level, 
                  type: 'class' 
                }
              });

              if (!classConversation) {
                classConversation = await this.createClassConversation(student.class_level);
              }

              conversations.push(classConversation);
            } catch (error) {
            }
          }
        } else {
        }
      } else if (user.role === 'parent') {
        
        // Pour un parent : conversation avec son enfant + conversation avec l'admin
        const parent = await this.parentRepository.findOne({
          where: { user_id: userId }
        });

        if (parent) {
          
          // 1. Conversations avec tous les enfants
          try {
            const childRelations = await this.parentStudentRepository.find({
              where: { parent_id: parent.id },
              relations: ['student', 'student.user']
            });

            if (childRelations && childRelations.length > 0) {
              
              for (const childRelation of childRelations) {
                if (childRelation.student) {
                  
                  let childConversation = await this.conversationRepository.findOne({
                    where: [
                      { participant1_id: userId, participant2_id: childRelation.student.user_id, type: 'direct' },
                      { participant1_id: childRelation.student.user_id, participant2_id: userId, type: 'direct' }
                    ]
                  });

                  if (!childConversation) {
                    childConversation = await this.createDirectConversation(
                      userId, 
                      childRelation.student.user_id,
                      `${childRelation.student.user.firstName} ${childRelation.student.user.lastName}`
                    );
                  } else {
                    // Mettre ? jour le titre si n?cessaire
                    const expectedTitle = `${childRelation.student.user.firstName} ${childRelation.student.user.lastName}`;
                    if (childConversation.title !== expectedTitle) {
                      childConversation.title = expectedTitle;
                      await this.conversationRepository.save(childConversation);
                    }
                  }

                  conversations.push(childConversation);
                }
              }
            } else {
            }
          } catch (error) {
          }

          // 2. Conversation avec l'admin
          try {
            const admin = await this.userRepository.findOne({
              where: { role: 'admin' as any }
            });

            if (admin) {
              
              let adminConversation = await this.conversationRepository.findOne({
                where: [
                  { participant1_id: userId, participant2_id: admin.id, type: 'direct' },
                  { participant1_id: admin.id, participant2_id: userId, type: 'direct' }
                ]
              });

              if (!adminConversation) {
                adminConversation = await this.createDirectConversation(
                  userId, 
                  admin.id,
                  'Administrateur'
                );
              } else {
                // Mettre ? jour le titre si n?cessaire
                if (adminConversation.title !== 'Administrateur') {
                  adminConversation.title = 'Administrateur';
                  await this.conversationRepository.save(adminConversation);
                }
              }

              conversations.push(adminConversation);
            } else {
            }
          } catch (error) {
          }
        } else {
        }
      } else if (user.role === 'admin') {
        
        // Pour l'admin : toutes les conversations de classes + conversations avec chaque parent
        
        // 1. Conversations de classes (9 groupes)
        const classLevels = [
          '1ere groupe 1', '1ere groupe 2', '1ere groupe 3', '1ere groupe 4',
          'Terminale groupe 1', 'Terminale groupe 2', 'Terminale groupe 3', 'Terminale groupe 4', 'Terminale groupe 5'
        ];

        for (const classLevel of classLevels) {
          try {
            let classConversation = await this.conversationRepository.findOne({
              where: { class_level: classLevel, type: 'class' }
            });

            if (!classConversation) {
              classConversation = await this.createClassConversation(classLevel);
            }

            conversations.push(classConversation);
          } catch (error) {
          }
        }

        // 2. Conversations avec chaque parent (exclure les parents temporaires)
        try {
          const parents = await this.parentRepository.find({
            relations: ['user']
          });

          // Filtrer les parents temporaires (ceux avec email parent.virtuel.*)
          const realParents = parents.filter(parent => 
            !parent.user.email.startsWith('parent.virtuel.') && 
            parent.user.firstName !== 'Parent' && 
            parent.user.lastName !== 'Temporaire'
          );

          for (const parent of realParents) {
            try {
              let parentConversation = await this.conversationRepository.findOne({
                where: [
                  { participant1_id: userId, participant2_id: parent.user_id, type: 'direct' },
                  { participant1_id: parent.user_id, participant2_id: userId, type: 'direct' }
                ]
              });

              if (!parentConversation) {
                parentConversation = await this.createDirectConversation(
                  userId, 
                  parent.user_id,
                  `${parent.user.firstName} ${parent.user.lastName}`
                );
              } else {
                // Mettre ? jour le titre si n?cessaire
                const expectedTitle = `${parent.user.firstName} ${parent.user.lastName}`;
                if (parentConversation.title !== expectedTitle) {
                  parentConversation.title = expectedTitle;
                  await this.conversationRepository.save(parentConversation);
                }
              }

              conversations.push(parentConversation);
            } catch (error) {
            }
          }
        } catch (error) {
        }
      } else {
      }

      // Ajouter les derniers messages pour chaque conversation
      for (const conversation of conversations) {
        try {
          const lastMessage = await this.messageRepository.findOne({
            where: { conversation_id: conversation.id },
            order: { created_at: 'DESC' }
          });

          if (lastMessage) {
            conversation.lastMessage = lastMessage;
          }
        } catch (error) {
        }
      }

      return conversations;
      
    } catch (error) {
      throw error;
    }
  }

  private async createDirectConversation(user1Id: number, user2Id: number, title: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      type: 'direct',
      title: title,
      participant1_id: user1Id,
      participant2_id: user2Id
    });

    return await this.conversationRepository.save(conversation);
  }

  private async createClassConversation(classLevel: string): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      type: 'class',
      title: classLevel,
      class_level: classLevel
    });

    return await this.conversationRepository.save(conversation);
  }

  async getMessagesForConversation(conversationId: number, userId: number) {
    try {
      
      // V?rifier que l'utilisateur a acc?s ? cette conversation
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
        relations: ['participant1', 'participant2']
      });

      if (!conversation) {
        throw new Error('Conversation non trouv?e');
      }


      // V?rifier les permissions
      const hasAccess = await this.checkConversationAccess(conversation, userId);
      if (!hasAccess) {
        throw new Error('Acc?s non autoris? ? cette conversation');
      }


      // R?cup?rer les messages
      const messages = await this.messageRepository.find({
        where: { conversation_id: conversationId },
        relations: ['sender'],
        order: { created_at: 'ASC' }
      });

      return messages;
    } catch (error) {
      throw error;
    }
  }

  async checkConversationAccess(conversation: Conversation, userId: number): Promise<boolean> {
    
    if (conversation.type === 'direct') {
      const hasAccess = conversation.participant1_id === userId || conversation.participant2_id === userId;
      return hasAccess;
    } else if (conversation.type === 'class') {
      // Pour les conversations de classe, v?rifier si l'utilisateur appartient ? cette classe
      try {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['student', 'parent']
        });

        if (!user) {
          return false;
        }

        let userClassLevel = null;
        if (user.role === 'student' && user.student) {
          userClassLevel = user.student.class_level;
        } else if (user.role === 'parent' && user.parent) {
          // Pour les parents, v?rifier la classe de leurs enfants
          const children = await this.studentRepository.find({
            where: { parent_id: user.parent.id },
            relations: ['user']
          });
          userClassLevel = children.length > 0 ? children[0].class_level : null;
        } else if (user.role === 'admin') {
          // Les admins ont acc?s ? toutes les conversations de classe
          return true;
        }

        const hasAccess = userClassLevel === conversation.class_level;
        return hasAccess;
      } catch (error) {
        return false;
      }
    } else if (conversation.type === 'group') {
      // Pour les conversations de groupe, v?rifier les participants
      const hasAccess = conversation.participant1_id === userId || conversation.participant2_id === userId;
      return hasAccess;
    }
    
    return false;
  }

  async sendMessage(
    conversationId: number, 
    senderId: number, 
    content: string,
    messageType: string = 'text',
    filePath?: string,
    fileName?: string,
    fileType?: string
  ) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error('Conversation non trouv?e');
    }

    // V?rifier les permissions
    const hasAccess = await this.checkConversationAccess(conversation, senderId);
    if (!hasAccess) {
      throw new Error('Acc?s non autoris? ? cette conversation');
    }

    // D?terminer le destinataire bas? sur la conversation
    let recipientId = null;
    if (conversation.type === 'direct') {
      // Pour les conversations directes, le destinataire est l'autre participant
      recipientId = conversation.participant1_id === senderId ? 
        conversation.participant2_id : conversation.participant1_id;
    }
    // Pour les conversations de groupe/classe, recipient_id reste null

    const message = this.messageRepository.create({
      conversation_id: conversationId,
      sender_id: senderId,
      recipient_id: recipientId,
      content: content,
      message_type: messageType,
      file_path: filePath || null
    });

    const savedMessage = await this.messageRepository.save(message);

    // Mettre ? jour le dernier message de la conversation
    await this.conversationRepository.update(conversationId, {
      last_message_id: savedMessage.id,
      updated_at: new Date()
    });

    return savedMessage;
  }

  async updateMessage(messageId: number, newContent: string, currentUserId: number, currentUserRole: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new Error('Message non trouv?');
    }

    // V?rifier les permissions : l'utilisateur peut modifier son propre message ou ?tre admin
    if (message.sender_id !== currentUserId && currentUserRole !== 'admin') {
      throw new Error('Permission insuffisante pour modifier ce message');
    }

    await this.messageRepository.update(messageId, {
      content: newContent,
      updated_at: new Date()
    });

    return await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    });
  }

  async deleteMessage(messageId: number, currentUserId: number, currentUserRole: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new Error('Message non trouv?');
    }

    // V?rifier les permissions : l'utilisateur peut supprimer son propre message ou ?tre admin
    if (message.sender_id !== currentUserId && currentUserRole !== 'admin') {
      throw new Error('Permission insuffisante pour supprimer ce message');
    }

    await this.messageRepository.delete(messageId);
    return { success: true };
  }

  async updateConversation(conversationId: number, updateData: { title?: string }, adminId: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error('Conversation non trouv?e');
    }

    // Seul l'admin peut modifier les conversations
    const admin = await this.userRepository.findOne({
      where: { id: adminId, role: 'admin' as any }
    });

    if (!admin) {
      throw new Error('Seul l\'administrateur peut modifier les conversations');
    }

    await this.conversationRepository.update(conversationId, {
      ...updateData,
      updated_at: new Date()
    });

    return await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2']
    });
  }

  async deleteConversation(conversationId: number, adminId: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      throw new Error('Conversation non trouv?e');
    }

    // Seul l'admin peut supprimer les conversations
    const admin = await this.userRepository.findOne({
      where: { id: adminId, role: 'admin' as any }
    });

    if (!admin) {
      throw new Error('Seul l\'administrateur peut supprimer les conversations');
    }

    // Supprimer tous les messages de la conversation
    await this.messageRepository.delete({ conversation_id: conversationId });

    // Supprimer la conversation
    await this.conversationRepository.delete(conversationId);

    return { success: true };
  }

  // M?thodes pour le t?l?chargement de fichiers
  async getMessage(messageId: number) {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['sender']
      });

      if (!message) {
        throw new Error('Message non trouv?');
      }

      // Si le message n'a pas de recipient_id et que c'est une conversation directe, le corriger
      if (!message.recipient_id && message.conversation_id) {
        const conversation = await this.conversationRepository.findOne({
          where: { id: message.conversation_id }
        });
        
        if (conversation && conversation.type === 'direct') {
          const recipientId = conversation.participant1_id === message.sender_id ? 
            conversation.participant2_id : conversation.participant1_id;
          
          await this.messageRepository.update(messageId, { recipient_id: recipientId });
          message.recipient_id = recipientId;
        }
      }

      return message;
    } catch (error) {
      throw error;
    }
  }

  async getConversation(conversationId: number) {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
        relations: ['participant1', 'participant2']
      });

      if (!conversation) {
        throw new Error('Conversation non trouv?e');
      }

      return conversation;
    } catch (error) {
      throw error;
    }
  }

  // M?thode pour l'upload de fichiers
  async uploadFile(file: any, userId: number) {
    
    
    // Cr?er le dossier uploads/messages s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), 'uploads', 'messages');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // G?n?rer un nom de fichier unique
    const fileExtension = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExtension);
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storedName = `message-${timestamp}-${randomSuffix}-${fileName}${fileExtension}`;
    const filePath = path.join('uploads', 'messages', storedName);

    // Sauvegarder le fichier
    const fullPath = path.join(process.cwd(), filePath);
    fs.writeFileSync(fullPath, file.buffer);


    return {
      fileName: file.originalname,
      storedName,
      filePath,
      fileType: file.mimetype,
      fileSize: file.size
    };
  }
}
