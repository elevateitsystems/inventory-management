export type ReportCell = string | number;

export interface ReportExportData {
  title: string;
  subtitle: string;
  filename: string;
  columns: string[];
  rows: ReportCell[][];
}

export async function exportReportPdf(report: ReportExportData) {
  const { jsPDF } = await import("jspdf");
  const landscape = report.columns.length > 5;
  const pdf = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 14;
  const tableWidth = width - margin * 2;
  const columnWidth = tableWidth / report.columns.length;
  const primary = [79, 70, 229] as const;
  const dark = [15, 23, 42] as const;
  const muted = [100, 116, 139] as const;
  const light = [226, 232, 240] as const;
  let page = 1;

  const drawHeader = () => {
    pdf.setTextColor(...dark);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("StockFlow", margin, 16);
    pdf.setTextColor(...muted);
    pdf.setFontSize(6.5);
    pdf.text("INVENTORY MANAGEMENT", margin, 21);
    pdf.setTextColor(...dark);
    pdf.setFontSize(report.title.length > 28 ? 15 : 19);
    pdf.text(report.title.toUpperCase(), width - margin, 18, {
      align: "right",
    });
    pdf.setFillColor(...primary);
    pdf.rect(0, 27, width, 3, "F");
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text(report.subtitle, margin, 39);
    pdf.text(
      `Generated ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date())}`,
      width - margin,
      39,
      { align: "right" },
    );
  };

  const drawTableHeader = (y: number) => {
    pdf.setFillColor(...dark);
    pdf.rect(margin, y, tableWidth, 9, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(report.columns.length > 6 ? 6 : 7);
    report.columns.forEach((column, index) => {
      pdf.text(
        pdf.splitTextToSize(column, columnWidth - 4),
        margin + index * columnWidth + 2,
        y + 5.5,
      );
    });
  };

  const drawFooter = () => {
    pdf.setDrawColor(...primary);
    pdf.setLineWidth(0.7);
    pdf.line(margin, height - 12, width - margin, height - 12);
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6);
    pdf.text("STOCKFLOW · INVENTORY REPORT", margin, height - 7);
    pdf.text(`PAGE ${page}`, width - margin, height - 7, { align: "right" });
  };

  drawHeader();
  let y = 48;
  drawTableHeader(y);
  y += 9;
  pdf.setDrawColor(...light);
  pdf.setLineWidth(0.25);
  report.rows.forEach((row) => {
    const wrapped = report.columns.map((_, index) =>
      pdf.splitTextToSize(formatCell(row[index]), columnWidth - 4),
    );
    const lineCount = Math.max(1, ...wrapped.map((cell) => cell.length));
    const rowHeight = Math.max(8, lineCount * 3.5 + 3);
    if (y + rowHeight > height - 17) {
      drawFooter();
      pdf.addPage();
      page += 1;
      drawHeader();
      y = 48;
      drawTableHeader(y);
      y += 9;
    }
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(report.columns.length > 6 ? 6 : 7);
    wrapped.forEach((cell, index) => {
      const color = index === 0 ? dark : muted;
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(cell, margin + index * columnWidth + 2, y + 4.8);
    });
    pdf.line(margin, y + rowHeight, width - margin, y + rowHeight);
    y += rowHeight;
  });
  if (!report.rows.length) {
    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("No records found for this report.", margin + 2, y + 11);
  }
  drawFooter();
  pdf.save(`${report.filename}.pdf`);
}

export function exportReportExcel(report: ReportExportData) {
  const rows = [report.columns, ...report.rows]
    .map(
      (row, rowIndex) =>
        `<Row>${row
          .map((cell) => {
            const numeric = typeof cell === "number" && Number.isFinite(cell);
            return `<Cell${rowIndex === 0 ? ' ss:StyleID="Header"' : ""}><Data ss:Type="${numeric ? "Number" : "String"}">${escapeXml(String(cell ?? ""))}</Data></Cell>`;
          })
          .join("")}</Row>`,
    )
    .join("");
  const worksheetName = report.title.replace(/[\\/?*\[\]:]/g, " ").slice(0, 31);
  const workbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles><Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#4F46E5" ss:Pattern="Solid"/></Style></Styles>
  <Worksheet ss:Name="${escapeXml(worksheetName)}"><Table>${rows}</Table></Worksheet>
</Workbook>`;
  downloadBlob(
    new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" }),
    `${report.filename}.xls`,
  );
}

export function printReport(report: ReportExportData) {
  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) throw new Error("Print window was blocked");
  popup.opener = null;
  const header = report.columns
    .map((column) => `<th>${escapeHtml(column)}</th>`)
    .join("");
  const rows = report.rows.length
    ? report.rows
        .map(
          (row) =>
            `<tr>${report.columns
              .map(
                (_, index) => `<td>${escapeHtml(formatCell(row[index]))}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("")
    : `<tr><td colspan="${report.columns.length}" class="empty">No records found for this report.</td></tr>`;
  popup.document
    .write(`<!doctype html><html><head><title>${escapeHtml(report.title)}</title><style>
    @page{size:auto;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#0f172a;margin:0}header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:5px solid #4f46e5;padding-bottom:14px;margin-bottom:18px}.brand{font-size:22px;font-weight:800}.tag{font-size:9px;letter-spacing:2px;color:#64748b}.title{text-align:right}h1{font-size:24px;margin:0;text-transform:uppercase}.subtitle{font-size:11px;color:#64748b;margin-top:5px}table{width:100%;border-collapse:collapse;font-size:10px}th{background:#0f172a;color:white;text-align:left;padding:9px 7px}td{padding:8px 7px;border-bottom:1px solid #e2e8f0;vertical-align:top}.empty{text-align:center;color:#94a3b8;padding:30px}.generated{margin-top:15px;text-align:right;font-size:9px;color:#94a3b8}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><header><div><div class="brand">StockFlow</div><div class="tag">INVENTORY MANAGEMENT</div></div><div class="title"><h1>${escapeHtml(report.title)}</h1><div class="subtitle">${escapeHtml(report.subtitle)}</div></div></header><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table><div class="generated">Generated ${escapeHtml(new Date().toLocaleString())}</div></body></html>`);
  popup.document.close();
  popup.focus();
  popup.setTimeout(() => popup.print(), 250);
}

function formatCell(cell: ReportCell | undefined) {
  if (typeof cell === "number") return cell.toLocaleString("en-US");
  return String(cell ?? "");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function escapeHtml(value: string) {
  return escapeXml(value);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
