const fs = require('fs').promises;
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

async function run() {
    console.log("Testing pdfjs-dist + @napi-rs/canvas...");

    let pdfjsLib;
    try {
        pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    } catch (e) {
        console.log("ESM import failed, trying CJS require...");
        pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    }

    try {
        // Prepare dummy CMAP if needed? Usually not for simple text.
        // But for robust rendering, we might need to set worker.
        // In Node, we can disable worker by setting workerSrc?
        // pdfjsLib.GlobalWorkerOptions.workerSrc = ...

        const data = await fs.readFile('test.pdf');
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(data));
        const doc = await loadingTask.promise;
        const page = await doc.getPage(1);

        const viewport = page.getViewport({ scale: 2.0 }); // High quality 2x
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        const buffer = await canvas.encode('png');
        await fs.writeFile('test-output-3.png', buffer);
        console.log("Success! PDF rendered to PNG.");
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
