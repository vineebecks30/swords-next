import axios from 'axios';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

export default async function handler(req, res) {
  // Get the word from the query parameter (e.g., /api/validate?word=hello)
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ message: 'A word is required.' });
  }

  try {
    // Check the word against the dictionary API
    await axios.get(`${DICTIONARY_API_URL}${word}`);
    // If the request succeeds, the word is valid
    res.status(200).json({ isValid: true });
  } catch (error) {
    // If the API returns a 404 or other error, the word is not valid
    res.status(200).json({ isValid: false });
  }
}