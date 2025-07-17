import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FieldStats } from "@/services/statsService";

interface FieldStatsChartProps {
  data: FieldStats[];
}

export const FieldStatsChart = ({ data }: FieldStatsChartProps) => {
  const chartData = data.map(field => ({
    name: field.fieldName,
    audios: field.audioCount,
    duracao: field.totalDuration
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Áudios por Campo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-muted-foreground text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-muted-foreground text-xs" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="audios" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};