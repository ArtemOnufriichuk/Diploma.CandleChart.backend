import { Length } from 'class-validator';

export class UpdatePasswordRequestDto {
  @Length(8, 21)
  public password: string;

  constructor(body: any) {
    this.password = body.password;
  }
}
