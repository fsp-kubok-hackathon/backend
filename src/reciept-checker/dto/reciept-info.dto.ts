import { RecieptInfoCode } from '../enum/reciept-code.enum';

export interface RecieptInfoDto {
  ok: boolean;
  info: RecieptInfo;
}

export interface RecieptInfo {
  code: RecieptInfoCode;
  first: number;
  data: { json: RecieptData };
  request: RecieptRequest;
}

export interface RecieptRequest {
  qrurl: string;
  qrfile: string;
  qrraw: string;
  manual: Manual;
}

export interface Manual {
  fn: string;
  fd: string;
  fp: string;
  check_time: string;
  type: string;
  sum: string;
}

export interface RecieptData {
  code: number;
  nds0: number;
  user: string;
  items: RecieptItem[];
  region: string;
  userInn: string;
  dateTime: string;
  kktRegId: string;
  metadata: RecieptMetadata;
  operator: string;
  totalSum: number;
  creditSum: number;
  numberKkt: string;
  fiscalSign: number;
  prepaidSum: number;
  retailPlace: string;
  shiftNumber: number;
  cashTotalSum: number;
  provisionSum: number;
  ecashTotalSum: number;
  operationType: number;
  redefine_mask: number;
  requestNumber: number;
  fiscalDriveNumber: string;
  messageFiscalSign: number;
  appliedTaxationType: number;
  fiscalDocumentNumber: number;
  fiscalDocumentFormatVer: number;
}

export interface RecieptMetadata {
  id: number;
  ofdId: string;
  address: string;
  subtype: string;
  receiveDate: string;
}

export interface RecieptItem {
  nds: number;
  sum: number;
  name: string;
  price: number;
  ndsSum: number;
  quantity: number;
  paymentType: number;
  productType: number;
}
