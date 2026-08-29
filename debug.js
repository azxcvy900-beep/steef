async function main() {
  const res = await fetch('https://steef.vercel.app/api/debug-classify', {
    method: 'POST',
    body: JSON.stringify({ message: 'أنشئ مهمة جديدة غداً بعنوان مراجعة تقرير الأداء المالي' })
  });
  console.log(await res.json());
}
main();
