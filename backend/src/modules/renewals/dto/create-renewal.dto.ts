import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRenewalDto {
  @IsNotEmpty()
  @IsUUID()
  loanId: string;

  @IsNotEmpty()
  @IsDateString()
  newDueDate: string;
}
