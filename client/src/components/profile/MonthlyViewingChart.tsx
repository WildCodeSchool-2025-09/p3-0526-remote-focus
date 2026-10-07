import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis } from "recharts";

const MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

type MonthlyViewingChartProps = {
  monthlyDuration: number[];
};

function MonthlyViewingChart({ monthlyDuration }: MonthlyViewingChartProps) {
  const data = monthlyDuration.map((minutes, index) => ({
    month: MONTH_LABELS[index],
    hours: Math.round(minutes / 60),
  }));

  return (
    <div>
      <div className="flex justify-end">
        <span className="text-xs text-focus-muted">heures</span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20 }}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9FB4BD", fontSize: 12 }}
            />
            <Bar dataKey="hours" fill="#F2B705" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="hours"
                position="top"
                formatter={(value) => `${value} h`}
                fill="#F5F5F0"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default MonthlyViewingChart;
