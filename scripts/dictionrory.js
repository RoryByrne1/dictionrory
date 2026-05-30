const fetchDictionaryData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error, status: ${response.status}`);
    }
    const data = await response.json();
    console.log('response:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

const word = "yes";
fetchDictionaryData(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);