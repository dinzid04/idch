import { Github, Globe, Twitter, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface AuthorData {
  name: string;
  description: string;
  photoURL: string;
  github: string;
  twitter: string;
  globe: string;
}

export default function Developer() {
  const [author, setAuthor] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'author'), (docSnap) => {
      if (docSnap.exists()) {
        setAuthor(docSnap.data() as AuthorData);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching author data:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section id="developer" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </section>
    );
  }

  if (!author) return null;

  return (
    <section id="developer" className="py-24 px-6 max-w-6xl mx-auto border-t border-white/10">
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Author</h2>
        <p className="text-neutral-400 text-sm">Developed and maintained by the developer.</p>
      </div>

      <div className="dev-card rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <img 
          src={author.photoURL} 
          alt="Developer" 
          className="w-24 h-24 rounded-full border border-white/10 grayscale hover:grayscale-0 transition-all object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1">
          <h3 className="text-xl font-medium text-white mb-1">{author.name}</h3>
          <p className="text-neutral-400 text-sm mb-4 max-w-md whitespace-pre-wrap">
            {author.description}
          </p>
          <div className="flex items-center gap-4">
            {author.github && author.github !== '#' && (
              <a href={author.github} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            )}
            {author.twitter && author.twitter !== '#' && (
              <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {author.globe && author.globe !== '#' && (
              <a href={author.globe} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
