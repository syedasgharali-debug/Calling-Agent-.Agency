import React, { useEffect } from 'react';
import { X, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Blog } from '../App';

interface BlogModalProps {
  blog: Blog;
  onClose: () => void;
}

const BlogModal: React.FC<BlogModalProps> = ({ blog, onClose }) => {
  // Lock body scroll when blog is opened
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const renderBlogContent = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={index} className="text-2xl font-black text-white mt-8 mb-4 tracking-tight border-l-4 border-indigo-500 pl-4">
            {paragraph.slice(4)}
          </h4>
        );
      }
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={index} className="text-3xl font-black text-white mt-10 mb-6 tracking-tight">
            {paragraph.slice(3)}
          </h3>
        );
      }
      return (
        <p key={index} className="text-slate-300 text-lg leading-relaxed mb-6 font-medium">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl px-4 py-8 md:p-12 flex justify-center overflow-y-auto"
      style={{ zIndex: 9999 }} // Ensures it sits absolutely on top of everything
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-[25rem] w-full">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          {/* Close button top right */}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-6 right-6 p-4 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-white hover:text-slate-950 transition-all shadow-xl hover:scale-105 z-20 cursor-pointer"
            title="Close article"
          >
            <X size={24} />
          </button>

          {/* Post Header on Cover */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <span className="px-4 py-1.5 bg-indigo-600/30 text-indigo-400 text-xs font-black uppercase tracking-widest rounded-full border border-indigo-500/30 mb-4 inline-block">
              AI Telephony Updates
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              {blog.title}
            </h2>
            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black text-white">
                  {blog.author[0]}
                </div>
                <span className="text-white">{blog.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-indigo-400" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} className="text-indigo-400" />
                <span>5 min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12 md:pt-16">
          <article className="prose prose-invert max-w-none text-left">
            {renderBlogContent(blog.fullContent || blog.content)}
          </article>
          
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center space-x-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 font-black text-white hover:bg-white/10 hover:border-indigo-500/20 transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
              <span>Back to Articles</span>
            </button>
            <span className="text-slate-500 text-sm font-black tracking-widest uppercase">
              CallingAgent.agency © 2026
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogModal;
