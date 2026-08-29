import { redirect } from 'next/navigation';

// Redirect root to chat (main interface)
export default function RootPage() {
  redirect('/chat');
}
