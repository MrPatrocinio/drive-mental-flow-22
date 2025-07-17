import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AudioUsageData } from "@/services/statsService";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

interface AudioUsageTableProps {
  data: AudioUsageData[];
}

export const AudioUsageTable = ({ data }: AudioUsageTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Play className="h-4 w-4" />
          Áudios Mais Ouvidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Campo</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead className="text-right">Reproduções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((audio) => (
              <TableRow key={audio.audioId}>
                <TableCell className="font-medium">
                  {audio.title}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {audio.field}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {audio.duration}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {audio.plays.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};