import { useState } from 'react';
import { Reorder } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import { 
  GripVertical, Trash2, Plus, Video, Quote,
  Image as ImageIcon, List as RichTextIcon,
  Type as HeadingIcon, Link as LinkIcon, X
} from 'lucide-react';
import FileUpload from './ui/FileUpload';

const BLOCK_TYPES = [
  { type: 'richText', label: 'Rich Text', icon: RichTextIcon, color: 'text-blue-500' },
  { type: 'heading', label: 'Heading', icon: HeadingIcon, color: 'text-purple-500' },
  { type: 'image', label: 'Image', icon: ImageIcon, color: 'text-orange-500' },
  { type: 'video', label: 'Video', icon: Video, color: 'text-red-500' },
  { type: 'quote', label: 'Quote', icon: Quote, color: 'text-teal-500' },
];

const BlockHeader = ({ type, onRemove, label, icon: Icon }) => (
  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 rounded-t-xl group-hover:bg-slate-100 transition-colors">
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <button
      type="button"
      onClick={onRemove}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);



const BlockEditor = ({ blocks = [], onChange }) => {
  const [activeType, setActiveType] = useState(null);

  // Ensure every block has a stable unique ID (blocks from DB may only have _id)
  const normalizedBlocks = blocks.map(b => ({
    ...b,
    id: b.id || b._id || `blk_${Math.random().toString(36).slice(2)}`
  }));

  const addBlock = (type) => {
    const newBlock = { id: `blk_${Date.now()}`, type, data: {} };
    if (type === 'richText') newBlock.data = { content: '' };
    if (type === 'heading') newBlock.data = { text: '', level: 2 };
    if (type === 'image') newBlock.data = { url: '', caption: '', mode: 'upload' };
    if (type === 'video') newBlock.data = { url: '', mode: 'link' };
    if (type === 'quote') newBlock.data = { text: '', author: '' };
    
    onChange([...normalizedBlocks, newBlock]);
    setActiveType(null);
  };

  const removeBlock = (id) => {
    onChange(normalizedBlocks.filter(b => b.id !== id));
  };

  const updateBlockData = (id, data) => {
    onChange(normalizedBlocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...data } } : b));
  };

  const reorderBlocks = (newOrder) => {
    onChange(newOrder);
  };

  return (
    <div className="space-y-6">
      <Reorder.Group axis="y" values={normalizedBlocks} onReorder={reorderBlocks} className="space-y-6">
        {normalizedBlocks.map((block) => (
          <Reorder.Item
            key={block.id}
            value={block}
            className="group relative bg-white rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
          >
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
              <div className="p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-primary-400">
                <GripVertical className="w-6 h-6" />
              </div>
            </div>
            <BlockHeader 
              type={block.type} 
              label={BLOCK_TYPES.find(t => t.type === block.type)?.label}
              icon={BLOCK_TYPES.find(t => t.type === block.type)?.icon}
              onRemove={() => removeBlock(block.id)} 
            />
            
            <div className="p-4">
              {block.type === 'richText' && (
                <RichTextEditor 
                  value={block.data.content} 
                  onChange={(val) => updateBlockData(block.id, { content: val })} 
                  placeholder="Explain your point here..."
                />
              )}

              {block.type === 'heading' && (
                <div className="flex gap-3">
                  <select 
                    value={block.data.level || 2}
                    onChange={(e) => updateBlockData(block.id, { level: parseInt(e.target.value) })}
                    className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={2}>H2</option>
                    <option value={3}>H3</option>
                    <option value={4}>H4</option>
                  </select>
                  <input
                    type="text"
                    value={block.data.text || ''}
                    onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter heading text..."
                  />
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateBlockData(block.id, { mode: 'upload' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${block.data.mode !== 'link' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBlockData(block.id, { mode: 'link' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${block.data.mode === 'link' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        External Link
                      </button>
                    </div>
                    {block.data.mode === 'link' ? (
                      <div className="flex-1 relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={block.data.url || ''}
                          onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    ) : (
                      <FileUpload type="image" onUpload={(url) => updateBlockData(block.id, { url })} />
                    )}
                  </div>

                  <input
                    type="text"
                    value={block.data.caption || ''}
                    onChange={(e) => updateBlockData(block.id, { caption: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm italic text-slate-600"
                    placeholder="Add an image caption..."
                  />

                  {block.data.url && (
                    <div className="relative group/img aspect-video rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
                      <img src={block.data.url.startsWith('/') ? `${window.location.origin}${block.data.url}` : block.data.url} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => updateBlockData(block.id, { url: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover/img:opacity-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {block.type === 'video' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateBlockData(block.id, { mode: 'upload' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${block.data.mode === 'upload' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBlockData(block.id, { mode: 'link' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${block.data.mode !== 'upload' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        YouTube/Vimeo
                      </button>
                    </div>
                    {block.data.mode === 'upload' ? (
                      <FileUpload type="video" onUpload={(url) => updateBlockData(block.id, { url })} />
                    ) : (
                      <div className="flex-1 relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={block.data.url || ''}
                          onChange={(e) => updateBlockData(block.id, { url: e.target.value })}
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter YouTube or Vimeo URL"
                        />
                      </div>
                    )}
                  </div>

                  {block.data.url && (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center text-white/50 text-[11px] font-bold tracking-widest uppercase border border-slate-800 shadow-inner">
                      {block.data.mode === 'upload' ? (
                        <video src={block.data.url} controls className="w-full h-full" />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Video className="w-10 h-10 opacity-20" />
                          External Video: {block.data.url}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {block.type === 'quote' && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border-l-4 border-teal-500 italic">
                  <textarea
                    value={block.data.text || ''}
                    onChange={(e) => updateBlockData(block.id, { text: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400"
                    placeholder="Enter quote text..."
                    rows={2}
                  />
                  <input
                    type="text"
                    value={block.data.author || ''}
                    onChange={(e) => updateBlockData(block.id, { author: e.target.value })}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-500"
                    placeholder="— Author name"
                  />
                </div>
              )}
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Add Block Selector */}
      <div className="relative">
        <div className="flex items-center gap-4 py-4">
          <div className="h-px flex-1 bg-slate-100" />
          <div className="flex gap-2">
            {BLOCK_TYPES.map((type) => (
              <button
                key={type.type}
                type="button"
                onClick={() => addBlock(type.type)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-100 hover:scale-105 transition-all group min-w-[80px]"
              >
                <div className={`p-2 rounded-xl bg-slate-50 group-hover:bg-primary-50 transition-colors ${type.color}`}>
                  <type.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-tight">{type.label}</span>
              </button>
            ))}
          </div>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

export default BlockEditor;
