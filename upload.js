let mode = "vulnerable";

const result = document.getElementById("result");
const btnVuln = document.getElementById("btn-vuln");
const btnFixed = document.getElementById("btn-fixed");

// Fake files. The content is harmless text.
const harmless = "<?php /* demo only, harmless text */ ?>";

const payloads = {
  good: () => new File(
    [new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])],
    "photo.jpg", { type: "image/jpeg" }),
  double: () => new File([harmless],
    "shell.php.jpg", { type: "image/jpeg" }),
  php: () => new File([harmless],
    "shell.php", { type: "application/x-php" })
};

function vulnerableCheck(file) {
  return file.name.toLowerCase().endsWith(".jpg");
}

async function fixedCheck(file) {
  const head = new Uint8Array(await file.slice(0, 3).arrayBuffer());
  const isJpeg = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF;
  return isJpeg && file.size < 1000000;
}

async function firstBytesHex(file) {
  const bytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return [...bytes]
    .map(b => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

function setMode(newMode) {
  mode = newMode;
  btnVuln.classList.toggle("active", newMode === "vulnerable");
  btnFixed.classList.toggle("active", newMode === "fixed");
  result.className = "result";
  result.textContent = "Press a button.";
}

btnVuln.onclick = () => setMode("vulnerable");
btnFixed.onclick = () => setMode("fixed");

document.querySelectorAll("button[data-payload]").forEach(btn => {
  btn.onclick = async () => {
    const file = payloads[btn.dataset.payload]();
    const hex = await firstBytesHex(file);
    const realJpeg = await fixedCheck(file);

    const accepted = mode === "vulnerable"
      ? vulnerableCheck(file)
      : realJpeg;

    const info = "File name: " + file.name +
      "\nFirst bytes: " + hex +
      "\nReal JPEG? " + (realJpeg ? "yes" : "no") + "\n\n";

    if (!accepted) {
      result.className = "result blocked";
      result.textContent = info + "REJECTED. The file was blocked.";
    } else if (realJpeg) {
      result.className = "result safe";
      result.textContent = info + "UPLOADED. This is a real image.";
    } else {
      result.className = "result leak";
      result.textContent = info +
        "UPLOADED! A non-image file got through.\n" +
        "The server believed the extension, not the content.";
    }
  };
});

// "The fix" section: switch to Fixed and run the same payload again.
document.getElementById("btn-retest").onclick = () => {
  setMode("fixed");
  document.getElementById("result").scrollIntoView({ behavior: "smooth", block: "center" });
  document.querySelector('button[data-payload="double"]').click();
};