import { useState, useEffect, useRef } from 'react';
import { Loader2, Copy, Check, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Pairing({ onBotAdded }: { onBotAdded: () => void }) {
  const { user, limit, openLoginModal, decrementLimit } = useAuth();
  const [nomor, setNomor] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const simpanBotLokal = (num: string) => {
    let botSaya = JSON.parse(localStorage.getItem('botSaya') || '[]');
    if (!botSaya.includes(num)) {
      botSaya.push(num);
      localStorage.setItem('botSaya', JSON.stringify(botSaya));
    }
  };

  const cekStatus = async (num: string) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/pairing/status/${num}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      const data = await res.json();

      if (res.ok && data.status && data.code) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus('success');
        setMessage('Masukkan kode ini di WhatsApp:');
        setCode(data.code);
        setTimeout(onBotAdded, 5000);
      } else if (!res.ok) {
        console.error("Status check failed:", data.error || data.msg);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mintaKode = async () => {
    if (!user) {
      setStatus('error');
      setMessage('Silakan login terlebih dahulu!');
      return;
    }

    if (limit <= 0) {
      setStatus('error');
      setMessage('Limit harian kamu sudah habis. Silakan coba lagi besok (reset jam 00:00).');
      return;
    }

    const cleanNomor = nomor.replace(/\D/g, '');
    if (!cleanNomor) {
      setStatus('error');
      setMessage('Nomor WhatsApp harus diisi!');
      return;
    }

    setStatus('loading');
    setMessage('Memproses ke server...');
    setCode('');
    setCopied(false);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/pairing', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ nomor: cleanNomor })
      });
      const data = await res.json();

      if (res.ok && data.status) {
        simpanBotLokal(cleanNomor);
        setMessage('Bot sedang menyiapkan kode...');
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => cekStatus(cleanNomor), 3000);
      } else {
        setStatus('error');
        setMessage(`Gagal: ${data.error || data.msg || 'Terjadi kesalahan'}`);
      }
    } catch (e) {
      setStatus('error');
      setMessage('Koneksi ke server gagal!');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <section id="clone" className="py-24 px-6 max-w-3xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">New Instance</h2>
        <p className="text-neutral-400 text-sm">Enter your WhatsApp number to generate a pairing code.</p>
      </div>

      <div className="dev-card rounded-xl p-1">
        {!user ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <LogIn className="w-6 h-6 text-neutral-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Login Required</h3>
            <p className="text-neutral-400 text-sm mb-6 max-w-sm">
              You need to be logged in to deploy a new bot instance. Each user gets 3 free deployments per day.
            </p>
            <button
              onClick={openLoginModal}
              className="bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono text-neutral-500 uppercase tracking-wider">Phone Number</label>
                  <span className="text-xs font-mono text-neutral-500">
                    Remaining limit: <span className={limit > 0 ? "text-emerald-400" : "text-red-400"}>{limit}/3</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={nomor}
                  onChange={(e) => setNomor(e.target.value)}
                  placeholder="628123456789"
                  disabled={limit <= 0 || status === 'loading'}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                onClick={mintaKode}
                disabled={status === 'loading' || limit <= 0}
                className="w-full bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {status === 'loading' ? 'Generating...' : limit <= 0 ? 'Limit Reached' : 'Generate Code'}
              </button>
            </div>

            {status !== 'idle' && (
              <div className="border-t border-white/10 p-6 bg-black/50 rounded-b-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-neutral-300">Status</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded-md ${
                    status === 'error' ? 'bg-red-500/10 text-red-400' :
                    status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {status === 'loading' ? 'PROCESSING' : status === 'success' ? 'READY' : 'ERROR'}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mb-4">{message}</p>
                
                {code && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black border border-white/10 rounded-lg p-4 flex items-center justify-center">
                      <span className="text-3xl font-mono tracking-[0.2em] text-white">{code}</span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      className="h-full px-6 bg-neutral-900 border border-white/10 hover:bg-neutral-800 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors text-neutral-400 hover:text-white"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      <span className="text-xs font-medium">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
