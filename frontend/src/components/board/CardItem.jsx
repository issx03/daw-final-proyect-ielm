import React from 'react';

const CardItem = ({ card }) => {
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-medium text-slate-700 leading-snug">{card.title}</h4>
        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </button>
      </div>
      
      {card.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mt-1">{card.description}</p>
      )}
      
      {/* Footer metadata (badges, dates, etc.) could go here */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1" title="Comments">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};

export default CardItem;
