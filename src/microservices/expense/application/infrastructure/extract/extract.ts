import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "node:path";
import fs from "node:fs";

export type ExpenseExtractProps = {
    referenceMonth: number;
    referenceYear: number;
    data: {
        expenseId: string;
        expenseName: string;
        expenseValue: number;
        dueDate: string;
        paidDate: string;
    }[];
};

export class Extract {
    async generateExpensesExtract(props: ExpenseExtractProps): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();

        const titleColor = rgb(0, 0, 0);
        const dividerColor = rgb(0.8, 0.8, 0.8);

        const helveticaBoldFont = await pdfDoc.embedFont(
            StandardFonts.HelveticaBold,
        );
        const helveticaFont = await pdfDoc.embedFont(
            StandardFonts.HelveticaBold,
        );
        const timesItalicFont = await pdfDoc.embedFont(
            StandardFonts.TimesRomanBold,
        );

        const iconPngPath = path.resolve(
            __dirname,
            "./icons/money-check-dollar-solid.png",
        );
        const iconPngBuffer = fs.readFileSync(iconPngPath);

        const iconImage = await pdfDoc.embedPng(iconPngBuffer);
        const iconWidth = 80;
        const iconHeight = 80;

        const title = `Extrato de Despesas - ${props.referenceMonth.toString().padStart(2, "0")}/${props.referenceYear}`;
        page.drawText(title, {
            x: width / 2 - helveticaBoldFont.widthOfTextAtSize(title, 18) / 2,
            y: height - 50,
            size: 18,
            font: helveticaBoldFont,
            color: titleColor,
        });

        page.drawLine({
            start: { x: 50, y: height - 60 },
            end: { x: width - 50, y: height - 60 },
            thickness: 1,
            color: dividerColor,
        });

        const totalExpenses = props.data.length;
        const paidLate = props.data.filter(
            (expense) => expense.paidDate > expense.dueDate,
        ).length;
        const totalBalance = props.data.reduce(
            (sum, expense) => sum + expense.expenseValue,
            0,
        );

        const summaryY = height - 100;
        page.drawText(`Total de despesas: ${totalExpenses}`, {
            x: 50,
            y: summaryY,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        page.drawImage(iconImage, {
            x: width - 50 - iconWidth - 20,
            y: height - 150,
            width: iconWidth,
            height: iconHeight,
        });

        page.drawText(`Despesas pagas em atraso: ${paidLate}`, {
            x: 50,
            y: summaryY - 20,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
        page.drawText(`Saldo total do mês: R$ ${totalBalance.toFixed(2)}`, {
            x: 50,
            y: summaryY - 40,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        page.drawLine({
            start: { x: 50, y: summaryY - 60 },
            end: { x: width - 50, y: summaryY - 60 },
            thickness: 1,
            color: dividerColor,
        });

        let detailsY = summaryY - 80;
        const tableHeader = [
            "Nome",
            "Valor (R$)",
            "Vencimento",
            "Pago em",
            "Paga com Atraso?",
        ];
        const tableData = props.data.map((expense) => {
            const delay = expense.paidDate > expense.dueDate ? "Sim" : "Não";
            return [
                expense.expenseName,
                expense.expenseValue.toFixed(2),
                expense.dueDate,
                expense.paidDate,
                delay,
            ];
        });

        tableHeader.forEach((text, index) => {
            page.drawText(text, {
                x: 50 + index * 100,
                y: detailsY,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
            });
        });

        detailsY -= 20;

        tableData.forEach((row) => {
            row.forEach((text, index) => {
                page.drawText(text, {
                    x: 50 + index * 100,
                    y: detailsY,
                    size: 10,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
            });
            detailsY -= 20;
        });

        const footerText =
            "Extrato gerado automaticamente - Powered by Minhas Despesas";
        page.drawText(footerText, {
            x: width / 2 - timesItalicFont.widthOfTextAtSize(footerText, 9) / 2,
            y: 30,
            size: 9,
            font: timesItalicFont,
            color: dividerColor,
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }
}
