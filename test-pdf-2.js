const fs = require("fs");
// Try import
let pdftoimg;
try {
    pdftoimg = require("pdftoimg-js");
} catch (e) {
    console.log("Require failed, trying import in async context?");
}

async function run() {
    if (!pdftoimg) {
        // Maybe default export?
        const mod = await import("pdftoimg-js");
        pdftoimg = mod.default || mod;
    }

    console.log("Testing pdftoimg-js...");
    try {
        const file = "test.pdf";
        if (!fs.existsSync(file)) {
            console.log("test.pdf missing, run previous test first to generate it.");
            return;
        }

        // Convert page 1
        const image = await pdftoimg(file, { page: 1 });
        fs.writeFileSync("test-output.png", image);
        console.log("Success! pdftoimg-js works.");
    } catch (e) {
        console.error("pdftoimg-js Error:", e);
    }
}
run();
