import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'El documento de identificación es obligatorio.' })
  @IsString({ message: 'El documento de identificación debe ser una cadena de texto.' })
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value).trim() : value))
  identification: string;

  @IsNotEmpty({ message: 'El código universitario es obligatorio.' })
  @IsString({ message: 'El código universitario debe ser una cadena de texto o numérico.' })
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value).trim() : value))
  code: string;

  @IsNotEmpty({ message: 'El nombre completo es obligatorio.' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto.' })
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value).trim() : value))
  fullName: string;

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida.' })
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value).trim().toLowerCase() : value))
  email: string;

  @IsNotEmpty({ message: 'El rol institucional es obligatorio.' })
  @IsEnum(UserRole, {
    message: 'El rol debe ser ESTUDIANTE, PROFESOR, BIBLIOTECARIO o ADMIN.',
  })
  role: UserRole;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  academicPlan?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El semestre debe ser un número entero.' })
  @Min(1, { message: 'El semestre debe ser mayor o igual a 1.' })
  semester?: number;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  password?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
