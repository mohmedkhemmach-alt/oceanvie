// ===== DATA =====
const ARTICLES = [
  {
    id: 1, emoji: "🐠",
    tag: "تنوع بيولوجي",
    title: "اكتشاف 12 نوعاً جديداً من الأسماك في أعماق المحيط الهندي",
    excerpt: "فريق من العلماء الدوليين يعلن عن اكتشاف أنواع جديدة لم تُرصد من قبل في أعماق تتجاوز 3000 متر.",
    date: "١٥ يناير ٢٠٢٥", author: "د. سارة بنعلي", views: 2140
  },
  {
    id: 2, emoji: "🏭",
    tag: "تلوث",
    title: "تقرير: تصاعد خطير في مستويات الميكروبلاستيك بشواطئ البحر المتوسط",
    excerpt: "دراسة جديدة تكشف أن كل كيلومتر من شواطئ المتوسط يحتوي على أكثر من 700 ألف جسيم بلاستيكي.",
    date: "١٢ يناير ٢٠٢٥", author: "فريق التحرير", views: 3850
  },
  {
    id: 3, emoji: "🌡️",
    tag: "تغير مناخي",
    title: "سجلات حرارة قياسية: المحيطات تمتص 90٪ من حرارة الكوكب الزائدة",
    excerpt: "تقرير مناخي جديد يوضح كيف تعمل المحيطات كمنظم حراري للأرض وما يعنيه ذلك للمستقبل.",
    date: "١٠ يناير ٢٠٢٥", author: "أحمد الحسيني", views: 1920
  },
  {
    id: 4, emoji: "🐋",
    tag: "حماية",
    title: "نجاح برنامج إعادة توطين الحيتان الزرقاء في المحيط الهادئ",
    excerpt: "بعد عقد من الجهود الدولية، تشير البيانات إلى انتعاش ملحوظ في أعداد الحيتان الزرقاء بمنطقة المحيط الهادئ.",
    date: "٨ يناير ٢٠٢٥", author: "منظمة حماية البحار", views: 4200
  },
  {
    id: 5, emoji: "🌊",
    tag: "أبحاث",
    title: "العلماء يكشفون عن خريطة شاملة لتيارات المحيط العالمي",
    excerpt: "مشروع بحثي ضخم يقدم أول خريطة ثلاثية الأبعاد لتيارات المحيط العالمية بدقة غير مسبوقة.",
    date: "٥ يناير ٢٠٢٥", author: "المعهد الدولي للبحار", views: 1560
  },
  {
    id: 6, emoji: "🪸",
    tag: "شعاب مرجانية",
    title: "مبادرة مغربية لإعادة زراعة الشعاب المرجانية في سواحل الأطلنطي",
    excerpt: "المغرب يطلق مبادرة بيئية طموحة لإعادة توطين الشعاب المرجانية على طول سواحله الأطلنطية.",
    date: "٣ يناير ٢٠٢٥", author: "وزارة البيئة المغربية", views: 2880
  }
];

// ===== RENDER NEWS =====
function renderNews(articles = ARTICLES) {
  const grid = document.getElementById("news-grid");
  if (!grid) return;
  grid.innerHTML = articles.slice(0, 6).map(a => `
    <div class="news-card" onclick="location.href='article.html?id=${a.id}'">
      <div class="news-card-img">${a.emoji}</div>
      <div class="news-card-body">
        <span class="news-tag">${a.tag}</span>
        <h3>${a.title}</h3>
        <p>${a.excerpt}</p>
        <div class="news-meta">
          <span>${a.date}</span>
          <span>👁 ${a.views.toLocaleString('ar')}</span>
        </div>
      </div>
    </div>
  `).join("");
}

// ===== LANGUAGE SWITCHER =====
const TRANSLATIONS = {
  ar: { dir: "rtl", lang: "ar" },
  fr: { dir: "ltr", lang: "fr" },
  en: { dir: "ltr", lang: "en" }
};

function setLang(lang) {
  document.documentElement.dir = TRANSLATIONS[lang].dir;
  document.documentElement.lang = lang;
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".lang-btn").forEach(b => {
    if (b.textContent === lang.toUpperCase()) b.classList.add("active");
  });
  localStorage.setItem("marine-lang", lang);
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderNews();
  const savedLang = localStorage.getItem("marine-lang") || "ar";
  setLang(savedLang);
});
