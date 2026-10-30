const form = document.querySelector("#resume-form");
const resumeInput = document.querySelector("#resume");
const characterCount = document.querySelector("#character-count");
const fileInput = document.querySelector("#resume-file");
const fileNote = document.querySelector("#file-note");
const errorMessage = document.querySelector("#form-error");
const analyzeButton = document.querySelector("#analyze-button");
const resultsSection = document.querySelector("#results");
const hero = document.querySelector(".hero");

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty("--pointer-x", `${x}%`);
    hero.style.setProperty("--pointer-y", `${y}%`);
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--pointer-x", "72%");
    hero.style.setProperty("--pointer-y", "48%");
  });
}

const sampleResume = `Jordan Lee
Computer Science student | jordan.lee@example.com

EDUCATION
B.S. Computer Science, North Valley University | Expected May 2027
Relevant coursework: Data Structures, Web Development, Database Systems

SKILLS
JavaScript, Python, React, HTML, CSS, SQL, Git, communication

PROJECTS
Campus Events — Built a React and Node.js app that helped 200 students discover campus events. Designed REST APIs and stored event data in MongoDB.
Study Planner — Created a JavaScript study planner with responsive HTML and CSS layouts.

EXPERIENCE
Technology Club, Project Lead | Sep 2025 – Present
Led a team of four students using Agile practices to deliver a campus event website.`;

const careerPaths = [
  { title: "Frontend Developer", skills: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git"] },
  { title: "Backend Developer", skills: ["Node.js", "Express", "SQL", "REST APIs", "Docker", "Git"] },
  { title: "Full-stack Developer", skills: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs"] },
  { title: "Data Analyst", skills: ["Python", "SQL", "Data analysis", "Excel", "Communication"] },
  { title: "Machine Learning Engineer", skills: ["Python", "Machine learning", "SQL", "Docker", "AWS"] },
  { title: "Java Software Engineer", skills: ["Java", "SQL", "Git", "Docker", "REST APIs"] },
  { title: "Product Designer", skills: ["Figma", "Communication", "Leadership", "Agile"] },
];
const skillCatalog = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "SQL", "React", "Node.js",
  "Express", "HTML", "CSS", "Git", "Docker", "AWS", "Machine learning",
  "Data analysis", "Communication", "Leadership", "Agile", "REST APIs", "MongoDB",
  "PostgreSQL", "Figma", "Excel",
];

function analyzeLocally(resume) {
  const skills = skillCatalog.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#.])${escaped.toLowerCase()}($|[^a-z0-9+#.])`, "i").test(resume);
  });
  const skillSet = new Set(skills.map((skill) => skill.toLowerCase()));
  const recommendations = careerPaths.map((career) => {
    const matchedSkills = career.skills.filter((skill) => skillSet.has(skill.toLowerCase()));
    return {
      title: career.title,
      match: Math.round((matchedSkills.length / career.skills.length) * 100),
      reason: matchedSkills.length
        ? `Your resume already mentions ${matchedSkills.join(", ")}.`
        : "Build a foundation in this path's core skills to explore this role.",
      skills: matchedSkills,
    };
  }).sort((first, second) => second.match - first.match).slice(0, 3);

  const topCareer = recommendations[0];
  const missingSkills = topCareer
    ? careerPaths.find(({ title }) => title === topCareer.title).skills
      .filter((skill) => !skillSet.has(skill.toLowerCase()))
      .slice(0, 5)
      .map((skill, index) => ({
        skill,
        importance: index < 2 ? "High priority" : "Worth learning",
        reason: `A core skill for the ${topCareer.title} role.`,
      }))
    : [];
  const learningSuggestions = missingSkills.slice(0, 3).map(({ skill }) => ({
    title: `Learn ${skill}`,
    description: `Start with the fundamentals, then build a small project that demonstrates ${skill} in practice.`,
  }));
  const projectCount = (resume.match(/\b(project|projects)\b/gi) || []).length;

  return {
    summary: [
      skills.length
        ? `Your resume highlights ${skills.slice(0, 5).join(", ")}${skills.length > 5 ? ` and ${skills.length - 5} more skills` : ""}.`
        : "Your resume is ready for a stronger skills section. Add the tools and technologies you have used.",
      projectCount
        ? "It includes project experience that can help demonstrate your practical abilities."
        : "Consider adding a project section to show how you apply your skills.",
    ].join(" "),
    recommendations,
    missingSkills,
    learningSuggestions,
    improvements: [
      {
        title: "Make achievements measurable",
        description: "Add numbers to your project and experience bullets, such as users reached, time saved, or accuracy improved.",
      },
      {
        title: "Tailor your resume to a role",
        description: `Bring the most relevant skills and projects for ${topCareer?.title || "your target role"} closer to the top.`,
      },
      {
        title: "Use clear, active bullet points",
        description: "Lead each experience bullet with a strong action verb and explain the result or impact.",
      },
    ],
    detectedSkills: skills,
    analysisMode: "offline",
  };
}

