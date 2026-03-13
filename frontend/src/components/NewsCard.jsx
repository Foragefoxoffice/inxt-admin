import React from 'react';
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react';

const NewsCard = ({ event }) => {
  const { title, featuredImage, eventDate, eventLocation, status } = event;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={featuredImage || 'https://via.placeholder.com/600x400'} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'published' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center space-x-4 text-slate-400 text-xs mb-3 font-medium">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(eventDate).toLocaleDateString()}</span>
          </div>
          {eventLocation && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 leading-tight mb-4 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        
        <button className="flex items-center space-x-2 text-primary-600 font-bold text-sm group/btn">
          <span>Read More</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};

export default NewsCard;
