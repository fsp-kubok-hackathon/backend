import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { User } from "@prisma/client";

export enum ReportStatus {
    Proccessing = "PROCESSING",
    Ok = "OK",
    Warning = "WARNING",
}

export class Report {
    @ApiProperty()
    id: string;

    @ApiProperty({ description: "Статус выписки" })
    status: ReportStatus;

    @ApiProperty({ description: "Описание" })
    url: string;

    @ApiProperty({ description: "Пользователь создавший выписку" })
    user: User;

    @ApiProperty({ description: "Дата создания" })
    createdAt: Date;

    @ApiProperty({ description: "Дата обновления" })
    updatedAt: Date;
}

export class ReportFilters extends PartialType(OmitType(Report, ['id', 'user'])) { }