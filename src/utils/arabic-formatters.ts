
export const formatArabicNumber = (number: number | string): string => {
  const arabicNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  // Convert to string and format with proper decimal places
  let numStr = typeof number === 'number' ? number.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }) : number.toString();
  
  // Replace English digits with Arabic digits
  for (let i = 0; i < englishNumbers.length; i++) {
    numStr = numStr.replace(new RegExp(englishNumbers[i], 'g'), arabicNumbers[i]);
  }
  
  return numStr;
};

export const formatCurrency = (amount: number): string => {
  const formattedAmount = formatArabicNumber(amount);
  return `${formattedAmount}ر.س`;
};

export const formatPercentage = (percentage: number): string => {
  const formattedPercentage = formatArabicNumber(percentage);
  return `٪${formattedPercentage}`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

export const formatNumber = (number: number, decimals: number = 0): string => {
  return number.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};
