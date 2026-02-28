import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor() {}

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string, @Request() req) {
    // Vérifier que l'utilisateur peut accéder à ces notifications
    if (req.user.role !== UserRole.ADMIN && req.user.id !== parseInt(userId)) {
      throw new Error('Accès non autorisé');
    }

    // Retourner des notifications de base
    return {
      notifications: [],
      unreadCount: 0
    };
  }
}
