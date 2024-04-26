import { ApiProperty } from "@nestjs/swagger";

export class CreateReportDto {
    @ApiProperty()
    url: string;
}
