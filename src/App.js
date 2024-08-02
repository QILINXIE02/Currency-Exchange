import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const App = () => {
  const [rates, setRates] = useState({});
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [amount, setAmount] = useState(1);
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);

  const apiKey = '3d712e1940f1f8b8704607dc';

  useEffect(() => {
    fetchRates();
    fetchHistoricalData();
  }, [baseCurrency]);

  const fetchRates = async () => {
    try {
      const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`);
      setRates(response.data.conversion_rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/history/${baseCurrency}/90`);
      const historicalRates = response.data.rates.map((rate) => ({
        date: rate.date,
        rate: rate[targetCurrency],
      }));
      setHistoricalData(historicalRates);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const handleConvert = () => {
    const rate = rates[targetCurrency];
    setConvertedAmount(amount * rate);
  };

  const handleAddFavorite = () => {
    if (!favorites.includes(targetCurrency)) {
      setFavorites([...favorites, targetCurrency]);
    }
  };

  const data = {
    labels: historicalData.map((data) => data.date),
    datasets: [
      {
        label: `Exchange Rate (${baseCurrency} to ${targetCurrency})`,
        data: historicalData.map((data) => data.rate),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div className="App">
      <h1>Currency Exchange Rates</h1>
      <div className="currency-converter">
        <select onChange={(e) => setBaseCurrency(e.target.value)} value={baseCurrency}>
          {Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select onChange={(e) => setTargetCurrency(e.target.value)} value={targetCurrency}>
          {Object.keys(rates).map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        <button onClick={handleConvert}>Convert</button>
        <p>{amount} {baseCurrency} = {convertedAmount} {targetCurrency}</p>
        <button onClick={handleAddFavorite}>Add to Favorites</button>
      </div>
      <h2>Favorites</h2>
      <ul>
        {favorites.map((currency) => (
          <li key={currency}>{currency}</li>
        ))}
      </ul>
      <h2>Historical Data</h2>
      <Line data={data} />
    </div>
  );
};

export default App;
