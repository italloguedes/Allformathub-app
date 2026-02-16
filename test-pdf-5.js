const { singlePdfToImg } = require("pdftoimg-js");
const fs = require("fs");

async function run() {
    console.log("Testing singlePdfToImg...");
    try {
        // Assume returns Buffer? Or writes file?
        // Usually wrappers return Buffer or path.
        // Let's assume it returns Buffer or object with content.
        const output = await singlePdfToImg("test.pdf", { page: 1, scale: 2.0 });
        console.log("Output type:", typeof output);
        if (Buffer.isBuffer(output)) {
            fs.writeFileSync("test-output-5.png", output);
            console.log("Wrote buffer to file");
        } else if (typeof output === 'string') {
            console.log("Output string len:", output.length);
        } else {
            console.log("Output object:", output);
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
