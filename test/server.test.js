const assert = require("node:assert/strict");
const test = require("node:test");
const { analyzeLocally, createServer } = require("../server");

test("local analysis returns role matches, skill gaps, and actionable guidance", () => {
  const result = analyzeLocally(
    "Built a React and JavaScript website with HTML, CSS, and Git. Created two projects.",
  );

  assert.equal(result.analysisMode, "local");
  assert.match(result.summary, /React/);
  assert.equal(result.recommendations[0].title, "Frontend Developer");
  assert.ok(result.recommendations[0].match > 0);
  assert.ok(result.missingSkills.some((item) => item.skill === "TypeScript"));
  assert.ok(result.learningSuggestions.length > 0);
  assert.ok(result.improvements.length > 0);
});

test("analysis endpoint rejects empty resumes and analyzes valid resumes", async (context) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const address = server.address();
  const endpoint = `http://127.0.0.1:${address.port}/api/analyze`;
  const emptyResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume: "  " }),
  });
  assert.equal(emptyResponse.status, 400);
  assert.match((await emptyResponse.json()).error, /Paste your resume/);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume: "Python, SQL, and data analysis projects." }),
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.analysisMode, "local");
  assert.ok(result.recommendations.some((item) => item.title === "Data Analyst"));
});

test("server serves the application with security headers", async (context) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(await response.text(), /Your next chapter/);
});
