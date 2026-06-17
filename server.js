// ============================================
// MARINE ECO NEWS - Backend API (Node.js/Express)
// ============================================
// Install: npm install express cors bcryptjs jsonwebtoken
// Run: node server.js
// ============================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3001;
const JWT_SECRET = "marine-eco-secret-2025";

app.use(cors());
app.use(express.json());

// ===== IN-MEMORY DATABASE (replace with real DB) =====
let DB = {
  users: [
    { id: 1, name: "Admin", email: "admin@marine-eco.ma", passwordHash: bcrypt.hashSync("admin123", 10), role: "admin", createdAt: "2025-01-01" },
    { id: 2, name: "Mohammed Alami", email: "m.alami@email.ma", passwordHash: bcrypt.hashSync("user123", 10), role: "user", createdAt: "2025-01-10" },
  ],
  articles: [
    { id: 1, title: "اكتشاف 12 نوعاً جديداً من الأسماك", content: "محتوى المقال...", tag: "تنوع بيولوجي", author: "د. سارة بنعلي", authorId: 1, status: "published", emoji: "🐠", views: 2140, createdAt: "2025-01-15" },
    { id: 2, title: "تلوث البلاستيك في المتوسط", content: "محتوى المقال...", tag: "تلوث", author: "فريق التحرير", authorId: 1, status: "published", emoji: "🏭", views: 3850, createdAt: "2025-01-12" },
    { id: 3, title: "ارتفاع حرارة المحيطات", content: "محتوى المقال...", tag: "تغير مناخي", author: "أحمد الحسيني", authorId: 2, status: "pending", emoji: "🌡️", views: 1920, createdAt: "2025-01-10" },
  ],
  comments: [
    { id: 1, text: "مقال رائع جداً!", articleId: 1, userId: 2, userName: "Mohammed", status: "approved", likes: 12, createdAt: "2025-01-16" },
    { id: 2, text: "معلومات قيمة عن البيئة", articleId: 2, userId: 2, userName: "Fatima", status: "pending", likes: 5, createdAt: "2025-01-13" },
  ],
  settings: {
    siteName: "البيئة البحرية",
    breakingNews: "🔴 ارتفاع درجة حرارة المحيطات بنسبة 2.1 درجة خلال العقد الماضي",
    maintenanceMode: false
  }
};

// ===== MIDDLEWARE =====
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "غير مصرح" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "رمز غير صالح" });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "ليس لديك صلاحية" });
  next();
}

// ===== AUTH ROUTES =====
// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (DB.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
  }
  const newUser = {
    id: DB.users.length + 1,
    name, email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: "user",
    createdAt: new Date().toISOString().split("T")[0]
  };
  DB.users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
});

// GET /api/auth/me
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = DB.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// ===== ARTICLES ROUTES =====
// GET /api/articles
app.get("/api/articles", (req, res) => {
  const { tag, status, search, page = 1, limit = 10 } = req.query;
  let articles = DB.articles.filter(a => a.status === "published");

  if (tag) articles = articles.filter(a => a.tag === tag);
  if (search) articles = articles.filter(a => a.title.includes(search) || a.content.includes(search));

  const total = articles.length;
  const start = (page - 1) * limit;
  const paginated = articles.slice(start, start + parseInt(limit));

  res.json({ articles: paginated, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
});

// GET /api/articles/:id
app.get("/api/articles/:id", (req, res) => {
  const article = DB.articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: "المقال غير موجود" });
  article.views++;
  res.json(article);
});

// POST /api/articles (admin)
app.post("/api/articles", authMiddleware, adminMiddleware, (req, res) => {
  const { title, content, tag, emoji, status = "draft" } = req.body;
  if (!title || !content) return res.status(400).json({ error: "العنوان والمحتوى مطلوبان" });
  const user = DB.users.find(u => u.id === req.user.id);
  const newArticle = {
    id: DB.articles.length + 1, title, content, tag, emoji: emoji || "📰",
    author: user.name, authorId: user.id, status, views: 0,
    createdAt: new Date().toISOString().split("T")[0]
  };
  DB.articles.push(newArticle);
  res.status(201).json(newArticle);
});

