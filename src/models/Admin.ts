import { IsString, IsUUID, Length } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Admin extends BaseEntity {
  @PrimaryColumn('uuid', { nullable: false })
  @IsUUID()
  public id: string;

  @Column({ nullable: false })
  @Length(1, 12)
  public username: string;

  @Column({ nullable: false })
  @IsString()
  public password: string;
}
