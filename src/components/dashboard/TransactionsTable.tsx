
"use client";

interface Transaction {
  id: number;
  type: string;
  ref: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  showAll: boolean;
  onToggleShowAll: () => void;
}

export default function TransactionsTable({
  transactions,
  showAll,
  onToggleShowAll,
}: TransactionsTableProps) {
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  const getStatusColor = (status: string) => {
    const colors: any = {
      Completed: "bg-emerald-100 text-emerald-700",
      Pending: "bg-amber-100 text-amber-700",
      Returned: "bg-rose-100 text-rose-700",
      Received: "bg-emerald-100 text-emerald-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      Sale: "text-indigo-600",
      Purchase: "text-blue-600",
      Return: "text-amber-600",
      Payment: "text-emerald-600",
    };
    return colors[type] || "text-gray-600";
  };

  const getStatusDotColor = (status: string) => {
    const colors: any = {
      Completed: "bg-emerald-500",
      Pending: "bg-amber-500",
      Returned: "bg-rose-500",
      Received: "bg-emerald-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Recent Transactions</h3>
          <p className="text-xs text-gray-500">Latest transactions</p>
        </div>
        <button
          onClick={onToggleShowAll}
          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 text-xs font-medium text-gray-500">Type</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500">Reference</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500">Client/Supplier</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-3">
                  <span className={`text-sm font-medium ${getTypeColor(tx.type)}`}>
                    {tx.type}
                  </span>
                </td>
                <td className="py-3 text-sm font-medium text-gray-900">{tx.ref}</td>
                <td className="py-3 text-sm text-gray-600">{tx.client}</td>
                <td
                  className={`py-3 text-sm font-semibold ${
                    tx.amount < 0 ? "text-rose-600" : "text-gray-900"
                  }`}
                >
                  ${Math.abs(tx.amount).toFixed(2)}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md ${getStatusColor(
                      tx.status
                    )}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(tx.status)}`} />
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-500">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}