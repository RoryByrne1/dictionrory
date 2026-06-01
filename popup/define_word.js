const form = document.getElementById('lookup-form');
const wordInput = document.getElementById('word');
const result = document.getElementById('result');
const errorContent = document.getElementById('error-content');
const errorMessage = document.getElementById('error-message');

const renderError = (message) => {
  result.replaceChildren();
  errorMessage.textContent = message;
  errorContent.classList.remove('hidden');
};

const createDetailsDropdown = (label, values) => {
  const uniqueValues = [...new Set((values ?? []).filter(Boolean))];

  if (uniqueValues.length === 0) {
    return null;
  }

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = `${label} (${uniqueValues.length})`;
  details.append(summary);

  const listElement = document.createElement('ul');
  uniqueValues.forEach((value) => {
    const item = document.createElement('li');
    item.textContent = value;
    listElement.append(item);
  });

  details.append(listElement);
  return details;
};

const buildEntryFragment = (entry) => {
  const pronunciation = entry.phonetic || entry.phonetics?.find((phonetic) => phonetic.text)?.text || '';
  const meanings = entry.meanings ?? [];

  const title = document.createElement('h2');
  title.textContent = entry.word;

  const fragment = document.createDocumentFragment();
  fragment.append(title);

  if (pronunciation) {
    const pronunciationElement = document.createElement('p');
    pronunciationElement.className = 'meta';
    pronunciationElement.textContent = pronunciation;
    fragment.append(pronunciationElement);
  }

  meanings.forEach((meaning) => {
    const meaningSection = document.createElement('section');
    meaningSection.className = 'meaning';

    const partOfSpeech = document.createElement('p');
    partOfSpeech.className = 'meta meaning-title';
    partOfSpeech.textContent = meaning.partOfSpeech ?? 'definition';
    meaningSection.append(partOfSpeech);

    const list = document.createElement('ol');

    (meaning.definitions ?? []).forEach((definition) => {
      const listItem = document.createElement('li');
      listItem.className = 'definition-item';

      const definitionText = document.createElement('p');
      definitionText.className = 'definition-text';
      definitionText.textContent = definition.definition;
      listItem.append(definitionText);

      if (definition.example) {
        const example = document.createElement('p');
        example.className = 'meta example';
        example.textContent = `e.g. ${definition.example}`;
        listItem.append(example);
      }
      list.append(listItem);
    });

    meaningSection.append(list);

    const detailsRow = document.createElement('div');
    detailsRow.className = 'details-row';

    const synonymsDropdown = createDetailsDropdown('synonyms', meaning.synonyms);
    const antonymsDropdown = createDetailsDropdown('antonyms', meaning.antonyms);

    if (synonymsDropdown) {
      detailsRow.append(synonymsDropdown);
    }

    if (antonymsDropdown) {
      detailsRow.append(antonymsDropdown);
    }

    if (detailsRow.childElementCount > 0) {
      meaningSection.append(detailsRow);
    }

    fragment.append(meaningSection);
  });

  return fragment;
};

const renderEntries = (entries) => {
  const fragment = document.createDocumentFragment();

  entries.forEach((entry, index) => {
    if (index > 0) {
      const hr = document.createElement('hr');
      hr.className = 'entry-separator';
      fragment.append(hr);
    }

    fragment.append(buildEntryFragment(entry));
  });

  result.replaceChildren(fragment);
  errorContent.classList.add('hidden');
};

const fetchDictionaryData = async (word) => {
  const trimmedWord = word.trim();

  if (!trimmedWord) {
    renderError('Enter a word to look up.');
    return;
  }

  result.replaceChildren();
  const loading = document.createElement('p');
  loading.className = 'meta';
  loading.textContent = 'looking up definition...';
  result.append(loading);
  errorContent.classList.add('hidden');

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmedWord)}`);

    if (!response.ok) {
      if (response.status === 404) {
        renderError(`no definition found for '${trimmedWord}'`);
        return;
      }

      throw new Error(`HTTP error, status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 1) {
      renderEntries(data);
    } else {
      renderEntries([Array.isArray(data) ? data[0] : data]);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    renderError('could not fetch a definition');
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  fetchDictionaryData(wordInput.value);
});

wordInput.focus();