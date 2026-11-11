import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    let creatorId = createUserDto.createdById;
    let creatorRole: UserRole | undefined;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload: any = this.jwtService.verify(token);
        creatorId = payload.id || payload.sub;
        creatorRole = payload.role;
      } catch {
        // Token no válido o expirado
      }
    }

    // Validación de permisos por rol institucional
    if (creatorRole === UserRole.BIBLIOTECARIO) {
      if (
        createUserDto.role === UserRole.ADMIN ||
        createUserDto.role === UserRole.BIBLIOTECARIO
      ) {
        throw new ForbiddenException(
          'Los bibliotecarios solo tienen permiso para registrar Estudiantes y Profesores.',
        );
      }
    } else if (
      creatorRole === UserRole.ESTUDIANTE ||
      creatorRole === UserRole.PROFESOR
    ) {
      throw new ForbiddenException(
        'Los estudiantes y profesores no tienen permisos para registrar nuevos usuarios.',
      );
    }

    return await this.usersService.create(createUserDto, creatorId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.usersService.findByCode(code);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
