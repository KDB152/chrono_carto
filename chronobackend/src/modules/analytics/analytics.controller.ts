import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor() {}

  @Get('dashboard')
  async getDashboardAnalytics(@Request() req) {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Accès non autorisé');
    }

    // Retourner des données de base pour le dashboard
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalParents: 0,
      totalFiles: 0,
      recentActivity: [],
      charts: {
        userGrowth: [],
        fileUploads: [],
        activityByMonth: []
      }
    };
  }
}
