import { BrowserBarcodeReader } from "https://unpkg.com/@zxing/browser";

const barcodeInput = document.getElementById('barcode-input');
const form = document.getElementById('food-form');
const logList = document.getElementById('log-list');
const reader = new BrowserBarcodeReader();

// Load the log from localStorage when the page loads
function loadLog() {
  const log = JSON.parse(localStorage.getItem('foodLog')) || [];
  logList.innerHTML = ''; // Clear current list
  log.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'bg-white p-2 rounded shadow';
    li.innerHTML = `<strong>${item.name}</strong>: ${item.calories} kcal (${item.protein}g P, ${item.carbs}g C, ${item.fat}g F)`;
    logList.appendChild(li);
  });
}

// Handle food form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const food = {
    name: document.getElementById('food-name').value,
    calories: parseInt(document.getElementById('calories').value),
    protein: parseInt(document.getElementById('protein').value) || 0,
    carbs: parseInt(document.getElementById('carbs').value) || 0,
    fat: parseInt(document.getElementById('fat').value) || 0,
  };

  // Save the food log to localStorage
  const log = JSON.parse(localStorage.getItem('foodLog')) || [];
  log.push(food);
  localStorage.setItem('foodLog', JSON.stringify(log));

  // Clear the form and reload the log
  form.reset();
  loadLog();
});

// Load log on page load
loadLog();

// Barcode scanning logic
barcodeInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const imageUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = imageUrl;

  img.onload = async () => {
    try {
      const result = await reader.decodeFromImageElement(img);
      const barcode = result.text;
      alert(`Scanned barcode: ${barcode}`);

      // Fetch product data
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
      alert('Failed to decode barcode.');
    }
  };
});
