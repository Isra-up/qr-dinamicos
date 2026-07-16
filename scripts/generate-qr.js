const fs = require("fs");
const path = require("path");
const nodeCanvas = require("canvas");
const { JSDOM } = require("jsdom");
const { QRCodeStyling } = require("qr-code-styling/lib/qr-code-styling.common.js");
const sharp = require("sharp");
const jsQR = require("jsqr");

const BLUE = "#002F6C";
const URL_QR = "https://isra-up.github.io/qr-dinamicos/?k=soporte";

const logoPath = path.join(__dirname, "..", "assets", "logo-up.jpg");
const logoDataUri = "data:image/jpeg;base64," + fs.readFileSync(logoPath).toString("base64");

const qrCode = new QRCodeStyling({
  width: 800,
  height: 800,
  type: "svg",
  data: URL_QR,
  image: logoDataUri,
  margin: 16,
  qrOptions: {
    errorCorrectionLevel: "H",
  },
  imageOptions: {
    imageSize: 0.22,
    margin: 6,
    hideBackgroundDots: true,
  },
  dotsOptions: {
    color: BLUE,
    type: "rounded",
  },
  cornersSquareOptions: {
    color: BLUE,
    type: "square",
  },
  cornersDotOptions: {
    color: BLUE,
    type: "square",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  nodeCanvas,
  jsdom: JSDOM,
});

(async () => {
  const outDir = path.join(__dirname, "..", "assets");
  const svgBuffer = await qrCode.getRawData("svg");
  fs.writeFileSync(path.join(outDir, "qr-soporte-styled.svg"), svgBuffer);

  const pngBuffer = await sharp(svgBuffer).resize(800, 800).png().toBuffer();
  fs.writeFileSync(path.join(outDir, "qr-soporte-styled.png"), pngBuffer);

  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const result = jsQR(new Uint8ClampedArray(data), info.width, info.height);

  if (!result) {
    console.error("VERIFICACION FALLO: el QR generado no se pudo decodificar");
    process.exit(1);
  }
  if (result.data !== URL_QR) {
    console.error("VERIFICACION FALLO: contenido decodificado no coincide:", result.data);
    process.exit(1);
  }
  console.log("OK: QR generado y verificado, decodifica a:", result.data);
})();
