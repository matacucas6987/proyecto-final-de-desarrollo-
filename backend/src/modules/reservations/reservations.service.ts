import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from './enums/reservation-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    // Calcular siguiente posición en la cola
    const count = await this.reservationRepository.count({
      where: {
        category: createReservationDto.category || 'GENERAL',
        status: ReservationStatus.PENDIENTE,
      },
    });

    const reservation = this.reservationRepository.create({
      userId: createReservationDto.userId,
      resourceId: createReservationDto.resourceId,
      category: createReservationDto.category || 'GENERAL',
      queuePosition: count + 1,
      status: ReservationStatus.PENDIENTE,
    });

    return await this.reservationRepository.save(reservation);
  }

  async findAll(status?: ReservationStatus): Promise<Reservation[]> {
    if (status) {
      return await this.reservationRepository.find({
        where: { status },
        order: { queuePosition: 'ASC', reservationDate: 'ASC' },
      });
    }
    return await this.reservationRepository.find({
      order: { queuePosition: 'ASC', reservationDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Reservación con ID ${id} no encontrada`);
    }
    return reservation;
  }

  async cancel(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = ReservationStatus.CANCELADA;
    return await this.reservationRepository.save(reservation);
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = status;
    return await this.reservationRepository.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.remove(reservation);
  }
}
