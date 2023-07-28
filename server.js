const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8008;

// Function to fetch numbers from a given URL
async function fetchNumbersFromURL(url) {
  try {
    const response = await axios.get(url, { timeout: 500 });
    if (response && response.data && response.data.Numbers && Array.isArray(response.data.Numbers)) {
      return response.data.Numbers;
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Merge and sort unique numbers from multiple URLs
async function mergeAndSortNumbers(urls) {
  const promises = urls.map((url) => fetchNumbersFromURL(url));
  const numbersArrays = await Promise.all(promises);

  // Merge all arrays into a single array
  const mergedNumbers = [].concat(...numbersArrays);

  // Filter out unique numbers
  const uniqueNumbers = [...new Set(mergedNumbers)];

  // Sort the unique numbers in ascending order
  uniqueNumbers.sort((a, b) => a - b);

  return uniqueNumbers;
}

// GET /numbers endpoint
app.get('/numbers', async (req, res) => {
  const urls = req.query.url || [];
  if (!Array.isArray(urls)) {
    res.status(400).json({ error: 'Invalid query parameter format.' });
    return;
  }

  try {
    const mergedNumbers = await mergeAndSortNumbers(urls);
    res.json({ numbers: mergedNumbers });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`number-management-service is running on port ${PORT}`);
});