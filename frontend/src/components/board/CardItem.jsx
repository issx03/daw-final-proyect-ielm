import React, { useEffect, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useBoardStore from '../../store/boardStore';
import { useAuth } from '../../context/AuthContext';

export const CardItemContent = React.memo(React.forwardRef(
  ({ card, isOverlay, isDragging, style, onClick, ...props }, ref) => {
    const { user } = useAuth();
    const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

    return (
      <div
        ref={ref}
        style={style}
        onClick={onClick}
        className={`group relative bg-[#2E2E40] rounded-xl border border-[#3A3A4A] p-3 cursor-pointer transition-all duration-200 hover:border-[#4A4A5A] hover:bg-[#363648] active:cursor-grabbing ${
          isDragging ? 'opacity-50' : ''
        } ${isOverlay ? 'opacity-100 rotate-2 shadow-2xl' : ''}`}
        {...props}
      >
        <div className="flex flex-col gap-2">
          <h4 className="text-[13px] font-semibold text-[#E8E8EF] leading-snug tracking-tight">
            {card.title}
          </h4>
          
          <div className="flex items-center justify-end pt-2 border-t border-[#3A3A4A]">
            <div className="w-5 h-5 rounded-full bg-[#4ECDC4] flex items-center justify-center text-[8px] font-bold text-[#1A1A24] overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
));

const CardItem = React.memo(({ card, listId }) => {
  const setSelectedCard = useBoardStore(state => state.setSelectedCard);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card && card.id ? `card-${card.id}` : 'card-invalid',
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handlePointerDown = useCallback((e) => {
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    if (listeners && listeners.onPointerDown) {
      listeners.onPointerDown(e);
    }
  }, [listeners]);

  const handleClick = useCallback((e) => {
    const distance = Math.sqrt(
      Math.pow(e.clientX - pointerStartX.current, 2) +
      Math.pow(e.clientY - pointerStartY.current, 2)
    );
    
    if (distance > 3) {
      return;
    }
    
    setSelectedCard(card, listId);
  }, [card, listId, setSelectedCard]);

  const combinedListeners = {
    ...listeners,
    onPointerDown: handlePointerDown,
  };

  return (
    <CardItemContent
      ref={setNodeRef}
      style={style}
      card={card}
      isDragging={isDragging}
      onClick={handleClick}
      {...attributes}
      {...combinedListeners}
    />
  );
});

export default CardItem;
