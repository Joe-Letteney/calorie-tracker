import { BrowserMultiFormatReader } from "https://unpkg.com/@zxing/browser";

const startScanBtn = document.getElementById('start-scan');
const videoElement = document.getElementById('scanner-preview');

startScanBtn.addEventListener('click', async () => {
  try {
    const codeReader = new BrowserMultiFormatReader();
    const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();

    if (videoInputDevices.length === 0) {
      alert("No camera found. Try on a device with a camera.");
      return;
    }

    const selectedDeviceId = videoInputDevices[0].deviceId;

    videoElement.style.display = 'block';

    const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, videoElement);
    const barcode = result.text;
    alert(`Scanned barcode: ${barcode}`);

    videoElement.style.display = 'none';
    codeReader.reset();

    // Lookup in OpenFoodFacts
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
    console.error('Scanner error:', err);
    alert('Scanner failed. Check console for errors and allow camera access.');
    videoElement.style.display = 'none';
  }
});
