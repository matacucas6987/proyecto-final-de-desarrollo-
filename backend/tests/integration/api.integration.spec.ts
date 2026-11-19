import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AllExceptionsFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';

describe('SIGB Universidad de Madeira - Suite de Pruebas de Integración (8 Casos E2E/API)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminId: string;
  let createdLibrarianId: string;
  let librarianToken: string;
  let createdResourceId: string;
  let createdLoanId: string;
  let createdReservationId: string;

  const uniqueSuffix = Date.now().toString().slice(-6);
  const testLibCode = `BIB_IT_${uniqueSuffix}`;
  const testLibEmail = `bib_it_${uniqueSuffix}@uma.pt`;
  const testResCode = `LIB-IT-${uniqueSuffix}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  }, 30000);

  afterAll(async () => {
    // Limpieza de datos temporales creados durante la prueba de integración
    if (app && adminToken) {
      if (createdReservationId) {
        await request(app.getHttpServer())
          .delete(`/api/reservations/${createdReservationId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
      if (createdResourceId) {
        await request(app.getHttpServer())
          .delete(`/api/resources/${createdResourceId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
      if (createdLibrarianId) {
        await request(app.getHttpServer())
          .delete(`/api/users/${createdLibrarianId}`)
          .set('Authorization', `Bearer ${adminToken}`);
      }
    }
    if (app) {
      await app.close();
    }
  }, 30000);

  it('IT-01 [Auth + JWT + DB]: Debe autenticar al Administrador (POST /api/auth/login) y validar su perfil con token Bearer (GET /api/auth/me)', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: 'admin@uma.pt',
        password: 'Admin123*',
      })
      .expect(201);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.body.data.user.role).toBe('ADMIN');

    adminToken = loginRes.body.data.accessToken;
    adminId = loginRes.body.data.user.id;

    const meRes = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(meRes.body.data.email).toBe('admin@uma.pt');
    expect(meRes.body.data.code).toBe('ADMIN01');
  });

  it('IT-02 [Auth Seguridad]: Debe rechazar credenciales inválidas con 401 Unauthorized y peticiones sin token a rutas protegidas', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: 'admin@uma.pt',
        password: 'WrongPassword999',
      })
      .expect(401);

    await request(app.getHttpServer())
      .get('/api/auth/profile')
      .expect(401);
  });

  it('IT-03 [Usuarios + Auditoría DB]: El Administrador debe registrar un Bibliotecario y persistir la relación createdBy en PostgreSQL', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        identification: `ID_${uniqueSuffix}`,
        code: testLibCode,
        fullName: 'Bibliotecario Integración UMA',
        email: testLibEmail,
        password: 'BiblioPass2026*',
        role: 'BIBLIOTECARIO',
        academicPlan: 'Gestión Bibliotecaria',
      })
      .expect(201);

    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.code).toBe(testLibCode);
    expect(createRes.body.data.createdById).toBe(adminId);
    expect(createRes.body.data.createdBy.email).toBe('admin@uma.pt');

    createdLibrarianId = createRes.body.data.id;
  });

  it('IT-04 [RBAC Jerarquía]: El Bibliotecario recién registrado puede iniciar sesión pero recibe 403 Forbidden si intenta crear un ADMIN', async () => {
    const libLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        identifier: testLibCode,
        password: 'BiblioPass2026*',
      })
      .expect(201);

    librarianToken = libLogin.body.data.accessToken;
    expect(libLogin.body.data.user.role).toBe('BIBLIOTECARIO');

    // Intento prohibido de crear un Administrador siendo Bibliotecario
    await request(app.getHttpServer())
      .post('/api/users')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        identification: `ADM_FAIL_${uniqueSuffix}`,
        code: `ADM_FAIL_${uniqueSuffix}`,
        fullName: 'Admin No Autorizado',
        email: `adm_fail_${uniqueSuffix}@uma.pt`,
        role: 'ADMIN',
      })
      .expect(403);
  });

  it('IT-05 [Catálogo Polimórfico]: Debe crear un libro en Colección General con su sub-entidad GeneralBook y consultarlo en el catálogo', async () => {
    const resCreate = await request(app.getHttpServer())
      .post('/api/resources')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        title: 'Arquitectura Limpia - Prueba Integración',
        code: testResCode,
        collection: 'General',
        location: 'Estante B-12',
        collectionData: {
          author: 'Robert C. Martin',
          isbn: `978-${uniqueSuffix}`,
          publisher: 'Prentice Hall',
          publicationYear: 2024,
          edition: '1ra Edición',
          pages: 432,
        },
      })
      .expect(201);

    expect(resCreate.body.data.code).toBe(testResCode);
    expect(resCreate.body.data.status).toBe('Disponible');
    expect(resCreate.body.data.generalBook.author).toBe('Robert C. Martin');

    createdResourceId = resCreate.body.data.id;
  });

  it('IT-06 [Circulación Multi-Módulo: Préstamo -> Estado Recurso -> Renovación -> Devolución]: Debe coordinar estados entre Loans, Resources y Renewals', async () => {
    const dueDate = new Date(Date.now() + 7 * 86400000).toISOString();

    // 1. Crear préstamo
    const loanRes = await request(app.getHttpServer())
      .post('/api/loans')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        userId: createdLibrarianId,
        resourceId: createdResourceId,
        dueDate,
        notes: 'Préstamo de prueba de integración',
      })
      .expect(201);

    createdLoanId = loanRes.body.data.id;
    expect(loanRes.body.data.status).toBe('ACTIVO');

    // 2. Verificar que el recurso cambió automáticamente a "Prestado"
    const checkResource = await request(app.getHttpServer())
      .get(`/api/resources/${createdResourceId}`)
      .expect(200);
    expect(checkResource.body.data.status).toBe('Prestado');

    // 3. Renovar el préstamo
    const newDueDate = new Date(Date.now() + 14 * 86400000).toISOString();
    const renewalRes = await request(app.getHttpServer())
      .post('/api/renewals')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        loanId: createdLoanId,
        newDueDate,
      })
      .expect(201);

    expect(renewalRes.body.data.renewalNumber).toBe(1);

    // 4. Registrar devolución del préstamo
    const returnRes = await request(app.getHttpServer())
      .patch(`/api/loans/${createdLoanId}/return`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .expect(200);

    expect(returnRes.body.data.status).toBe('DEVUELTO');

    // 5. Verificar que el recurso volvió a "Disponible"
    const checkAvailable = await request(app.getHttpServer())
      .get(`/api/resources/${createdResourceId}`)
      .expect(200);
    expect(checkAvailable.body.data.status).toBe('Disponible');
  });

  it('IT-07 [Cola de Reservas FIFO]: Debe encolar una reserva con posición calculada y permitir su cancelación', async () => {
    const rsvRes = await request(app.getHttpServer())
      .post('/api/reservations')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        userId: createdLibrarianId,
        resourceId: createdResourceId,
        category: 'GENERAL',
      })
      .expect(201);

    createdReservationId = rsvRes.body.data.id;
    expect(rsvRes.body.data.status).toBe('PENDIENTE');
    expect(rsvRes.body.data.queuePosition).toBeGreaterThanOrEqual(1);

    const cancelRes = await request(app.getHttpServer())
      .patch(`/api/reservations/${createdReservationId}/cancel`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .expect(200);

    expect(cancelRes.body.data.status).toBe('CANCELADA');
  });

  it('IT-08 [Multas y Moras]: Debe emitir una multa por mora y procesar tanto su pago como consulta de estado', async () => {
    const fineRes = await request(app.getHttpServer())
      .post('/api/fines')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        userId: createdLibrarianId,
        loanId: createdLoanId,
        daysOverdue: 2,
        amount: 8.5,
        reason: 'Entrega tardía prueba integración',
      })
      .expect(201);

    const fineId = fineRes.body.data.id;
    expect(fineRes.body.data.status).toBe('PENDIENTE');

    const payRes = await request(app.getHttpServer())
      .patch(`/api/fines/${fineId}/pay`)
      .set('Authorization', `Bearer ${librarianToken}`)
      .expect(200);

    expect(payRes.body.data.status).toBe('PAGADA');
    expect(payRes.body.data.paidAt).toBeDefined();
  });
});
