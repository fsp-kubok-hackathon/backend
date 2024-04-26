import { ApiProperty } from "@nestjs/swagger";

export default class Pagination {
    @ApiProperty()
    offset: number;

    @ApiProperty()
    limit: number;
}