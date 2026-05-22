const latinSymbols = 'abcdefghijklmnopqrstuvwxyz'.split('');
const cyrillicSymbols = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');

const syncValues = () => {
  const select = document.getElementById('number-selector');
  const input = document.getElementById('custom-number');

  if (document.activeElement === select && select.value !== '') {
    input.value = select.value;
  } else if (document.activeElement === input && input.value !== '') {
    const optionExists = Array.from(select.options).some(option => option.value === input.value);
    if (optionExists) {
      select.value = input.value;
    } else {
      const newOption = new Option(input.value, input.value);
      select.add(newOption);
      select.value = input.value;
    }
  }
}

const getShiftValue = () => {
  const select = document.getElementById('number-selector');
  const input = document.getElementById('custom-number');
  const value = select.value !== '' ? select.value : input.value;

  if (value === '' || isNaN(value)) {
    throw new Error('Пожалуйста, введите число для сдвига');
  }

  return parseInt(value, 10);
}

const getMode = () => {
  const mode = document.getElementById('mode-selector').value;
  return mode === 'custom' ? 'custom' : 'standard';
}

const normalizeIndex = (index, length) => {
  return ((index % length) + length) % length;
}

const transformLetter = (char, shift, mode, position, isDecrypt) => {
  const isLatin = /[a-zA-Z]/.test(char);
  const isCyrillic = /[а-яА-ЯёЁ]/.test(char);

  if (!isLatin && !isCyrillic) {
    return char;
  }

  const alphabet = isLatin ? latinSymbols : cyrillicSymbols;
  const isUpperCase = char === char.toUpperCase();
  const lowerChar = char.toLowerCase();
  const index = alphabet.indexOf(lowerChar);

  if (index === -1) {
    return char;
  }

  let actualShift = shift;
  if (mode === 'custom') {
    actualShift = position % 2 === 1 ? shift : shift + 1;
  }

  if (isDecrypt) {
    actualShift = -actualShift;
  }

  const shiftedIndex = normalizeIndex(index + actualShift, alphabet.length);
  const shiftedChar = alphabet[shiftedIndex];
  return isUpperCase ? shiftedChar.toUpperCase() : shiftedChar;
}

const transformText = (text, shift, mode, isDecrypt) => {
  const result = [];
  for (let i = 0; i < text.length; i++) {
    const position = i + 1;
    result.push(transformLetter(text[i], shift, mode, position, isDecrypt));
  }
  return result.join('');
}

const renderResult = (text) => {
  document.getElementById('result').textContent = text;
}

const encryptText = () => {
  try {
    const text = document.getElementById('text').value;
    const shift = getShiftValue();
    const mode = getMode();
    const encrypted = transformText(text, shift, mode, false);
    renderResult(encrypted);
  } catch (error) {
    alert(error.message);
  }
}

const decryptText = () => {
  try {
    const resultField = document.getElementById('result');
    const resultText = resultField.textContent.trim();
    const inputText = document.getElementById('text').value.trim();
    const targetText = resultText && resultText !== 'Результат появится здесь...' ? resultText : inputText;

    if (!targetText) {
      alert('Пожалуйста, введите или получите зашифрованный текст для дешифрования');
      return;
    }

    const shift = getShiftValue();
    const mode = getMode();
    const decrypted = transformText(targetText, shift, mode, true);

    renderResult(decrypted);
  } catch (error) {
    alert(error.message);
  }
}

const copyResult = () => {
  const resultText = document.getElementById('result').textContent;
  
  if (resultText === 'Результат появится здесь...') {
    alert('Нечего копировать. Сначала выполните шифрование или дешифрование.');
    return;
  }

  navigator.clipboard.writeText(resultText).then(() => {
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Скопировано!';
    copyBtn.style.backgroundColor = '#5cd344';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.backgroundColor = '';
    }, 2000);
  }).catch(err => {
    alert('Ошибка при копировании: ' + err);
  });
}
