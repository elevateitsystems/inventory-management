// components/dashboard/tabs/ReportsTab.tsx
"use client";

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setReportDate, setReportMonth, setReportYear } from '@/store/slices/clientSlice';
import { BarChart3, FileText, Download, Printer, Calendar } from "lucide-react";

export default function ReportsTab() {
  const dispatch = useAppDispatch();
  
  //  Get state from Redux
  const reportDate = useAppSelector((state) => state.client.reportDate);
  const reportMonth = useAppSelector((state) => state.client.reportMonth);
  const reportYear = useAppSelector((state) => state.client.reportYear);

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (month: string) => {
    if (!month) return '';
    const [year, monthNum] = month.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  // Handlers
  const handleDateChange = () => {
    const today = new Date().toISOString().split('T')[0];
    dispatch(setReportDate(today));
  };

  const handlePrevMonth = () => {
    const [year, month] = reportMonth.split('-').map(Number);
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth === 0) {
      newMonth = 12;
      newYear = year - 1;
    }
    const newMonthStr = newMonth.toString().padStart(2, '0');
    dispatch(setReportMonth(`${newYear}-${newMonthStr}`));
  };

  const handleNextMonth = () => {
    const [year, month] = reportMonth.split('-').map(Number);
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth === 13) {
      newMonth = 1;
      newYear = year + 1;
    }
    const newMonthStr = newMonth.toString().padStart(2, '0');
    dispatch(setReportMonth(`${newYear}-${newMonthStr}`));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">Generate and view inventory reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
            onClick={handleDateChange}
          >
            <Calendar className="w-4 h-4" />
            {formatDate(reportDate)}
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Inventory Report</h3>
              <p className="text-xs text-gray-500">Opening & closing balances</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Opening Balance</span>
              <span className="font-semibold text-gray-900">$45,230.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Stock In</span>
              <span className="font-semibold text-emerald-600">+$12,450.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Stock Out</span>
              <span className="font-semibold text-rose-600">-$8,230.00</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Closing Balance</span>
              <span className="font-bold text-gray-900">$49,450.50</span>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Daily Transactions</h3>
              <p className="text-xs text-gray-500">{formatDate(reportDate)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Sales</span>
              <span className="font-semibold text-gray-900">$3,450.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Purchases</span>
              <span className="font-semibold text-gray-900">$2,100.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Returns</span>
              <span className="font-semibold text-rose-600">-$450.75</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="text-gray-900 font-medium">Net Revenue</span>
              <span className="font-bold text-emerald-600">$899.75</span>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Monthly Report - {formatMonth(reportMonth)}</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <span className="text-sm font-medium text-gray-700">{formatMonth(reportMonth)}</span>
            <button 
              onClick={handleNextMonth}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Total Sales</p>
            <p className="text-lg font-bold text-gray-900">$24,890</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Total Purchases</p>
            <p className="text-lg font-bold text-gray-900">$16,430</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Gross Profit</p>
            <p className="text-lg font-bold text-emerald-600">$8,460</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="text-lg font-bold text-gray-900">342</p>
          </div>
        </div>
      </div>
    </div>
  );
}