'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

interface CommentAuthor {
  id: string;
  name: string | null;
  email: string;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentThreadProps {
  recordType: string;
  recordId: string;
  currentUserId: string;
  currentUserRole: string;
}

export function CommentThread({ recordType, recordId, currentUserId, currentUserRole }: CommentThreadProps) {
  const [comments, setComments]   = useState<Comment[]>([]);
  const [body, setBody]           = useState('');
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?recordType=${encodeURIComponent(recordType)}&recordId=${encodeURIComponent(recordId)}`);
    if (res.ok) {
      const data = await res.json() as Comment[];
      setComments(data);
    }
    setLoading(false);
  }, [recordType, recordId]);

  useEffect(() => { void fetchComments(); }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordType, recordId, body: body.trim() }),
      });
      if (res.ok) {
        setBody('');
        await fetchComments();
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to post comment.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground/70" />
        <h3 className="text-sm font-semibold text-foreground">
          Comments {comments.length > 0 && <span className="text-muted-foreground/60 font-normal">({comments.length})</span>}
        </h3>
      </div>

      {/* Thread */}
      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <p className="text-xs text-muted-foreground/60">Loading comments&hellip;</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground/60">No comments yet. Be the first to add one.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-3 group">
              <div className="w-7 h-7 rounded-full bg-teal-600/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-teal-600">
                  {(comment.author.name ?? comment.author.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {comment.author.name ?? comment.author.email}
                  </span>
                  <span className="text-xs text-muted-foreground/50 flex-shrink-0">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {' '}
                    {new Date(comment.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">{comment.body}</p>
              </div>
              {(comment.author.id === currentUserId || isAdmin) && (
                <button
                  onClick={() => void handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 flex-shrink-0 mt-0.5"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={e => void handleSubmit(e)} className="px-5 pb-4 border-t border-border/30 pt-4 space-y-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="self-end flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
