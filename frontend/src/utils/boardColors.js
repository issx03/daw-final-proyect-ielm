export const normalizeBoardColor = (color) => {
  const map = {
    '#FF69B4': '#3B82F6',
    '#FF1493': '#3B82F6',
    '#FF0000': '#F43F5E',
    '#00FF00': '#10B981',
    '#0000FF': '#3B82F6',
    '#FFA500': '#F59E0B',
    '#800080': '#8B5CF6',
    '#FFC0CB': '#F43F5E',
  };
  return map[color] || color || '#64748B';
};
