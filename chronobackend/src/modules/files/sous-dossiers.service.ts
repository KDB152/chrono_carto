import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SousDossier } from './entities/sous-dossier.entity';
import { CreateSousDossierDto } from './dto/create-sous-dossier.dto';

@Injectable()
export class SousDossiersService {
  constructor(
    @InjectRepository(SousDossier)
    private sousDossiersRepository: Repository<SousDossier>,
  ) {}

  async create(createSousDossierDto: CreateSousDossierDto): Promise<SousDossier> {
    const sousDossier = this.sousDossiersRepository.create(createSousDossierDto);
    return this.sousDossiersRepository.save(sousDossier);
  }

  async findByDossier(dossierId: number): Promise<SousDossier[]> {
    if (isNaN(dossierId) || dossierId < 1) {
      throw new BadRequestException('ID de dossier invalide');
    }

    return this.sousDossiersRepository.find({
      where: { dossier_id: dossierId },
      relations: ['fichiers'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SousDossier> {
    if (isNaN(id) || id < 1) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }

    const sousDossier = await this.sousDossiersRepository.findOne({
      where: { id },
      relations: ['fichiers', 'dossier'],
    });

    if (!sousDossier) {
      throw new NotFoundException('Sous-dossier non trouvé');
    }

    return sousDossier;
  }

  async update(id: number, updateData: Partial<CreateSousDossierDto>): Promise<SousDossier> {
    const sousDossier = await this.findOne(id);
    Object.assign(sousDossier, updateData);
    return this.sousDossiersRepository.save(sousDossier);
  }

  async remove(id: number): Promise<void> {
    const sousDossier = await this.findOne(id);
    await this.sousDossiersRepository.remove(sousDossier);
  }
}
