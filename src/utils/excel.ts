import { get } from "http"
import { Transform } from "stream"
import internal from "stream"
import { Row, Workbook } from "exceljs"
import { ReportItem } from "src/report/entities/report.item.entity"

export const streamFromUrl = async (url: string) => {
    const stream = new Transform()
    stream._transform = function (chunk, encoding, callback) {
        this.push(chunk)
        callback()
    }
    const _ = get(url, (res) => {
        res.pipe(stream);
    })


    return stream;
}

export const readToExcel = async (stream: Transform): Promise<Omit<ReportItem, 'id'>[]> => {
    const workbook = new Workbook();
    const _ = await workbook.xlsx.read(stream);
    if (workbook.worksheets.length != 1)
        throw new Error("Invalid excel file");
    const reports: Omit<ReportItem, 'id'>[] = []
    for (let i = 3; i <= workbook.worksheets[0].rowCount; i++) {
        const row = workbook.worksheets[0].getRow(i)
        reports.push({
            reportId: "",
            accountNumber: row.getCell(1).text,
            txId: row.getCell(2).text,
            operationType: row.getCell(3).text,
            category: row.getCell(4).text,
            status: row.getCell(5).text,
            authDate: new Date(row.getCell(7).text),
            txDate: new Date(row.getCell(8).text),
            currency: Number(row.getCell(11)),
            sum: Number.parseFloat(row.getCell(12).text),
            counterparty: row.getCell(13).text,
            counterpartyINN: row.getCell(14).text,
            counterpartyKPP: row.getCell(15).text,
            counterpartyAccount: row.getCell(16).text,
            counterpartyBik: row.getCell(17).text,
            corrAccount: row.getCell(18).text,
            purpose: row.getCell(20).text,
            cardNo: row.getCell(24).text,
            MCC: row.getCell(25).text,
            country: row.getCell(26).text,
            city: row.getCell(27).text,
        })
    }
    stream.destroy()

    return reports
}