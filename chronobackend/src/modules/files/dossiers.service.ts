import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dossier } from './entities/dossier.entity';
import { CreateDossierDto } from './dto/create-dossier.dto';

@Injectable()
export class DossiersService {
  constructor(
    @InjectRepository(Dossier)
    private dossiersRepository: Repository<Dossier>,
  ) {}

  async create(createDossierDto: CreateDossierDto): Promise<Dossier> {
    const dossier = this.dossiersRepository.create(createDossierDto);
    return this.dossiersRepository.save(dossier);
  }

  async findAll(): Promise<Dossier[]> {
    return this.dossiersRepository.find({
      relations: ['sous_dossiers'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Dossier> {
    if (isNaN(id) || id < 1) {
      throw new BadRequestException('ID de dossier invalide');
    }

    const dossier = await this.dossiersRepository.findOne({
      where: { id },
      relations: ['sous_dossiers', 'sous_dossiers.fichiers'],
    });

    if (!dossier) {
      throw new NotFoundException('Dossier non trouvé');
    }

    return dossier;
  }

  async update(id: number, updateData: Partial<CreateDossierDto>): Promise<Dossier> {
    const dossier = await this.findOne(id);
    Object.assign(dossier, updateData);
    return this.dossiersRepository.save(dossier);
  }

  async remove(id: number): Promise<void> {
    const dossier = await this.findOne(id);
    await this.dossiersRepository.remove(dossier);
  }
}
