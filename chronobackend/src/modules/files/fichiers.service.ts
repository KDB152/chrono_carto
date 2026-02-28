import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fichier } from './entities/fichier.entity';
import { CreateFichierDto } from './dto/create-fichier.dto';

@Injectable()
export class FichiersService {
  constructor(
    @InjectRepository(Fichier)
    private fichiersRepository: Repository<Fichier>,
  ) {}

  async create(createFichierDto: CreateFichierDto): Promise<Fichier> {
    const fichier = this.fichiersRepository.create(createFichierDto);
    return this.fichiersRepository.save(fichier);
  }

  async findBySousDossier(sousDossierId: number): Promise<Fichier[]> {
    if (isNaN(sousDossierId) || sousDossierId < 1) {
      throw new BadRequestException('ID de sous-dossier invalide');
    }

    return this.fichiersRepository.find({
      where: { sous_dossier_id: sousDossierId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Fichier> {
    if (isNaN(id) || id < 1) {
      throw new BadRequestException('ID de fichier invalide');
    }

    const fichier = await this.fichiersRepository.findOne({
      where: { id },
      relations: ['sous_dossier'],
    });

    if (!fichier) {
      throw new NotFoundException('Fichier non trouvé');
    }

    return fichier;
  }

  async update(id: number, updateData: Partial<CreateFichierDto>): Promise<Fichier> {
    const fichier = await this.findOne(id);
    Object.assign(fichier, updateData);
    return this.fichiersRepository.save(fichier);
  }

  async remove(id: number): Promise<void> {
    const fichier = await this.findOne(id);
    await this.fichiersRepository.remove(fichier);
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await this.fichiersRepository.increment({ id }, 'download_count', 1);
  }
}