// PUT /api/articles/:id (admin)
app.put("/api/articles/:id", authMiddleware, adminMiddleware, (req, res) => {
  const idx = DB.articles.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "المقال غير موجود" });
  DB.articles[idx] = { ...DB.articles[idx], ...req.body };
  res.json(DB.articles[idx]);
});

// DELETE /api/articles/:id (admin)
app.delete("/api/articles/:id", authMiddleware, adminMiddleware, (req, res) => {
  const idx = DB.articles.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "المقال غير موجود" });
  DB.articles.splice(idx, 1);
  res.json({ message: "تم حذف المقال" });
});

// ===== COMMENTS ROUTES =====
// GET /api/comments?articleId=
app.get("/api/comments", (req, res) => {
  const { articleId } = req.query;
  let comments = DB.comments.filter(c => c.status === "approved");
  if (articleId) comments = comments.filter(c => c.articleId === parseInt(articleId));
  res.json(comments);
});

// POST /api/comments
app.post("/api/comments", authMiddleware, (req, res) => {
  const { text, articleId } = req.body;
  if (!text || !articleId) return res.status(400).json({ error: "النص ورقم المقال مطلوبان" });
  const user = DB.users.find(u => u.id === req.user.id);
  const newComment = {
    id: DB.comments.length + 1, text, articleId: parseInt(articleId),
    userId: user.id, userName: user.name, status: "pending",
    likes: 0, createdAt: new Date().toISOString().split("T")[0]
  };
  DB.comments.push(newComment);
  res.status(201).json({ ...newComment, message: "تعليقك قيد المراجعة" });
});

// PUT /api/comments/:id/approve (admin)
app.put("/api/comments/:id/approve", authMiddleware, adminMiddleware, (req, res) => {
  const comment = DB.comments.find(c => c.id === parseInt(req.params.id));
  if (!comment) return res.status(404).json({ error: "التعليق غير موجود" });
  comment.status = "approved";
  res.json(comment);
});

// DELETE /api/comments/:id (admin)
app.delete("/api/comments/:id", authMiddleware, adminMiddleware, (req, res) => {
  const idx = DB.comments.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "التعليق غير موجود" });
  DB.comments.splice(idx, 1);
  res.json({ message: "تم حذف التعليق" });
});

// ===== USERS ROUTES (admin) =====
// GET /api/users
app.get("/api/users", authMiddleware, adminMiddleware, (req, res) => {
  const users = DB.users.map(({ passwordHash, ...u }) => u);
  res.json(users);
});

// PUT /api/users/:id/role (admin)
app.put("/api/users/:id/role", authMiddleware, adminMiddleware, (req, res) => {
  const user = DB.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
  user.role = req.body.role;
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

// ===== SETTINGS =====
// GET /api/settings
app.get("/api/settings", (req, res) => res.json(DB.settings));

// PUT /api/settings (admin)
app.put("/api/settings", authMiddleware, adminMiddleware, (req, res) => {
  DB.settings = { ...DB.settings, ...req.body };
  res.json(DB.settings);
});

// ===== STATS =====
// GET /api/stats (admin)
app.get("/api/stats", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    totalArticles: DB.articles.length,
    publishedArticles: DB.articles.filter(a => a.status === "published").length,
    pendingArticles: DB.articles.filter(a => a.status === "pending").length,
    totalUsers: DB.users.length,
    totalComments: DB.comments.length,
    pendingComments: DB.comments.filter(c => c.status === "pending").length,
    totalViews: DB.articles.reduce((sum, a) => sum + a.views, 0)
  });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🌊 Marine Eco News API running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   GET  /api/articles`);
  console.log(`   POST /api/articles (admin)`);
  console.log(`   GET  /api/comments`);
  console.log(`   POST /api/comments (auth)`);
  console.log(`   GET  /api/users (admin)`);
  console.log(`   GET  /api/stats (admin)`);
});
