import { IsIn, IsNumber, IsOptional, IsUUID } from 'class-validator';
import moment from 'moment';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ValidationError } from '../helpers/errors';
import { SearchOperation, SearchParameter } from '../helpers/filtration';
import { User } from './User';

@Entity()
export class DepositPreparation extends BaseEntity {
  @PrimaryColumn('uuid', { nullable: false })
  @IsUUID()
  public id: string;

  @ManyToOne(() => User, { cascade: true, nullable: false })
  public user: User;

  @SearchParameter([SearchOperation.EQUAL], {
    validationAndConvert: (value: string) => Number(value)
  })
  @Column({ nullable: false, type: 'float' })
  @IsNumber()
  public amount: number;

  @SearchParameter([SearchOperation.EQUAL])
  @Column({ default: 'READY', nullable: false })
  @IsOptional()
  @IsIn(['PAID', 'READY'])
  public status: string;

  @SearchParameter(
    [
      SearchOperation.GREATER,
      SearchOperation.GREATER_OR_EQUAL,
      SearchOperation.LESS,
      SearchOperation.LESS_OR_EQUAL
    ],
    {
      validationAndConvert: (value: string): Date => {
        const d = moment(value, 'DD-MM-YYYY');
        if (d.isValid()) {
          return d.toDate();
        }
        throw new ValidationError('Date format is invalid');
      }
    }
  )
  @Column({ nullable: false })
  public validTo: Date;
}
