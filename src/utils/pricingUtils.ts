export const formatPrice = (price: number, currency: string): string => {
  const formatters = {
    BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
  };

  const formatter = formatters[currency as keyof typeof formatters] || formatters.BRL;
  return formatter.format(price);
};

export const getCurrencySymbol = (currency: string): string => {
  const symbols = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency as keyof typeof symbols] || 'R$';
};

export const validatePriceInput = (value: string): boolean => {
  const number = parseFloat(value);
  return !isNaN(number) && number > 0 && number <= 999999.99;
};