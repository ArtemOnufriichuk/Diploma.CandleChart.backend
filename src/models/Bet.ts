import { IsDate, IsIn, IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { SearchOperation, SearchParameter } from '../helpers/filtration';
import { User } from './User';

@Entity()
export class Bet extends BaseEntity {
  @PrimaryColumn('uuid', { nullable: false })
  @IsUUID()
  public id: string;

  @ManyToOne(() => User, { cascade: true, nullable: false })
  public user: User;

  @SearchParameter([SearchOperation.EQUAL])
  @Column({ nullable: false })
  @IsIn([
    'bitcoin',
    'binance',
    'dash',
    'dogecoin',
    'ethereum',
    'litecoin',
    'monero',
    'bitcoinCash',
    'ripple',
    'zcash'
  ])
  public pair: string;

  @Column({ default: 60, nullable: false }) // 1 min
  @IsOptional()
  @IsInt()
  public seconds: number;

  @SearchParameter([SearchOperation.EQUAL])
  @Column({ nullable: false })
  @IsIn(['UP', 'DOWN'])
  public direction: string;

  @Column({ nullable: false, type: 'float' })
  @IsNumber()
  public priceToBet: number;

  @Column({ nullable: true, type: 'float' })
  @IsNumber()
  @IsOptional()
  public moneyGet: number;

  @Column({ nullable: false, type: 'float' })
  @IsNumber()
  public priceOpen: number;

  @SearchParameter([SearchOperation.NOT_EQUAL, SearchOperation.EQUAL], {
    validationAndConvert: (value: string) => {
      if (value === '\\null') {
        return null;
      }
      return value;
    }
  })
  @Column({ nullable: true, type: 'float' })
  @IsNumber()
  @IsOptional()
  public priceClose: number;

  @Column({ nullable: false })
  @Max(100)
  @Min(1)
  public profit: number;

  @Column({ nullable: false })
  @IsDate()
  public dateOpen: Date;

  @Column({ nullable: true })
  @IsDate()
  public dateClose: Date;
}
