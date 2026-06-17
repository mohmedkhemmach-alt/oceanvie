// ============================================
// MARINE ECO NEWS - AI Services
// Uses Anthropic Claude API
// ============================================
// npm install @anthropic-ai/sdk
// Set ANTHROPIC_API_KEY in environment
// ============================================

const Anthropic = require("@anthropic-ai/sdk");
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

// ===== 1. MARINE CHATBOT =====
async function marineChat(messages, lang = "ar") {
  const langInstruct = { ar: "أجب باللغة العربية", fr: "Répondez en français", en: "Answer in English" };
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `أنت خبير في البيئة البحرية والمحيطات. ${langInstruct[lang]}
    تخصصك: الأحياء البحرية، التلوث، الشعاب المرجانية، المحيطات، الحفاظ على البيئة.
    أجب بدقة علمية مع أسلوب مفهوم للعموم. استخدم الرموز التعبيرية باعتدال.`,
    messages
  });
  return response.content[0].text;
}

// ===== 2. ARTICLE GENERATION =====
async function generateArticle(topic, lang = "ar") {
  const prompt = lang === "ar"
    ? `اكتب مقالاً صحفياً احترافياً عن: ${topic}
       الموضوع: البيئة البحرية والمحيطات
       المتطلبات:
       - عنوان جذاب وواضح
       - مقدمة تشويقية (100 كلمة)
       - 3-4 فقرات رئيسية مع أدلة وإحصائيات
       - خاتمة تدعو للعمل
       - حوالي 600-800 كلمة
       أجب بتنسيق JSON: { "title": "...", "excerpt": "...", "content": "...", "tag": "..." }`
    : `Write a professional article about: ${topic} (marine environment context). JSON: { "title": "...", "excerpt": "...", "content": "...", "tag": "..." }`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }]
  });

  try {
    const text = response.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { title: topic, content: response.content[0].text, tag: "عام", excerpt: "" };
  }
}

// ===== 3. TRANSLATION =====
async function translateText(text, targetLang) {
  const langNames = { ar: "العربية", fr: "الفرنسية", en: "الإنجليزية" };
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `ترجم النص التالي إلى ${langNames[targetLang]}. أعد النص المترجم فقط بدون أي تعليقات:\n\n${text}`
    }]
  });
  return response.content[0].text;
}

// ===== 4. IMAGE ANALYSIS =====
async function analyzeMarineImage(imageBase64, mediaType = "image/jpeg") {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mediaType, data: imageBase64 }
        },
        {
          type: "text",
          text: `حلل هذه الصورة من منظور بيئي بحري:
          1. وصف ما تراه
          2. هل هناك مخاوف بيئية؟
          3. ما النوع البحري المحتمل (إن وجد)؟
          4. أي توصيات؟
          أجب باللغة العربية بشكل منظم.`
        }
      ]
    }]
  });
  return response.content[0].text;
}

// ===== 5. NEWS MONITORING =====
async function generateNewsSummary(newsItems) {
  const newsText = newsItems.map((n, i) => `${i+1}. ${n}`).join("\n");
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `أنت محرر متخصص في الأخبار البحرية. لخص هذه الأخبار وحدد الأكثر أهمية:

${newsText}

أجب بتنسيق JSON:
{
  "topStory": "الخبر الأهم",
  "summary": "ملخص عام (100 كلمة)",
  "breakingAlert": "خبر عاجل إن وجد أو null",
  "categories": { "pollution": [], "protection": [], "research": [] }
}`
    }]
  });

  try {
    const text = response.content[0].text;
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { topStory: newsItems[0], summary: response.content[0].text, breakingAlert: null, categories: {} };
  }
}

// ===== 6. COMMENT MODERATION =====
async function moderateComment(text) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `راجع هذا التعليق وقرر إذا كان مناسباً للنشر على موقع بيئي عائلي:
      
"${text}"

أجب بـ JSON فقط: { "approved": true/false, "reason": "السبب إن رُفض" }`
    }]
  });

  try {
    const clean = response.content[0].text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { approved: true, reason: null };
  }
}

// ===== EXPORT =====
module.exports = {
  marineChat,
  generateArticle,
  translateText,
  analyzeMarineImage,
  generateNewsSummary,
  moderateComment
};

// ===== DEMO =====
if (require.main === module) {
  (async () => {
    console.log("🤖 Testing AI Services...\n");

    console.log("1️⃣ Testing Chatbot...");
    const chatReply = await marineChat([{ role: "user", content: "ما هي الشعاب المرجانية؟" }]);
    console.log("Bot:", chatReply.slice(0, 150) + "...\n");

    console.log("2️⃣ Testing Translation...");
    const translated = await translateText("Ocean pollution is a global crisis.", "ar");
    console.log("Translated:", translated, "\n");

    console.log("✅ AI Services working!");
  })().catch(console.error);
}
