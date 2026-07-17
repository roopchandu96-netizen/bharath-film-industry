import React from 'react';
import { Download, Printer } from 'lucide-react';

export const exportToCSV = (data: Record<string, any>[], filename: string) => {
    if (!data || !data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const cell = row[header] === null || row[header] === undefined ? '' : row[header];
            return `"${String(cell).replace(/"/g, '""')}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToPDF = (title: string, headers: string[], rows: string[][]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
};

export const ExportButtons = ({ 
    onExportCSV, 
    onExportPDF 
}: { 
    onExportCSV: () => void, 
    onExportPDF: () => void 
}) => {
    return (
        <div className="flex gap-2">
            <button 
                onClick={onExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm"
            >
                <Download size={14} /> CSV
            </button>
            <button 
                onClick={onExportPDF}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm"
            >
                <Printer size={14} /> PDF
            </button>
        </div>
    );
};
