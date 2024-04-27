import { ApiProperty } from '@nestjs/swagger';

export class ReportItem {
  @ApiProperty()
  id: number;

  @ApiProperty()
  approved?: boolean;

  @ApiProperty()
  accountNumber: string;
  @ApiProperty()
  txId: string;
  @ApiProperty()
  operationType: string;
  @ApiProperty()
  category: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  authDate: Date;
  @ApiProperty()
  txDate: Date;
  @ApiProperty()
  currency: number;
  @ApiProperty()
  sum: number;
  @ApiProperty()
  counterparty: string;
  @ApiProperty()
  counterpartyINN: string;
  @ApiProperty()
  counterpartyKPP: string;
  @ApiProperty()
  counterpartyAccount: string;
  @ApiProperty()
  counterpartyBik: string;
  @ApiProperty()
  corrAccount: string;
  @ApiProperty()
  purpose: string;
  @ApiProperty()
  cardNo: string;
  @ApiProperty()
  MCC: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  city: string;

  @ApiProperty()
  reportId: string;
}
