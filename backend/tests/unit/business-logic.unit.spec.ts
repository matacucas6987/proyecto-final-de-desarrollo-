import { ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../src/modules/users/users.service';
import { UsersController } from '../../src/modules/users/users.controller';
import { UserRole } from '../../src/modules/users/enums/user-role.enum';
import { AuthService } from '../../src/modules/auth/auth.service';
import { ResourcesService } from '../../src/modules/resources/resources.service';
import { CollectionType } from '../../src/modules/resources/enums/collection-type.enum';
import { ResourceStatus } from '../../src/modules/resources/enums/resource-status.enum';
import { LoansService } from '../../src/modules/loans/loans.service';
import { LoanStatus } from '../../src/modules/loans/enums/loan-status.enum';
import { RenewalsService } from '../../src/modules/renewals/renewals.service';
import { ReservationsService } from '../../src/modules/reservations/reservations.service';
import { ReservationStatus } from '../../src/modules/reservations/enums/reservation-status.enum';
import { FinesService } from '../../src/modules/fines/fines.service';
import { FineStatus } from '../../src/modules/fines/enums/fine-status.enum';

describe('SIGB Universidad de Madeira - Suite de Pruebas Unitarias (16 Casos)', () => {
  // =========================================================================
  // 1. MÓDULO DE USUARIOS Y RBAC (UT-01 a UT-05)
  // =========================================================================
  describe('Módulo de Usuarios y Control de Acceso (UsersService & UsersController)', () => {
    let usersService: UsersService;
    let usersController: UsersController;
    let mockUserRepo: any;
    let mockJwtService: any;

    beforeEach(() => {
      mockUserRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn((dto) => ({ id: 'uuid-user-new', ...dto })),
        save: jest.fn((entity) => Promise.resolve({ id: 'uuid-user-new', ...entity })),
        remove: jest.fn(),
      };
      mockJwtService = {
        verify: jest.fn(),
        signAsync: jest.fn(),
      };

      usersService = new UsersService(mockUserRepo);
      usersController = new UsersController(usersService, mockJwtService as unknown as JwtService);
    });

    it('UT-01 [Happy Path]: Debe registrar un usuario con código libre (numérico/alfanumérico), hashear contraseña y vincular createdById', async () => {
      // No existe duplicado previo
      mockUserRepo.findOne
        .mockResolvedValueOnce(null) // check duplicate
        .mockResolvedValueOnce({
          id: 'uuid-user-new',
          code: '413',
          identification: '10203040',
          fullName: 'Carlos Mendoza',
          email: 'cmendoza@uma.pt',
          role: UserRole.ESTUDIANTE,
          semester: 3,
          createdById: 'admin-uuid-01',
        });

      const result = await usersService.create(
        {
          identification: '10203040',
          code: '413',
          fullName: 'Carlos Mendoza',
          email: 'CMENDOZA@UMA.PT',
          role: UserRole.ESTUDIANTE,
          semester: 3,
        },
        'admin-uuid-01',
      );

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '413',
          email: 'cmendoza@uma.pt',
          createdById: 'admin-uuid-01',
        }),
      );
      expect(result.code).toBe('413');
      expect(result.createdById).toBe('admin-uuid-01');
    });

    it('UT-02 [Edge Case]: Debe lanzar ConflictException si el código universitario ya se encuentra registrado', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({
        id: 'existing-id',
        code: '413',
        identification: '999999',
        email: 'otro@uma.pt',
      });

      await expect(
        usersService.create({
          identification: '111222',
          code: '413',
          fullName: 'Usuario Duplicado',
          email: 'nuevo@uma.pt',
          role: UserRole.ESTUDIANTE,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('UT-03 [Edge Case]: Debe lanzar ConflictException si el correo institucional o documento de identificación ya existen', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({
        id: 'existing-id',
        code: 'EST99',
        identification: '10203040',
        email: 'duplicado@uma.pt',
      });

      await expect(
        usersService.create({
          identification: '10203040',
          code: 'EST100',
          fullName: 'Otro Estudiante',
          email: 'duplicado@uma.pt',
          role: UserRole.ESTUDIANTE,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('UT-04 [Regla de Negocio RBAC]: Debe lanzar ForbiddenException si un BIBLIOTECARIO intenta registrar un ADMIN o BIBLIOTECARIO', async () => {
      mockJwtService.verify.mockReturnValue({
        id: 'biblio-uuid-1',
        role: UserRole.BIBLIOTECARIO,
      });

      const mockReq: any = {
        headers: { authorization: 'Bearer valid-biblio-token' },
      };

      await expect(
        usersController.create(
          {
            identification: '888888',
            code: 'ADM02',
            fullName: 'Intento Admin',
            email: 'intento@uma.pt',
            role: UserRole.ADMIN,
          },
          mockReq,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('UT-05 [Regla de Negocio RBAC]: Debe lanzar ForbiddenException si un ESTUDIANTE o PROFESOR intenta registrar usuarios', async () => {
      mockJwtService.verify.mockReturnValue({
        id: 'est-uuid-1',
        role: UserRole.ESTUDIANTE,
      });

      const mockReq: any = {
        headers: { authorization: 'Bearer student-token' },
      };

      await expect(
        usersController.create(
          {
            identification: '777777',
            code: 'EST77',
            fullName: 'Alumno Nuevo',
            email: 'alumno77@uma.pt',
            role: UserRole.ESTUDIANTE,
          },
          mockReq,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // =========================================================================
  // 2. MÓDULO DE AUTENTICACIÓN Y SEGURIDAD JWT (UT-06 a UT-08)
  // =========================================================================
  describe('Módulo de Autenticación (AuthService)', () => {
    let authService: AuthService;
    let mockUserRepo: any;
    let mockJwtService: any;

    beforeEach(() => {
      mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('jwt.signed.token.2026'),
      };
      mockUserRepo = {
        createQueryBuilder: jest.fn(),
        findOne: jest.fn(),
      };
      authService = new AuthService(mockUserRepo, mockJwtService as unknown as JwtService);
    });

    it('UT-06 [Happy Path]: Debe validar credenciales válidas y remover el hash de password del objeto retornado', async () => {
      const hashedPassword = await bcrypt.hash('Admin123*', 10);
      const mockQueryBuilder: any = {
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'admin-id-1',
          code: 'ADMIN01',
          email: 'admin@uma.pt',
          fullName: 'Administrador General UMA',
          role: UserRole.ADMIN,
          isActive: true,
          password: hashedPassword,
        }),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = await authService.validateUser('admin@uma.pt', 'Admin123*');

      expect(user.email).toBe('admin@uma.pt');
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.password).toBeUndefined();
    });

    it('UT-07 [Edge Case]: Debe lanzar UnauthorizedException si la contraseña es incorrecta o el usuario está inactivo', async () => {
      const hashedPassword = await bcrypt.hash('Admin123*', 10);
      const mockQueryBuilder: any = {
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'user-id-1',
          code: 'EST01',
          email: 'est01@uma.pt',
          role: UserRole.ESTUDIANTE,
          isActive: true,
          password: hashedPassword,
        }),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(authService.validateUser('est01@uma.pt', 'ClaveErronea')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('UT-08 [Happy Path]: Debe generar accessToken JWT firmado al hacer login exitoso', async () => {
      const hashedPassword = await bcrypt.hash('Madeira2026*', 10);
      const mockQueryBuilder: any = {
        addSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'prof-id-1',
          code: 'PROF01',
          identification: '55443322',
          email: 'profesor@uma.pt',
          fullName: 'Dr. Ricardo Silva',
          role: UserRole.PROFESOR,
          isActive: true,
          password: hashedPassword,
        }),
      };
      mockUserRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const response = await authService.login({
        identifier: 'PROF01',
        password: 'Madeira2026*',
      });

      expect(response.accessToken).toBe('jwt.signed.token.2026');
      expect(response.user.role).toBe(UserRole.PROFESOR);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'PROF01',
          role: UserRole.PROFESOR,
        }),
      );
    });
  });

  // =========================================================================
  // 3. MÓDULO DE RECURSOS Y COLECCIONES POLIMÓRFICAS (UT-09 y UT-10)
  // =========================================================================
  describe('Módulo de Catálogo y Recursos (ResourcesService)', () => {
    let resourcesService: ResourcesService;
    let mockResourceRepo: any;

    beforeEach(() => {
      mockResourceRepo = {
        create: jest.fn((data) => ({ id: 'res-uuid-1', ...data })),
        save: jest.fn((data) => Promise.resolve({ id: 'res-uuid-1', ...data })),
        findOne: jest.fn(),
      };
      resourcesService = new ResourcesService(mockResourceRepo);
    });

    it('UT-09 [Happy Path Polimórfico]: Debe crear un recurso de Tecnoteca asociando sub-entidad techDevice y estado Disponible', async () => {
      const dto = {
        title: 'iPad Pro 12.9 M2',
        code: 'TEC-IPAD-01',
        collection: CollectionType.TECNOTECA,
        location: 'Sala Tecnoteca Piso 2',
        collectionData: {
          deviceType: 'TABLET',
          brand: 'Apple',
          model: 'iPad Pro M2',
          serialNumber: 'SN-APPLE-9988',
          hasCharger: true,
          hasStylus: true,
        },
      };

      const saved = await resourcesService.create(dto as any);

      expect(saved.status).toBe(ResourceStatus.DISPONIBLE);
      expect(saved.techDevice).toBeDefined();
      expect(saved.techDevice?.serialNumber).toBe('SN-APPLE-9988');
    });

    it('UT-10 [Edge Case]: Debe lanzar NotFoundException al buscar o actualizar estado de un recurso inexistente', async () => {
      mockResourceRepo.findOne.mockResolvedValue(null);

      await expect(
        resourcesService.updateStatus('uuid-inexistente', ResourceStatus.PRESTADO),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // 4. MÓDULO DE PRÉSTAMOS Y RENOVACIONES (UT-11 a UT-13)
  // =========================================================================
  describe('Módulo de Préstamos y Renovaciones (LoansService & RenewalsService)', () => {
    let loansService: LoansService;
    let renewalsService: RenewalsService;
    let mockLoanRepo: any;
    let mockResourceRepo: any;
    let mockRenewalRepo: any;

    beforeEach(() => {
      mockLoanRepo = {
        create: jest.fn((data) => ({ id: 'loan-uuid-1', ...data })),
        save: jest.fn((data) => Promise.resolve({ id: 'loan-uuid-1', ...data })),
        findOne: jest.fn(),
      };
      mockResourceRepo = {
        findOne: jest.fn(),
        save: jest.fn((r) => Promise.resolve(r)),
      };
      mockRenewalRepo = {
        count: jest.fn(),
        create: jest.fn((data) => ({ id: 'ren-uuid-1', ...data })),
        save: jest.fn((data) => Promise.resolve({ id: 'ren-uuid-1', ...data })),
      };

      loansService = new LoansService(mockLoanRepo, mockResourceRepo);
      renewalsService = new RenewalsService(mockRenewalRepo, mockLoanRepo);
    });

    it('UT-11 [Regla de Negocio]: Al crear un préstamo debe cambiar automáticamente el estado del recurso a PRESTADO', async () => {
      const mockResource = {
        id: 'res-book-1',
        title: 'Ingeniería de Software - Sommerville',
        status: ResourceStatus.DISPONIBLE,
      };
      mockResourceRepo.findOne.mockResolvedValue(mockResource);

      const loan = await loansService.create({
        userId: 'user-est-1',
        resourceId: 'res-book-1',
        dueDate: '2026-12-01T00:00:00.000Z',
        notes: 'Préstamo académico',
      });

      expect(loan.status).toBe(LoanStatus.ACTIVO);
      expect(mockResource.status).toBe(ResourceStatus.PRESTADO);
      expect(mockResourceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ResourceStatus.PRESTADO }),
      );
    });

    it('UT-12 [Regla de Negocio]: Al registrar devolución debe cambiar el préstamo a DEVUELTO y liberar el recurso a DISPONIBLE', async () => {
      const activeLoan = {
        id: 'loan-uuid-1',
        userId: 'user-est-1',
        resourceId: 'res-book-1',
        status: LoanStatus.ACTIVO,
      };
      const borrowedResource = {
        id: 'res-book-1',
        status: ResourceStatus.PRESTADO,
      };

      mockLoanRepo.findOne.mockResolvedValue(activeLoan);
      mockResourceRepo.findOne.mockResolvedValue(borrowedResource);

      const returned = await loansService.returnResource('loan-uuid-1');

      expect(returned.status).toBe(LoanStatus.DEVUELTO);
      expect(returned.returnDate).toBeInstanceOf(Date);
      expect(borrowedResource.status).toBe(ResourceStatus.DISPONIBLE);
    });

    it('UT-13 [Cálculo de Negocio]: Al renovar un préstamo debe incrementar el contador renewalNumber y actualizar dueDate', async () => {
      const oldDueDate = new Date('2026-11-20T00:00:00.000Z');
      const existingLoan = {
        id: 'loan-uuid-1',
        dueDate: oldDueDate,
        status: LoanStatus.ACTIVO,
      };

      mockLoanRepo.findOne.mockResolvedValue(existingLoan);
      mockRenewalRepo.count.mockResolvedValue(1); // Ya tenía 1 renovación previa

      const renewal = await renewalsService.create({
        loanId: 'loan-uuid-1',
        newDueDate: '2026-11-27T00:00:00.000Z',
      });

      expect(renewal.renewalNumber).toBe(2);
      expect(renewal.previousDueDate).toEqual(oldDueDate);
      expect(existingLoan.dueDate).toEqual(new Date('2026-11-27T00:00:00.000Z'));
    });
  });

  // =========================================================================
  // 5. MÓDULO DE RESERVAS Y MULTAS (UT-14 a UT-16)
  // =========================================================================
  describe('Módulo de Cola de Reservas y Multas (ReservationsService & FinesService)', () => {
    let reservationsService: ReservationsService;
    let finesService: FinesService;
    let mockReservationRepo: any;
    let mockFineRepo: any;

    beforeEach(() => {
      mockReservationRepo = {
        count: jest.fn(),
        create: jest.fn((data) => ({ id: 'rsv-uuid-1', ...data })),
        save: jest.fn((data) => Promise.resolve({ id: 'rsv-uuid-1', ...data })),
        findOne: jest.fn(),
      };
      mockFineRepo = {
        create: jest.fn((data) => ({ id: 'fine-uuid-1', ...data })),
        save: jest.fn((data) => Promise.resolve({ id: 'fine-uuid-1', ...data })),
        findOne: jest.fn(),
      };

      reservationsService = new ReservationsService(mockReservationRepo);
      finesService = new FinesService(mockFineRepo);
    });

    it('UT-14 [Cálculo FIFO de Cola]: Debe asignar queuePosition secuencial según reservas pendientes en la categoría', async () => {
      mockReservationRepo.count.mockResolvedValue(4); // 4 personas esperando en cola de TABLETA

      const rsv = await reservationsService.create({
        userId: 'user-est-1',
        category: 'TABLETA',
      });

      expect(rsv.queuePosition).toBe(5);
      expect(rsv.status).toBe(ReservationStatus.PENDIENTE);
    });

    it('UT-15 [Happy Path]: Debe registrar el pago de una multa cambiando su estado a PAGADA y asignando fecha paidAt', async () => {
      const pendingFine = {
        id: 'fine-uuid-1',
        amount: 15.5,
        daysOverdue: 3,
        status: FineStatus.PENDIENTE,
      };
      mockFineRepo.findOne.mockResolvedValue(pendingFine);

      const paid = await finesService.payFine('fine-uuid-1');

      expect(paid.status).toBe(FineStatus.PAGADA);
      expect(paid.paidAt).toBeInstanceOf(Date);
    });

    it('UT-16 [Happy Path & Edge Case]: Debe condonar una multa a CONDONADA o lanzar NotFoundException si el ID no existe', async () => {
      const pendingFine = {
        id: 'fine-uuid-2',
        amount: 10.0,
        status: FineStatus.PENDIENTE,
      };
      mockFineRepo.findOne.mockResolvedValueOnce(pendingFine);

      const waived = await finesService.waiveFine('fine-uuid-2');
      expect(waived.status).toBe(FineStatus.CONDONADA);

      // Caso de error cuando la multa no existe
      mockFineRepo.findOne.mockResolvedValueOnce(null);
      await expect(finesService.payFine('fine-inexistente')).rejects.toThrow(NotFoundException);
    });
  });
});
