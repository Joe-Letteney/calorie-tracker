import { BrowserBarcodeReader } from "https://unpkg.com/@zxing/browser";

const barcodeInput = document.getElementById('barcode-input');
const reader = new BrowserBarcodeReader();

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
