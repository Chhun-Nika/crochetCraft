import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch exchange rate when currency changes
  useEffect(() => {
    if (currency === 'USD') {
      setExchangeRate(1);
      return;
    }

    fetchExchangeRate();
  }, [currency]);

  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using a free exchange rate API (you can replace with your preferred API)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      if (currency === 'RIELS') {
        // Convert USD to RIELS (Cambodian Riel)
        // 1 USD ≈ 4100 RIELS (approximate rate, you might want to use a more accurate API)
        const usdToRiel = data.rates.KHR || 4100;
        setExchangeRate(usdToRiel);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setError('Failed to fetch exchange rate');
      
      // Fallback exchange rates
      if (currency === 'RIELS') {
        setExchangeRate(4100); // Fallback rate
      }
    } finally {
      setLoading(false);
    }
  };

  const convertCurrency = (amount) => {
    if (currency === 'USD') {
      return amount;
    }
    
    const convertedAmount = amount * exchangeRate;
    
    if (currency === 'RIELS') {
      // Format RIELS with appropriate decimal places
      return Math.round(convertedAmount);
    }
    
    return convertedAmount;
  };

  const formatCurrency = (amount) => {
    const convertedAmount = convertCurrency(amount);
    
    if (currency === 'USD') {
      return `$${convertedAmount.toFixed(2)}`;
    } else if (currency === 'RIELS') {
      return `៛${convertedAmount.toLocaleString()}`;
    }
    
    return convertedAmount.toFixed(2);
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'RIELS':
        return '៛';
      default:
        return '$';
    }
  };

  const value = {
    currency,
    setCurrency,
    exchangeRate,
    loading,
    error,
    convertCurrency,
    formatCurrency,
    getCurrencySymbol
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 