import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, ChevronLeft } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useBoardStore from '../store/boardStore';
import ListCard from '../components/board/ListCard';
import { CardItemContent } from '../components/board/CardItem';
import CardModal from '../components/board/CardModal';
import ConfirmModal from '../components/common/ConfirmModal';
import DnDErrorBoundary from '../components/common/DnDErrorBoundary';
import { normalizeBoardColor } from '../utils/boardColors';

const isTouchDevice = typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const board = useBoardStore(state => state.board);
  const lists = useBoardStore(state => state.lists);
  const loading = useBoardStore(state => state.loading);
  const error = useBoardStore(state => state.error);
  const fetchBoard = useBoardStore(state => state.fetchBoard);
  const createList = useBoardStore(state => state.createList);
  const moveCardOptimistic = useBoardStore(state => state.moveCardOptimistic);
  const moveCardBackend = useBoardStore(state => state.moveCardBackend);
  const findCardContainer = useBoardStore(state => state.findCardContainer);
  const deleteBoard = useBoardStore(state => state.deleteBoard);
  const selectedCard = useBoardStore(state => state.selectedCard);
  const selectedListId = useBoardStore(state => state.selectedListId);
  const setSelectedCard = useBoardStore(state => state.setSelectedCard);
  
  const [activeDragCard, setActiveDragCard] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const createListRef = useRef(null);

  useEffect(() => {
    if (!isCreatingList) return;
    const handleClickOutside = (e) => {
      if (createListRef.current && !createListRef.current.contains(e.target)) {
        setIsCreatingList(false);
        setNewListTitle('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCreatingList]);

  useEffect(() => {
    if (id) fetchBoard(id);
  }, [id, fetchBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        ...(isTouchDevice && { delay: 250, tolerance: 5 }),
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateList = async (e) => {
    if (e) e.preventDefault();
    if (!newListTitle.trim()) return;
    await createList(id, newListTitle);
    setNewListTitle('');
    setIsCreatingList(false);
  };

  const handleCloseCardModal = () => {
    setSelectedCard(null, null);
  };

  const handleDragStart = ({ active }) => {
    const container = findCardContainer(active.id);
    if (container) {
      const cardId = String(active.id).replace('card-', '');
      const card = useBoardStore.getState().cards[container]?.find(c => String(c.id) === cardId);
      if (card) setActiveDragCard(card);
    }
  };

  const handleDragOver = ({ active, over }) => {
    if (!active || !over || active.id === over.id) return;
    // CRITICAL: setTimeout evita el Maximum update depth exceeded de dnd-kit (issue #1678)
    setTimeout(() => {
      moveCardOptimistic(active.id, over.id);
    }, 0);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveDragCard(null);
    if (!over) return;

    const container = findCardContainer(over.id);
    if (!container) return;

    const cardId = String(active.id).replace('card-', '');
    const containerCards = useBoardStore.getState().cards[container] || [];
    const index = containerCards.findIndex(c => String(c.id) === cardId);

    if (index !== -1) {
      await moveCardBackend(active.id, container, index);
    }
  };

  const handleDragCancel = () => {
    setActiveDragCard(null);
  };

  const handleDeleteBoard = async () => {
    await deleteBoard(id);
    navigate('/dashboard');
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center board-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A3A] border-t-[#7C6BEF]" />
        <p className="text-[11px] font-medium text-[#6B7280]">Loading board...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-full items-center justify-center board-bg px-6 text-center">
      <div className="max-w-sm">
        <h2 className="text-lg font-semibold text-[#E8E8EF] mb-2">Access Denied</h2>
        <p className="text-[13px] text-[#8B8B9A] mb-6 leading-relaxed">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-[#7C6BEF] text-white rounded-lg font-medium text-[13px] hover:bg-[#9B8AF7] transition-all"
        >
          Return to Hub
        </button>
      </div>
    </div>
  );

  if (!board) return null;

  return (
    <div className="h-full flex flex-col board-bg overflow-hidden relative">
      {/* ── Board Header ── */}
      <header className="h-16 flex-shrink-0 bg-[#1A1A24] border-b border-[#2A2A3A] px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-lg transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="h-6 w-px bg-[#2A2A3A]" />
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: normalizeBoardColor(board.color) }}
            />
            <h1 className="text-xl font-semibold text-[#E8E8EF] tracking-tight">
              {board.title}
            </h1>
          </div>
        </div>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-[13px] font-medium transition-all"
        >
          Delete Board
        </button>
      </header>

      {/* ── Lists Area ── */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-8">
        <div className="flex items-start gap-5 h-full min-w-max">
          <DnDErrorBoundary>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              {lists.map(list => (
                <ListCard key={list.id} list={list} />
              ))}
              <DragOverlay>
                {activeDragCard ? (
                  <CardItemContent card={activeDragCard} isOverlay />
                ) : null}
              </DragOverlay>
            </DndContext>
          </DnDErrorBoundary>

          {/* Add another list */}
          <div className="reveal-item">
            {isCreatingList ? (
              <div ref={createListRef} className="w-80 flex-shrink-0 bg-[#252533] rounded-2xl p-5 border border-[#2A2A3A] animate-in fade-in zoom-in-95 duration-200">
                <input
                  autoFocus
                  type="text"
                  placeholder="List name..."
                  className="w-full bg-[#1E1E28] border border-[#2A2A3A] focus:border-[#7C6BEF]/50 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#E8E8EF] transition-all outline-none mb-4 placeholder:text-[#4B5563]"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateList();
                    if (e.key === 'Escape') { setIsCreatingList(false); setNewListTitle(''); }
                  }}
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCreateList}
                    className="bg-[#7C6BEF] text-white flex-1 text-[12px] font-semibold py-2.5 rounded-xl hover:bg-[#9B8AF7] transition-all active:scale-95"
                  >
                    Add List
                  </button>
                  <button
                    onClick={() => { setIsCreatingList(false); setNewListTitle(''); }}
                    className="p-2.5 text-[#6B7280] hover:text-[#E8E8EF] hover:bg-[#2A2A3A] rounded-xl transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingList(true)}
                className="w-80 flex-shrink-0 h-12 bg-[#252533] hover:bg-[#2E2E40] border border-[#2A2A3A] hover:border-[#3A3A4A] rounded-xl flex items-center justify-center gap-2 px-6 text-[11px] font-semibold text-[#8B8B9A] hover:text-[#E8E8EF] uppercase tracking-wider transition-all duration-200 group"
              >
                <Plus size={14} className="transition-transform group-hover:rotate-90" />
                Add List
              </button>
            )}
          </div>
        </div>
      </main>

      <CardModal
        card={selectedCard}
        listId={selectedListId}
        isOpen={!!selectedCard}
        onClose={handleCloseCardModal}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete board?"
        message={`"${board.title}" and all its lists will be permanently deleted.`}
        confirmText="Delete"
        onConfirm={handleDeleteBoard}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default BoardView;
