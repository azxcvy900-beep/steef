const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!apiKey) {
  console.log('Loading .env.local');
  const fs = require('fs');
  const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())));
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = env.NEXT_PUBLIC_FIREBASE_API_KEY;
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
const db = getFirestore(app);

async function testAgenticWorkflow() {
  const url = 'http://localhost:3000/api/chat';
  
  async function chat(msg) {
    console.log(`\nUser: ${msg}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, userId: 'user_001' })
    });
    const data = await res.json();
    console.log(`Saif: ${data.response}`);
    console.log(`Intent: ${data.intent}, Actions: ${data.actionsPerformed?.join(',') || 'none'}`);
    return data;
  }

  // 1. Simple chat
  await chat('مرحبا، هل تسمعني؟');

  // 2. Save Memory
  await chat('تذكر دائماً أنني أحب شرب القهوة بدون سكر');
  
  // 3. Create Task
  await chat('أنشئ مهمة جديدة غداً بعنوان مراجعة تقرير الأداء المالي');

  // 4. Verify Firestore
  console.log('\n--- Verifying Firestore Data ---');
  
  const tasksSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', 'user_001')));
  console.log(`Tasks found: ${tasksSnap.size}`);
  tasksSnap.forEach(doc => console.log(' - Task:', doc.data().title));

  const memoriesSnap = await getDocs(query(collection(db, 'memories'), where('userId', '==', 'user_001')));
  console.log(`Memories found: ${memoriesSnap.size}`);
  memoriesSnap.forEach(doc => console.log(' - Memory:', doc.data().content));

  process.exit(0);
}

// Give Vercel 10s more to finish deploying before running this script
console.log('Waiting 10s for Vercel deployment...');
setTimeout(testAgenticWorkflow, 10000);