resumeInput.addEventListener("input", () => {
  characterCount.textContent = `${resumeInput.value.length.toLocaleString()} / 20,000`;
});

document.querySelector("#sample-button").addEventListener("click", () => {
  resumeInput.value = sampleResume;
  resumeInput.dispatchEvent(new Event("input"));
  resumeInput.focus();
  errorMessage.hidden = true;
});

fileInput.addEventListener("change", async () => {
  const [file] = fileInput.files;
  if (!file) return;
  if (file.size > 20_000) {
    showError("Please choose a text file smaller than 20 KB.");
    fileInput.value = "";
    return;
  }
  try {
    resumeInput.value = await file.text();
    resumeInput.dispatchEvent(new Event("input"));
    fileNote.textContent = file.name;
    errorMessage.hidden = true;
  } catch {
    showError("We couldn’t read that file. Please paste your resume instead.");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const resume = resumeInput.value.trim();
  if (!resume) {
    showError("Paste your resume content before continuing.");
    resumeInput.focus();
    return;
  }

  showError("");
  analyzeButton.disabled = true;
  analyzeButton.innerHTML = 'Finding your possibilities <span aria-hidden="true">…</span>';
  try {
    let response;
    try {
      response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
    } catch (error) {
      if (error instanceof TypeError) {
        renderResults(analyzeLocally(resume));
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      throw error;
    }

    if ([404, 405, 501].includes(response.status)) {
      renderResults(analyzeLocally(resume));
      resultsSection.hidden = false;
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("The analyzer returned an unreadable response. Make sure the app server is running and try again.");
    }
    if (!response.ok) {
      throw new Error(result.error || "We couldn’t analyze your resume. Please try again.");
    }
    renderResults(result);
    resultsSection.hidden = false;
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showError(error.message || "We couldn’t reach the analyzer. Please try again.");
  } finally {
    analyzeButton.disabled = false;
    analyzeButton.innerHTML = 'Show me my possibilities <span aria-hidden="true">→</span>';
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = !message;
}

function addText(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderResults(result) {
  document.querySelector("#summary-text").textContent = result.summary;
  document.querySelector("#mode-badge").textContent =
    result.analysisMode === "ai"
      ? "AI-powered analysis"
      : result.analysisMode === "offline"
        ? "Local analysis · server unavailable"
        : "Quick local analysis";

  const jobs = document.querySelector("#jobs-list");
  jobs.replaceChildren();
  for (const job of result.recommendations) {
    const row = document.createElement("div");
    row.className = "job-row";
    const titleLine = document.createElement("div");
    titleLine.className = "job-title-line";
    addText(titleLine, "strong", "", job.title);
    addText(titleLine, "span", "match-label", `${job.match}% match`);
    row.append(titleLine);
    const track = document.createElement("progress");
    track.className = "match-track";
    track.max = 100;
    track.value = Math.max(0, Math.min(100, Number(job.match) || 0));
    track.setAttribute("aria-label", `${job.title} match`);
    row.append(track);
    addText(row, "p", "job-reason", job.reason);
    jobs.append(row);
  }
  if (!result.recommendations.length) addText(jobs, "p", "empty-list", "Add some skills and experiences to explore possible roles.");

  const skills = document.querySelector("#skills-list");
  skills.replaceChildren();
  for (const item of result.missingSkills) {
    const row = document.createElement("div");
    row.className = "skill-item";
    addText(row, "span", "skill-bullet", "");
    const detail = document.createElement("div");
    addText(detail, "strong", "", item.skill);
    addText(detail, "small", "", `${item.importance} · ${item.reason}`);
    row.append(detail);
    skills.append(row);
  }
  if (!result.missingSkills.length) addText(skills, "p", "empty-list", "Your resume already covers many useful skills. Explore a new specialty to keep growing.");

  renderSuggestions("#learning-list", result.learningSuggestions);
  renderSuggestions("#improvements-list", result.improvements);
}

function renderSuggestions(selector, items) {
  const container = document.querySelector(selector);
  container.replaceChildren();
  for (const item of items) {
    const suggestion = document.createElement("div");
    suggestion.className = "suggestion-item";
    addText(suggestion, "strong", "", item.title);
    addText(suggestion, "p", "", item.description);
    container.append(suggestion);
  }
  if (!items.length) addText(container, "p", "empty-list", "Nothing to suggest just yet. Add more detail to your resume and try again.");
}
