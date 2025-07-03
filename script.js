document.getElementById("eventForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    location: document.getElementById("location").value,
    activity_type: document.getElementById("activity_type").value,
    timeframe: document.getElementById("timeframe").value,
    radius: document.getElementById("radius").value,
    keywords: document.getElementById("keywords").value
  };

  try {
    const response = await fetch("https://winwinglobal.app.n8n.cloud/webhook-test/event-finder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    document.getElementById("results").textContent = result.results || "No events found.";
  } catch (error) {
    console.error("Error fetching events:", error);
    document.getElementById("results").textContent = "An error occurred while fetching events.";
  }
});
