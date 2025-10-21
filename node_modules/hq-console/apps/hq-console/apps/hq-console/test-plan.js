// Save this and run in browser console
localStorage.clear();
console.log("âœ… LocalStorage cleared");

// Test creating a plan directly
fetch("http://localhost:3000/api/plans", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Direct Test Plan",
    industry: "Technology",
    companySize: "Medium",
    description: "Testing direct API call",
    status: "DRAFT"
  })
})
.then(r => r.json())
.then(d => console.log("âœ… Plan created:", d))
.catch(e => console.error("âŒ Error:", e));
