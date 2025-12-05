document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("prompt");
  const generateBtn = document.getElementById("generateBtn");
  const resultImage = document.getElementById("resultImage");
  const loader = document.getElementById("loader");

  loader.style.display = "none"; // hide loader initially

  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return alert("Please enter a prompt!");

    loader.style.display = "block";
    resultImage.style.display = "none";

    try {
      const response = await fetch("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      loader.style.display = "none";

      if (response.ok && data.image) {
        resultImage.src = data.image;
        resultImage.alt = prompt;
        resultImage.style.display = "block";
        resultImage.style.maxWidth = "100%";
        resultImage.style.borderRadius = "8px";
      } else {
        console.error("Error:", data);
        alert(data.error || "Failed to generate image. Check console.");
      }
    } catch (err) {
      loader.style.display = "none";
      console.error("Fetch error:", err);
      alert("An error occurred while generating the image. Check console.");
    }
  });
});
