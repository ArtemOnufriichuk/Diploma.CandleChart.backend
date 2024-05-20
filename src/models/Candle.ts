import { IsIn, IsInt, IsNumber, IsUUID } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class CandleEntity extends BaseEntity {
  @PrimaryColumn('uuid', { nullable: false })
  @IsUUID()
  public id: string;

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
  @Column({ nullable: false })
  public pair: string;

  @IsNumber()
  @Column({ nullable: false, type: 'float' })
  public open: number;

  @IsNumber()
  @Column({ nullable: false, type: 'float' })
  public low: number;

  @IsNumber()
  @Column({ nullable: false, type: 'float' })
  public high: number;

  @IsNumber()
  @Column({ nullable: false, type: 'float' })
  public close: number;

  @IsInt()
  @Column({ nullable: false })
  public time: number;

  @IsInt()
  @Column({ nullable: false })
  public value: number;
}
