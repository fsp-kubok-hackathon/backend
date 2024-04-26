export class ReportItem {
    id: number;

    accountNumber: string
    txId: string
    operationType: string
    category: string
    status: string
    authDate: Date
    txDate: Date
    currency: number
    sum: number
    counterparty: string
    counterpartyINN: string
    counterpartyKPP: string
    counterpartyAccount: string
    counterpartyBik: string
    corrAccount: string
    purpose: string
    cardNo: string
    MCC: string
    country: string
    city: string

    reportId: string;
}