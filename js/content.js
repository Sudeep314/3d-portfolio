/* =============================================================
   content.js  —  THE ONLY FILE YOU NEED TO EDIT
   -------------------------------------------------------------
   Everything on the 3D site comes from this file.
   Change any text here and refresh the browser — that's it.

   COLOUR TIPS
   - Each planet has `color` (main) and `accent` (glow / highlights).
   - Any hex colour works, e.g. "#4f8cff".
   ============================================================= */

window.PORTFOLIO = {

  /* ---------------------------------------------------------
     1. WHO YOU ARE
     --------------------------------------------------------- */
  profile: {
    name: "Sudeep Kumar M V",
    initials: "SK",
    role: "AI Engineer",
    tagline: "3rd semester CSE @ RVCE — building AI systems that find what people are missing.",
    photo: "assets/profile.jpg",          // your photo
    email: "sukumarmv314@gmail.com",
    phone: "+91 74838 53165",
    phoneLink: "tel:+917483853165",
    location: "Bengaluru, Karnataka, India",
    resume: "assets/resume.pdf",          // optional PDF — the site also builds a printable resume page
    links: {
      github: "https://github.com/Sudeep314",
      linkedin: "https://www.linkedin.com/in/sudeep-kumar-mv-8b82a5380/",
      x: "",                              // TODO: your X / Twitter (optional)
      website: ""
    }
  },

  /* ---------------------------------------------------------
     1b. ONE-LINE SUMMARY  (used at the top of the resume)
     --------------------------------------------------------- */
  summary:
    "Third-semester CSE student at RVCE building AI systems. " +
    "Led the RAG chatbot and the frontend integration for GapBridge, an " +
    "LLM-powered platform that finds exactly which topics and skills a student " +
    "is missing. Python, FastAPI, React, MongoDB, Gemini API.",

  /* ---------------------------------------------------------
     1c. EDUCATION
     --------------------------------------------------------- */
  education: [
    {
      degree: "B.E. Computer Science & Engineering",
      school: "R.V. College of Engineering, Bengaluru",
      period: "2026 — present",
      note: "Lateral entry into 3rd semester via DCET (Rank 22)",
      points: [
        "Currently: Data Structures & Applications (CS233AI)",
        "GapBridge — III Semester Experiential Learning project"
      ]
    },
    {
      degree: "Diploma in Computer Science & Engineering",
      school: "Sri Jayachamarajendra Government Polytechnic, Bengaluru",
      period: "2023 — 2026",
      note: "CGPA 9.83",
      points: []
    },
    {
      degree: "Secondary School (SSLC)",
      school: "Dr. B.R. Ambedkar Residential School",
      period: "2023",
      note: "619 / 625 — 99.04%",
      points: []
    }
  ],

  /* ---------------------------------------------------------
     1d. ACHIEVEMENTS
     --------------------------------------------------------- */
  achievements: [
    { title: "DCET Rank 22", detail: "Karnataka Diploma Entrance Test, Computer Science" },
    { title: "99.04% — SSLC", detail: "619 / 625, Dr. B.R. Ambedkar Residential School" },
    { title: "9.83 CGPA", detail: "Diploma in Computer Science, SJCG Polytechnic" }
  ],

  /* ---------------------------------------------------------
     1e. INTERESTS
     --------------------------------------------------------- */
  interests: [
    "Cinephile — will watch anything with good writing",
    "Story-driven and online games",
    "Occasional sketching",
    "Documenting what I learn in writing"
  ],

  /* ---------------------------------------------------------
     2. ABOUT
     --------------------------------------------------------- */
  about: {
    heading: "About me",
    paragraphs: [
      "I'm Sudeep Kumar M V — a 3rd semester Computer Science student at RVCE, and I want to be an AI engineer. I came in through the lateral entry route with a DCET rank of 22, after finishing my diploma with a 9.83 CGPA.",
      "Most of what I actually know, I learned by building one big thing: GapBridge, an AI platform that works out exactly which topics and skills a student is missing and builds a study plan around those gaps. I own the RAG chatbot — the part that retrieves the right context and talks to Gemini — and I coordinated the frontend so all eight modules connected into one continuous flow.",
      "Before that I did a diploma in Computer Science and built my first RAG system, which is where the obsession started. I like the part where you hand a model your own messy data and it starts answering sensibly instead of guessing.",
      "Outside of it I'm a cinephile — I'll watch anything if the writing is good — I play story-driven and online games, and I draw very occasionally. This site is my 3D portfolio: every skill is a planet orbiting my name. Drag to orbit, scroll to zoom, click a planet."
    ],
    facts: [
      { label: "Education",   value: "B.E. CSE, RVCE — lateral entry (DCET Rank 22)" },
      { label: "Semester",    value: "3rd" },
      { label: "Hobbies",     value: "Cinephile · story & online games · occasional sketching" },
      { label: "Building",    value: "GapBridge — AI curriculum & skill gap platform" },
      { label: "Looking for", value: "AI engineering internships" }
    ]
  },

  /* ---------------------------------------------------------
     3. HEADLINE STATS  (real numbers from GapBridge)
     --------------------------------------------------------- */
  stats: [
    { value: "161",  label: "gaps detected" },
    { value: "216",  label: "knowledge graph nodes" },
    { value: "1,835", label: "syllabus concepts" },
    { value: "157",  label: "backend tests passing" }
  ],

  /* ---------------------------------------------------------
     4. THE PLANETS  — each one is a skill domain
     ---------------------------------------------------------
     - distance : how far the planet sits from the core
     - radius   : size of the planet
     - tilt     : orbit tilt in degrees
     - speed    : orbit speed
     - ring     : true = draws a Saturn-style ring
     - skills   : shown in the side panel with a level bar
     - projects : shown as small moons you can click
     --------------------------------------------------------- */
  planets: [
    {
      id: "ai",
      name: "AI & LLM",
      tagline: "Retrieval, embeddings, generation",
      color: "#a78bfa",
      accent: "#dcd0ff",
      distance: 5.4,
      radius: 0.76,
      tilt: -16,
      speed: 0.16,
      ring: true,
      level: "Intermediate",
      description:
        "This is the direction I'm heading. Most of my real work lives here — turning messy syllabus documents into structured knowledge, then using an LLM to reason over it instead of guessing.",
      skills: [
        { name: "Python",                        level: "Intermediate" },
        { name: "Gemini API",                    level: "Intermediate" },
        { name: "RAG (Retrieval-Augmented Generation)", level: "Intermediate" },
        { name: "Embeddings & Vector Similarity", level: "Intermediate" },
        { name: "Prompt Engineering",            level: "Intermediate" },
        { name: "LLM Caching, Retries & Quotas", level: "Intermediate" },
        { name: "AI / ML Fundamentals",           level: "Intermediate" },
        { name: "sentence-transformers / minilm", level: "Beginner" }
      ],
      projects: [
        {
          title: "GapBridge",
          blurb: "An AI platform that finds exactly which topics and skills a student is missing, then builds a study plan around the gaps.",
          description:
            "GapBridge is the RVCE III Semester Experiential Learning project — a four-person team build. It runs two tracks: Curriculum Gap compares a diploma syllabus against a degree semester, and Skill Gap compares your existing skills against a target job role. My two pieces were the RAG chatbot (embedding pipeline, vector store, Gemini generation scoped to each topic or skill) and the frontend integration, where I wired every module — login, track selection, syllabus and role selection, gap lists, quizzes and dashboard — into one continuous flow.",
          tech: ["React", "Vite", "Tailwind CSS", "FastAPI", "Python", "MongoDB", "Gemini API", "JWT"],
          highlights: [
            "Own the RAG chatbot — 'Ask AI' answers questions scoped to a specific topic or skill, grounded on retrieved context",
            "Coordinated the frontend integration across all 8 modules of the team",
            "Two tracks: Curriculum Gap (syllabus vs degree semester) and Skill Gap (skills vs job role)",
            "Gap list ranked with High / Medium / Low relevance badges, and a dashboard tracking mastery over time",
            "157 passing backend tests; frontend build passes with no new ESLint errors"
          ],
          links: { github: "", demo: "" }
        }
      ]
    },

    {
      id: "backend",
      name: "Backend",
      tagline: "APIs, data, auth",
      color: "#4f8cff",
      accent: "#8fd0ff",
      distance: 7.6,
      radius: 0.6,
      tilt: 20,
      speed: -0.12,
      ring: false,
      level: "Intermediate",
      description:
        "FastAPI and MongoDB are where my Python stops being a script and becomes a service that other people can call.",
      skills: [
        { name: "Python",              level: "Intermediate" },
        { name: "FastAPI",             level: "Intermediate" },
        { name: "REST API Design",     level: "Intermediate" },
        { name: "MongoDB / PyMongo",   level: "Beginner" },
        { name: "JWT & Firebase Auth", level: "Beginner" }
      ],
      projects: [
        {
          title: "Curriculum Gap Engine",
          blurb: "The engine behind GapBridge — reads two syllabi, builds a prerequisite graph, and returns a ranked list of what a student is actually missing.",
          description:
            "A pipeline that parses the RVCE degree syllabus and a diploma syllabus into units, uses Gemini to extract atomic concepts and discover each concept's prerequisites, merges duplicates, and builds a directed knowledge graph. Walking backwards through that graph tells you which foundations a student needs; matching those against what the diploma actually taught turns it into a covered / partial / missing list with evidence attached.",
          tech: ["Python", "Gemini API", "sentence-transformers", "minilm", "numpy", "networkx", "pdfplumber", "FastAPI"],
          highlights: [
            "Parsed 17 syllabus documents (443 pages) into 175 units with pdfplumber",
            "Extracted 1,835 diploma concepts across 16 documents — roughly 180 API calls, zero errors",
            "Built a 216-node, 248-edge prerequisite knowledge graph — a DAG with zero cycles",
            "Hybrid duplicate detection (0.65 lexical + 0.35 semantic) with an LLM arbiter for borderline pairs, so nothing merges without a human approving it",
            "First live run: 161 gaps, 54 of them rated High, each matched to the closest diploma topic",
            "The engine's top gaps independently rediscovered the exact things diploma-entry students were missing by hand: pointers, the memory model, compile-time vs runtime, and recursion"
          ],
          links: { github: "", demo: "" }
        }
      ]
    },

    {
      id: "frontend",
      name: "Frontend",
      tagline: "React, and the web in 3D",
      color: "#22d3ee",
      accent: "#b6f6ff",
      distance: 9.8,
      radius: 0.52,
      tilt: -30,
      speed: 0.19,
      ring: true,
      level: "Learning",
      description:
        "HTML and CSS are still basics for me, but React is where I learned that a UI is really just data moving into components. This portfolio is my excuse to learn WebGL properly.",
      skills: [
        { name: "JavaScript (ES6+)",       level: "Intermediate" },
        { name: "React",                   level: "Learning" },
        { name: "Three.js / WebGL",        level: "Learning" },
        { name: "Vite",                    level: "Beginner" },
        { name: "Tailwind CSS",            level: "Beginner" },
        { name: "HTML & CSS",              level: "Beginner" },
        { name: "Axios, React Router, Recharts", level: "Beginner" }
      ],
      projects: [
        {
          title: "3D Portfolio",
          blurb: "This site — a personal solar system of skills, built with Three.js and WebGL.",
          description:
            "Every skill domain on this site is a planet orbiting my name, and every project is a moon you can click. The whole scene is generated at runtime: the planet surfaces, the labels and the glows are all painted with the Canvas 2D API, so the site ships with zero 3D models and zero texture files.",
          tech: ["Three.js", "WebGL", "JavaScript", "Canvas 2D", "CSS"],
          highlights: [
            "Custom orbit camera with inertia, pinch-to-zoom and keyboard control",
            "Raycasting to pick planets and project moons in 3D",
            "Procedurally painted planet textures — no image assets at all",
            "A starfield of 2,600 drifting points",
            "Every word on the site comes from one editable content file"
          ],
          links: { github: "https://github.com/Sudeep314/sudeep-3d-portfolio", demo: "https://sudeep314.github.io/sudeep-3d-portfolio/" }
        }
      ]
    },

    {
      id: "programming",
      name: "Programming",
      tagline: "Logic, data structures, the core",
      color: "#f2994a",
      accent: "#ffd6a0",
      distance: 12.0,
      radius: 0.46,
      tilt: 34,
      speed: -0.09,
      ring: false,
      level: "Intermediate",
      description:
        "Python is my main language, but C and Java taught me what the machine actually does. The most interesting thing GapBridge taught me is that the degree course teaches data structures in C, C++ and Java while the diploma taught the same subject in Python — which is exactly why pointers and the memory model were missing for so many students.",
      skills: [
        { name: "Python",                          level: "Intermediate" },
        { name: "Data Structures & Algorithms",     level: "Intermediate" },
        { name: "Problem Solving",                 level: "Intermediate" },
        { name: "Java",                            level: "Beginner" },
        { name: "C",                               level: "Beginner" }
      ],
      projects: []
    },

    {
      id: "tools",
      name: "Tools",
      tagline: "Git, Jira, shipping habits",
      color: "#38d9a9",
      accent: "#a8ffe6",
      distance: 14.4,
      radius: 0.4,
      tilt: -8,
      speed: 0.08,
      ring: false,
      level: "Beginner",
      description:
        "The unglamorous half of engineering. Git history is my portfolio of mistakes, and Jira taught me that a project is really just tickets and a board someone actually looks at.",
      skills: [
        { name: "Git & GitHub",                   level: "Intermediate" },
        { name: "Jira",                          level: "Beginner" },
        { name: "Linux & Terminal",              level: "Beginner" },
        { name: "Docker",                        level: "Beginner" },
        { name: "MongoDB Atlas",                  level: "Beginner" },
        { name: "Figma",                          level: "Beginner" }
      ],
      projects: []
    }
  ],

  /* ---------------------------------------------------------
     5. TIMELINE
     --------------------------------------------------------- */
  timeline: [
    { year: "2023", title: "99.04% in SSLC", detail: "619 / 625 at Dr. B.R. Ambedkar Residential School. Finished school and started the diploma the same year." },
    { year: "2023", title: "Started diploma, Computer Science", detail: "Sri Jayachamarajendra Government Polytechnic, Bengaluru. Three years of Python, data structures and my first real projects." },
    { year: "2026", title: "9.83 CGPA, DCET Rank 22", detail: "Finished the diploma with a 9.83 CGPA and came 22nd in the Karnataka Diploma Entrance Test — enough to walk into RVCE." },
    { year: "2026", title: "Joined RVCE, B.E. CSE", detail: "Lateral entry straight into 3rd semester, into a syllabus that quietly assumes you already know pointers." },
    { year: "2026", title: "GapBridge", detail: "RVCE III Semester Experiential Learning project. Led the RAG chatbot and the frontend integration on an 8-module team." },
    { year: "2026", title: "This 3D portfolio", detail: "Because a resume should be something you can spin around." }
  ],

  /* ---------------------------------------------------------
     6. CONTACT
     --------------------------------------------------------- */
  contact: {
    heading: "Let's build something",
    text: "I'm looking for an AI engineering internship, or a team that needs someone comfortable moving between Python services, LLM pipelines and the React on top. If that sounds like you, my inbox is open.",
    availability: "Open to AI engineering internships",
    responseTime: "Usually replies within a day"
  }
};
