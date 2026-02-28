import { Controller, Get, Param, Query, Put, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: string) {
    if (role) {
      return this.usersService.findByRole(role);
    }
    return this.usersService.findAll();
  }

  @Get('debug/all')
  async debugAllUsers() {
    console.log('?? Debug: Listing all users with their IDs');
    const users = await this.usersService.findAll();
    console.log('?? All users:', users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email })));
    return users;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id));
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    console.log('?? PUT /users/:id called with id:', id, 'and data:', updateData);
    console.log('?? Phone fields in updateData:', {
      phone: updateData.phone,
      phone_number: updateData.phone_number,
      'phone_number || phone': updateData.phone_number || updateData.phone
    });
    
    try {
      const userId = parseInt(id);
      if (isNaN(userId)) {
        console.error('?? Invalid user ID:', id);
        throw new Error('ID utilisateur invalide');
      }

      // Préparer les données de mise à jour
      const userUpdateData: any = {
        // Champs User
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        email: updateData.email,
        phone: updateData.phone_number || updateData.phone,
        is_active: updateData.isActive,
        is_approved: updateData.isApproved,
        email_verified: updateData.emailVerified,
        last_login: updateData.last_login,
        
        // Champs Student (passés au service pour mise à jour de l'entité Student)
        classLevel: updateData.classLevel,
        birthDate: updateData.birthDate,
        
        // Champs Parent (passés au service pour mise à jour de l'entité Parent)
        phone_number: updateData.phone_number || updateData.phone,
        address: updateData.address,
        occupation: updateData.occupation,
      };

      // Note: Les champs parent/enfant ne sont pas stockés dans l'entité User
      // Ils seront gérés via les entités Student et Parent séparément
      // Les champs classLevel et birthDate sont passés pour mise à jour de l'entité Student

      console.log('?? Updating user with data:', userUpdateData);
      
      const result = await this.usersService.update(userId, userUpdateData);
      console.log('?? User updated successfully:', result);
      
      // Récupérer l'utilisateur mis à jour pour le retourner
      const updatedUser = await this.usersService.findById(userId);
      console.log('?? Final updated user:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('?? Error updating user:', error);
      console.error('?? Error stack:', error.stack);
      console.error('?? Error message:', error.message);
      throw error;
    }
  }
}