import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('rendez-vous')
@UseGuards(JwtAuthGuard)
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  @Get()
  async getRendezVous(
    @Req() req: any,
    @Query('parentId') parentId?: string,
    @Query('status') status?: string
  ) {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Si parentId est fourni, r√©cup√©rer les rendez-vous pour ce parent
    if (parentId) {
      return this.rendezVousService.getRendezVousByParentId(parentId, status);
    }

    // Sinon, r√©cup√©rer tous les rendez-vous selon le r√¥le de l'utilisateur
    if (currentUserRole === 'admin') {
      return this.rendezVousService.getAllRendezVous(status);
    } else if (currentUserRole === 'parent') {
      // Pour les parents, r√©cup√©rer leurs propres rendez-vous
      return this.rendezVousService.getRendezVousByParentId(currentUserId.toString(), status);
    }

    return [];
  }

  @Post()
  async createRendezVous(
    @Body() createData: {
      parentId: string;
      parentName: string;
      parentEmail: string;
      parentPhone: string;
      childName: string;
      childClass: string;
      timing: string;
      parentReason: string;
      childId?: number;
    },
    @Req() req: any
  ) {
    console.log('Ì†ΩÌ¥ç Creating rendez-vous with data:', createData);
    
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Seuls les parents peuvent cr√©er des rendez-vous
    if (currentUserRole !== 'parent') {
      throw new Error('Seuls les parents peuvent cr√©er des rendez-vous');
    }

    return this.rendezVousService.createRendezVous(createData);
  }

  @Put(':id')
  async updateRendezVous(
    @Param('id') id: string,
    @Body() updateData: { status: string; adminReason?: string; updatedAt?: string },
    @Req() req: any
  ) {
    const currentUserRole = req.user.role;

    // Seul l'admin peut modifier les rendez-vous
    if (currentUserRole !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent modifier les rendez-vous');
    }

    return this.rendezVousService.updateRendezVous(parseInt(id), updateData);
  }

  @Delete(':id')
  async deleteRendezVous(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const currentUserRole = req.user.role;

    // Seul l'admin peut supprimer les rendez-vous
    if (currentUserRole !== 'admin') {
      throw new Error('Seuls les administrateurs peuvent supprimer les rendez-vous');
    }

    return this.rendezVousService.deleteRendezVous(parseInt(id));
  }
}
