import { GeminiProvider } from './src/ai/GeminiProvider';
import { ExecutiveAgent } from './src/agents/executive/ExecutiveAgent';

async function main() {
  const provider = new GeminiProvider(process.argv[2]); // pass key as arg
  const agent = new ExecutiveAgent(provider, null, null);
  
  const res = await (agent as any).classify('تذكر أنني أحب شرب القهوة بدون سكر');
  console.log('Result:', res);
}

main().catch(console.error);
