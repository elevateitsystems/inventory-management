
"use client";

export default function StockMovementChart() {
  const data = [
    { day: "Mon", in: 120, out: 80 },
    { day: "Tue", in: 150, out: 100 },
    { day: "Wed", in: 90, out: 130 },
    { day: "Thu", in: 180, out: 110 },
    { day: "Fri", in: 200, out: 150 },
    { day: "Sat", in: 100, out: 70 },
    { day: "Sun", in: 60, out: 40 },
  ];

  const maxVal = 250;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Stock Movement</h3>
          <p className="text-xs text-gray-500">Weekly stock in/out</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-indigo-600" />
            <span className="text-xs text-gray-600">Stock In</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amber-400" />
            <span className="text-xs text-gray-600">Stock Out</span>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-4 h-48">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-40">
              <div
                className="w-full max-w-[32px] rounded-t-sm bg-amber-400"
                style={{ height: `${(d.out / maxVal) * 100}%` }}
              />
              <div
                className="w-full max-w-[32px] bg-indigo-600 rounded-t-sm"
                style={{ height: `${(d.in / maxVal) * 100}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}