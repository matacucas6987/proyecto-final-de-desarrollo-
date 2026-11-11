import {
  Injectable,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  /**
   * Asegura la existencia del Administrador inicial requerido por la Universidad de Madeira
   */
  async seedAdminUser() {
    try {
      const adminEmail = 'admin@uma.pt';
      const adminCode = 'ADMIN01';

      let admin = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('LOWER(user.email) = :email OR user.code = :code', {
          email: adminEmail.toLowerCase(),
          code: adminCode,
        })
        .getOne();

      const defaultAdminPass = 'Admin123*';
      const hashedPassword = await bcrypt.hash(defaultAdminPass, 10);

      if (!admin) {
        admin = this.userRepository.create({
          identification: '00000001',
          code: adminCode,
          fullName: 'Administrador General UMA',
          email: adminEmail,
          role: UserRole.ADMIN,
          academicPlan: 'Dirección de Biblioteca',
          password: hashedPassword,
          isActive: true,
        });
        await this.userRepository.save(admin);
        this.logger.log('✅ Usuario Administrador inicial creado con éxito: admin@uma.pt / Admin123*');
      } else if (!admin.password) {
        // Si existe pero no tenía contraseña definida previamente
        admin.password = hashedPassword;
        await this.userRepository.save(admin);
        this.logger.log('🔑 Contraseña actualizada para Administrador: admin@uma.pt / Admin123*');
      }

      // Asegurar que los usuarios legados sin contraseña tengan una contraseña por defecto
      const usersWithoutPassword = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('user.password IS NULL')
        .getMany();

      if (usersWithoutPassword.length > 0) {
        const defaultUserPass = await bcrypt.hash('Madeira2026*', 10);
        for (const u of usersWithoutPassword) {
          u.password = defaultUserPass;
          await this.userRepository.save(u);
        }
        this.logger.log(`🔑 Contraseña por defecto (Madeira2026*) asignada a ${usersWithoutPassword.length} usuarios existentes.`);
      }
    } catch (err: any) {
      this.logger.error('Error al inicializar seed de usuario administrador:', err?.message || err);
    }
  }

  async validateUser(identifier: string, pass: string): Promise<User> {
    const clean = identifier.trim().toLowerCase();

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.createdBy', 'createdBy')
      .where('LOWER(user.email) = :clean OR LOWER(user.code) = :clean', { clean })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas. El usuario o correo no existe.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('La cuenta de usuario se encuentra inactiva. Contacte al administrador.');
    }

    if (!user.password) {
      throw new UnauthorizedException('La cuenta no tiene contraseña configurada. Contacte al administrador.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    // Remover password del objeto devuelto
    delete user.password;
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.identifier, loginDto.password);

    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      code: user.code,
      fullName: user.fullName,
      role: user.role,
      identification: user.identification,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user,
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['createdBy'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    delete user.password;
    return user;
  }
}
