import LoginForm from '@/components/LoginForm';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px'
    }}>
      <LoginForm />

      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '0',
        right: '0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: '500',
        letterSpacing: '0.04em',
        zIndex: 1
      }}>
        Built for DEI Students
      </div>
    </main>
  );
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
