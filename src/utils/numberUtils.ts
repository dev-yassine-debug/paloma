
/**
 * Utility functions for number formatting in Arabic locale with Arabic digits
 */

const arabicNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const convertToArabicNumbers = (numberString: string): string => {
  let result = numberString;
  for (let i = 0; i < englishNumbers.length; i++) {
    result = result.replace(new RegExp(englishNumbers[i], 'g'), arabicNumbers[i]);
  }
  return result;
};

export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  const arabicFormatted = convertToArabicNumbers(formatted);
  return `${arabicFormatted}ر.س`;
};

export const formatNumber = (number: number, minimumFractionDigits: number = 0): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits === 0 ? 0 : 2
  }).format(number);
  
  return convertToArabicNumbers(formatted);
};

export const formatPercentage = (value: number): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
  
  const arabicFormatted = convertToArabicNumbers(formatted);
  return `٪${arabicFormatted}`;
};

export const formatCompactNumber = (number: number): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(number);
  
  return convertToArabicNumbers(formatted);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
