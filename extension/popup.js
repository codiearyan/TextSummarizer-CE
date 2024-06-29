document.addEventListener("DOMContentLoaded", function () {
  const summarizeBtn = document.getElementById("summarizeBtn");
  const summaryDiv = document.getElementById("summary");
  const loader = document.getElementById("loader");
  const summaryLevelSlider = document.getElementById("summaryLevel");
  const summaryLevelLabel = document.getElementById("summaryLevelLabel");

  const summaryLevels = ["Very Low", "Low", "Medium", "High", "Very High"];

  summaryLevelSlider.addEventListener("input", function () {
    const level = summaryLevels[this.value - 1];
    summaryLevelLabel.textContent = `Summary Level: ${level}`;
  });

  summarizeBtn.addEventListener("click", function () {
    summaryDiv.innerHTML = "";
    loader.style.display = "block";
    summarizeBtn.disabled = true;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getPageContent" },
        function (response) {
          if (response && response.content) {
            fetchSummary(response.content, summaryLevelSlider.value);
          } else {
            showError("Failed to get page content");
          }
        }
      );
    });
  });

  function fetchSummary(content, level) {
    fetch("https://textsummarizer-ce.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, level }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        loader.style.display = "none";
        summarizeBtn.disabled = false;
        displaySummary(data.summary);
      })
      .catch((error) => {
        console.error("Error:", error);
        showError(`An error occurred: ${error.message}`);
      });
  }

  function displaySummary(summary) {
    const lines = summary.split("\n").filter((line) => line.trim() !== "");
    summaryDiv.innerHTML = lines
      .map((line) => `<p class="summary-line">${line}</p>`)
      .join("");

    setTimeout(() => {
      document.querySelectorAll(".summary-line").forEach((line, index) => {
        setTimeout(() => {
          line.classList.add("visible");
        }, index * 100);
      });
    }, 100);
  }

  function showError(message) {
    loader.style.display = "none";
    summarizeBtn.disabled = false;
    summaryDiv.innerHTML = `<p style="color: red;">${message}</p>`;
  }
});
