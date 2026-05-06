const { GAS_URL } = require('./config');

export default async function handler(req, res) {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    // Vercelの関数からフロントへデータを返す
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from GAS' });
  }
}