import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseInterceptors, UploadedFile, UseGuards, Req, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagingService } from './messaging.service';
import { SimplifiedMessagingService } from './simplified-messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';


@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly simplifiedMessagingService: SimplifiedMessagingService
  ) {}

  @Get('conversations')
  async getConversations(@Query('userId') userId: string, @Query('userRole') userRole: string, @Req() req) {
    try {
      const currentUserId = req.user.id;
      console.log(`🔍 API: Récupération des conversations pour l'utilisateur ${currentUserId}`);
      const result = await this.simplifiedMessagingService.getConversationsForUser(currentUserId);
      console.log(`✅ API: ${result.length} conversations retournées`);
      return result;
    } catch (error) {
      console.error(`❌ API: Erreur lors de la récupération des conversations:`, error);
      throw error;
    }
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return this.messagingService.getConversation(parseInt(id));
  }

  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto) {
    return this.messagingService.createConversation(dto);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') conversationId: string, @Req() req) {
    try {
      const currentUserId = req.user.id;
      console.log(`📨 GET /conversations/${conversationId}/messages - Utilisateur: ${currentUserId}`);
      const messages = await this.simplifiedMessagingService.getMessagesForConversation(parseInt(conversationId), currentUserId);
      console.log(`✅ Messages récupérés avec succès: ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error(`❌ Erreur dans getMessages pour la conversation ${conversationId}:`, error);
      throw error;
    }
  }

  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto, @Req() req) {
    const currentUserId = req.user.id;
    console.log(`📨 Envoi de message:`, dto);
    return this.simplifiedMessagingService.sendMessage(
      dto.conversationId, 
      currentUserId, 
      dto.content,
      dto.messageType || 'text',
      dto.filePath,
      dto.fileName,
      dto.fileType
    );
  }

  // Endpoints pour la gestion des messages (tous les utilisateurs peuvent modifier/supprimer leurs propres messages)
  @Patch('messages/:id')
  async updateMessage(@Param('id') id: string, @Body() updateData: { content: string }, @Req() req) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    return this.simplifiedMessagingService.updateMessage(parseInt(id), updateData.content, currentUserId, currentUserRole);
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string, @Req() req) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    return this.simplifiedMessagingService.deleteMessage(parseInt(id), currentUserId, currentUserRole);
  }

  // Endpoints pour l'admin - gestion des conversations
  @Patch('conversations/:id')
  async updateConversation(@Param('id') id: string, @Body() updateData: { title?: string }, @Req() req) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    // Vérifier que l'utilisateur est admin
    if (currentUserRole !== 'admin') {
      throw new Error('Accès non autorisé - Admin requis');
    }
    
    return this.simplifiedMessagingService.updateConversation(parseInt(id), updateData, currentUserId);
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string, @Req() req) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    
    // Vérifier que l'utilisateur est admin
    if (currentUserRole !== 'admin') {
      throw new Error('Accès non autorisé - Admin requis');
    }
    
    return this.simplifiedMessagingService.deleteConversation(parseInt(id), currentUserId);
  }

  @Patch('messages/:id/read')
  async markMessageAsRead(@Param('id') messageId: string) {
    return this.messagingService.markMessageAsRead(parseInt(messageId));
  }



  @Get('search')
  async searchMessages(
    @Query('conversationId') conversationId: string,
    @Query('query') query: string
  ) {
    return this.messagingService.searchMessages(parseInt(conversationId), query);
  }

  @Get('recipients')
  @UseGuards(JwtAuthGuard)
  async getAvailableRecipients(@Req() req) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    return this.messagingService.getAvailableRecipients(currentUserId, currentUserRole);
  }

  @Post('conversations/create-or-get')
  @UseGuards(JwtAuthGuard)
  async createOrGetConversation(@Req() req, @Body() body: { recipientId: number }) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
    const recipientId = parseInt(body.recipientId.toString(), 10); // S'assurer que c'est un number
    return this.messagingService.createOrGetConversation(currentUserId, currentUserRole, recipientId);
  }

  @Get('test')
  async test() {
    return { message: 'Messaging API is working!' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new Error('Utilisateur non authentifié');
    }

    return this.simplifiedMessagingService.uploadFile(file, userId);
  }

  @Get('download/:messageId')
  async downloadFile(
    @Param('messageId') messageId: string,
    @Res() res: Response,
    @Req() req: any
  ) {
    try {
      // Récupérer le message pour vérifier les permissions
      const message = await this.simplifiedMessagingService.getMessage(parseInt(messageId));
      if (!message || !message.file_path) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      const userId = req.user?.id;
      console.log(`🔍 Vérification des permissions pour l'utilisateur ${userId} et le message ${messageId}`);
      
      // Vérifier que l'utilisateur a accès à cette conversation
      const conversation = await this.simplifiedMessagingService.getConversation(message.conversation_id);
      
      if (!conversation) {
        console.log(`❌ Conversation ${message.conversation_id} non trouvée`);
        return res.status(403).json({ error: 'Conversation non trouvée' });
      }

      // Vérifier que l'utilisateur peut accéder à cette conversation
      const canAccessMessage = await this.simplifiedMessagingService.checkConversationAccess(conversation, userId);
      
      if (!canAccessMessage) {
        console.log(`❌ Accès refusé: utilisateur ${userId} n'est pas autorisé à accéder à la conversation ${conversation.id}`);
        return res.status(403).json({ error: 'Accès non autorisé à cette conversation' });
      }

      // Construire le chemin du fichier
      const filePath = path.join(process.cwd(), message.file_path);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé sur le serveur' });
      }

      // Déterminer le type MIME
      const ext = path.extname(message.file_path).toLowerCase();
      let contentType = 'application/octet-stream';
      
      // Images
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.bmp') contentType = 'image/bmp';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      
      // Vidéos
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.avi') contentType = 'video/x-msvideo';
      else if (ext === '.mov') contentType = 'video/quicktime';
      else if (ext === '.wmv') contentType = 'video/x-ms-wmv';
      else if (ext === '.webm') contentType = 'video/webm';
      
      // Audio
      else if (ext === '.mp3') contentType = 'audio/mpeg';
      else if (ext === '.wav') contentType = 'audio/wav';
      else if (ext === '.ogg') contentType = 'audio/ogg';
      else if (ext === '.m4a') contentType = 'audio/mp4';
      
      // Documents
      else if (ext === '.pdf') contentType = 'application/pdf';
      else if (ext === '.doc') contentType = 'application/msword';
      else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.xls') contentType = 'application/vnd.ms-excel';
      else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (ext === '.ppt') contentType = 'application/vnd.ms-powerpoint';
      else if (ext === '.pptx') contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      
      // Textes
      else if (ext === '.txt') contentType = 'text/plain';
      else if (ext === '.csv') contentType = 'text/csv';
      else if (ext === '.html') contentType = 'text/html';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.xml') contentType = 'application/xml';
      
      // Archives
      else if (ext === '.zip') contentType = 'application/zip';
      else if (ext === '.rar') contentType = 'application/x-rar-compressed';
      else if (ext === '.7z') contentType = 'application/x-7z-compressed';
      
      console.log(`📄 Type MIME détecté: ${contentType} pour l'extension ${ext}`);

      // Extraire le nom de fichier original du contenu du message
      const originalFileName = message.content || `fichier${ext}`;

      // Obtenir la taille du fichier
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      
      console.log(`📦 Téléchargement du fichier: ${originalFileName} (${fileSize} bytes)`);

      // Configurer les headers de réponse
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
      res.setHeader('Content-Length', fileSize.toString());
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Envoyer le fichier avec gestion d'erreur
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (streamError) => {
        console.error('❌ Erreur lors de la lecture du fichier:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erreur lors de la lecture du fichier' });
        }
      });
      
      fileStream.pipe(res);
      
      console.log(`✅ Fichier envoyé avec succès: ${originalFileName}`);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      return res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
    }
  }

}
