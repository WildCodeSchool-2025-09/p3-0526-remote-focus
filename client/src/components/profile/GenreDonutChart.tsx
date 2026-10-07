import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { GenreShare } from "../../types/Statistics";
import { getGenreColor } from "../../utils/genreColors";

type GenreDonutChartProps = {
  data: GenreShare[];
};

function GenreDonutChart({ data }: GenreDonutChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-focus-muted">
        Aucune donnée de genre pour l'instant.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="genre"
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.genre}
                  fill={getGenreColor(entry.genre, index)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((entry, index) => (
          <li key={entry.genre} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getGenreColor(entry.genre, index) }}
            />
            <span className="flex-1">{entry.genre}</span>
            <span className="font-semibold">{entry.percentage} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GenreDonutChart;
