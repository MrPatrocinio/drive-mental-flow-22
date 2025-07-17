import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PricingData } from '@/services/pricingService';
import { formatPrice, validatePriceInput } from '@/utils/pricingUtils';
import { DollarSign } from 'lucide-react';

interface PricingFormProps {
  pricingData: PricingData;
  onUpdate: (data: PricingData) => void;
  isLoading: boolean;
}

export const PricingForm = ({ pricingData, onUpdate, isLoading }: PricingFormProps) => {
  const [price, setPrice] = useState(pricingData.price.toString());
  const [currency, setCurrency] = useState(pricingData.currency);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePriceChange = (value: string) => {
    setPrice(value);
    setHasChanges(true);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as PricingData['currency']);
    setHasChanges(true);
  };

  const handleSubmit = () => {
    if (!validatePriceInput(price)) return;

    const newData = {
      ...pricingData,
      price: parseFloat(price),
      currency,
    };
    
    onUpdate(newData);
    setHasChanges(false);
  };

  const isValidPrice = validatePriceInput(price);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Configuração de Preço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Preço</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              max="999999.99"
              className={!isValidPrice ? "border-destructive" : ""}
            />
            {!isValidPrice && (
              <p className="text-sm text-destructive">
                Insira um preço válido entre 0,01 e 999.999,99
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Moeda</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a moeda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isValidPrice && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Preview:</p>
            <p className="text-lg font-semibold">
              {formatPrice(parseFloat(price), currency)}
            </p>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={!hasChanges || !isValidPrice || isLoading}
          className="w-full"
        >
          {isLoading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardContent>
    </Card>
  );
};