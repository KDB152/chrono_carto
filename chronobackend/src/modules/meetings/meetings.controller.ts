import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  async getMeetings(
    @Req() req: any,
    @Query('parent_id') parentId?: string,
    @Query('admin_id') adminId?: string,
    @Query('status') status?: string
  ) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Si parent_id est fourni, récupérer les meetings pour ce parent
    if (parentId) {
      return this.meetingsService.getMeetingsByParentId(parseInt(parentId, 10), status);
    }

    // Si admin_id est fourni, récupérer les meetings pour cet admin
    if (adminId) {
      return this.meetingsService.getMeetingsByAdminId(parseInt(adminId, 10), status);
    }

    // Sinon, récupérer tous les meetings selon le rôle de l'utilisateur
    if (currentUserRole === 'admin') {
      return this.meetingsService.getAllMeetings(status);
    } else if (currentUserRole === 'parent') {
      // Récupérer l'ID du parent depuis l'utilisateur
      const parent = await this.meetingsService.getParentByUserId(currentUserId);
      if (parent) {
        return this.meetingsService.getMeetingsByParentId(parent.id, status);
      }
    }

    return [];
  }
}
