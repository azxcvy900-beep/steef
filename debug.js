async function main() {
  const prompt = `حلل طلب المستخدم وصنفه في تنسيق JSON. استخرج أي إجراء (action) مطلوب لتحديث قاعدة البيانات.

طلب المستخدم: "أنشئ مهمة جديدة غداً بعنوان مراجعة تقرير الأداء المالي"

الرجاء إعادة JSON فقط بهذا الشكل:
{
  "intent": "TASK|PROJECT|IDEA|DECISION|DEVELOPMENT|REPORT|QUERY|SETTINGS|UNKNOWN",
  "confidence": 0.95,
  "action": {
    "type": "NONE|CREATE_TASK|SAVE_MEMORY",
    "data": {
      "title": "عنوان المهمة",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "content": "محتوى الذاكرة للتذكر",
      "memoryType": "FACT|PREFERENCE"
    }
  },
  "arabic_summary": "ملخص قصير للطلب بالعربية"
}`;

  const res = await fetch('https://steef.vercel.app/api/gemini-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    })
  });
  console.log(JSON.stringify(await res.json(), null, 2));
}
main();
