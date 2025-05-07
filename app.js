// Handle form submission and localStorage
const form = document.getElementById('food-form');
const logList = document.getElementById('log-list');

function loadLog() {
  const log = JSON.parse(localStorage.getItem('foodLog')) || [];
  logList.innerHTML = '';
  log.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'bg-white p-2 rounded shadow';
    li.innerHTML = `<strong>${item.name}</strong>: ${item.calories} kcal (${item.protein}g P, ${item.carbs}g C, ${item.fat}g F)`;
    logList.appendChild(li);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const food = {
    name: document.getElementById('food-name').value,
    calories: parseInt(document.getElementById('calories').value),
    protein: parseInt(document.getElementById('protein').value) || 0,
    carbs: parseInt(document.getElementById('carbs').value) || 0,
    fat: parseInt(document.getElementById('fat').value) || 0,
  };
  const log = JSON.parse(localStorage.getItem('foodLog')) || [];
  log.push(food);
  localStorage.setItem('foodLog', JSON.stringify(log));
  form.reset();
  loadLog();
});

loadLog();

// Barcode Scanner using ZXing and OpenFoodFacts
import { BrowserMultiFormatReader } from "https://unpkg.com/@zxing/browser@latest";
const codeReader = new BrowserMultiFormatReader();
const startScanBtn = document.getElementById('start-scan');
const videoElement = document.getElementById('scanner-preview');

startScanBtn.addEventListener('click', async () => {
  videoElement.style.display = 'block';
  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoElement);
    const barcode = result.text;
    videoElement.style.display = 'none';
    codeReader.reset();

    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1) {
      const product = data.product;
      document.getElementById('food-name').value = product.product_name || 'Unknown';
      document.getElementById('calories').value = product.nutriments['energy-kcal_100g'] || 0;
      document.getElementById('protein').value = product.nutriments.proteins_100g || 0;
      document.getElementById('carbs').value = product.nutriments.carbohydrates_100g || 0;
      document.getElementById('fat').value = product.nutriments.fat_100g || 0;
    } else {
      alert('Product not found in OpenFoodFacts.');
    }
  } catch (err) {
    console.error(err);
    alert("Scan failed or was canceled.");
    videoElement.style.display = 'none';
  }
});
