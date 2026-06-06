import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProjectDto {
  @IsString() name!: string;
  @IsString() @IsOptional() client?: string;
  @IsNumber() @IsOptional() contractAmount?: number;
}
