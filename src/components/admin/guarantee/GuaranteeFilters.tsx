import { Button } from "@/components/ui/button";

interface GuaranteeFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'unconditional_window', label: '7 dias' },
  { value: 'conditional_running', label: 'Em acompanhamento' },
  { value: 'conditional_met', label: 'Cumpriram 21' },
  { value: 'refunded', label: 'Reembolsados' },
  { value: 'denied', label: 'Negados' },
  { value: 'expired', label: 'Expirados' },
];

export const GuaranteeFilters = ({ currentFilter, onFilterChange }: GuaranteeFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <Button
          key={filter.value}
          variant={currentFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="smooth-transition"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};
