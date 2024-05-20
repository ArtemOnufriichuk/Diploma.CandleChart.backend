import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length
} from 'class-validator';
import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm';
import { SearchParameter, SearchOperation } from '../helpers/filtration';
import { Sortable } from '../helpers/sorting';

@Entity({ name: 'appusers' })
export class User extends BaseEntity {
  @Sortable
  @PrimaryColumn('uuid', { nullable: false })
  @IsUUID()
  public id: string;

  @Sortable
  @SearchParameter([SearchOperation.EQUAL, SearchOperation.LIKE])
  @Column({ nullable: false })
  @Length(4)
  public name: string;

  @Sortable
  @Column({ default: 0, nullable: false, type: 'float' })
  @IsOptional()
  @IsNumber()
  public wallet: number;

  @Sortable
  @SearchParameter([SearchOperation.EQUAL, SearchOperation.LIKE])
  @Column({ nullable: false, unique: true })
  @IsEmail()
  public email: string;

  @Column({ nullable: false })
  @IsString()
  public password: string;

  @Column({ nullable: true })
  @IsUUID()
  @IsOptional()
  public confirmEmailToken: string;

  @Column({ nullable: true })
  @IsUUID()
  @IsOptional()
  public resetPasswordToken: string;

  @Column({ default: false, nullable: false })
  @IsOptional()
  @IsBoolean()
  public confirm: boolean;
}
