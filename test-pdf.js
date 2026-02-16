const fs = require("fs");
const sharp = require("sharp");
const { PDFDocument } = require("pdf-lib");

async function run() {
    console.log("Creating dummy PDF...");
    const doc = await PDFDocument.create();
    const page = doc.addPage([200, 200]);
    page.drawText('Test PDF', { x: 50, y: 100, size: 24 });
    const pdfBytes = await doc.save();
    fs.writeFileSync("test.pdf", Buffer.from(pdfBytes));

    console.log("Converting PDF to PNG with sharp...");
    try {
        await sharp("test.pdf", { density: 72 }).png().toFile("test.png");
        console.log("Success! Sharp handles PDF.");
    } catch (e) {
        console.error("Sharp Error:", e.message);
        console.log("Sharp version:", require("sharp/package.json").version);
        try {
            console.log("Checking sharp metadata...");
            const meta = await sharp("test.pdf").metadata();
            console.log("Metadata:", meta);
        } catch (mErr) {
            console.log("Metadata retrieval failed too:", mErr.message);
        }
    }
}
run();
