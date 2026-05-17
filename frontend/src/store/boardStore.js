import { create } from 'zustand';
import api from '../api/axios';
import listService from '../api/listService';
import cardService from '../api/cardService';

const useBoardStore = create((set, get) => ({
  board: null,
  lists: [],
  cards: {}, // Normalized state: Map of lists IDs to arrays of cards { listId: [card1, card2] }
  selectedCard: null, // Card currently being edited in modal
  selectedListId: null, // List ID of the selected card
  loading: false,
  error: null,

  setSelectedCard: (card, listId) => set({ selectedCard: card, selectedListId: listId }),

  fetchBoard: async (boardId) => {
    set({ loading: true, error: null });
    try {
      // Assuming GET /boards/{id} returns the full tree structure
      const response = await api.get(`/boards/${boardId}`);
      const boardData = response.data;
      
      const { lists, ...boardMetadata } = boardData;
      
      // Normalize lists and cards
      const normalizedLists = [];
      const normalizedCards = {};
      
      if (lists) {
        lists.forEach(list => {
          const { cards, ...listMetadata } = list;
          normalizedLists.push(listMetadata);
          normalizedCards[list.id] = cards || [];
        });
      }
      
      // Sort lists by position
      normalizedLists.sort((a, b) => a.position - b.position);
      
      // Sort cards within lists by position
      Object.keys(normalizedCards).forEach(listId => {
        normalizedCards[listId].sort((a, b) => a.position - b.position);
      });

      set({ 
        board: boardMetadata, 
        lists: normalizedLists, 
        cards: normalizedCards,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Failed to fetch board', 
        loading: false 
      });
    }
  },

  createList: async (boardId, title) => {
    set({ error: null });
    try {
      const position = get().lists.length;
      const response = await api.post('/lists/', { 
        title, 
        position, 
        board_id: parseInt(boardId) 
      });
      const newList = response.data;
      
      set(state => ({
        lists: [...state.lists, newList],
        cards: { ...state.cards, [newList.id]: [] }
      }));
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to create list' });
      console.error('Failed to create list:', error);
    }
  },

  createCard: async (listId, title, description = '') => {
    set({ error: null });
    try {
      const currentCards = get().cards[listId] || [];
      const position = currentCards.length;
      const response = await api.post('/cards/', { 
        title, 
        description, 
        position, 
        list_id: listId 
      });
      const newCard = response.data;
      
      set(state => ({
        cards: {
          ...state.cards,
          [listId]: [...(state.cards[listId] || []), newCard]
        }
      }));
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to create card' });
      console.error('Failed to create card:', error);
    }
  },

  updateList: async (id, data) => {
    set({ error: null });
    try {
      const updated = await listService.update(id, data);
      set(state => ({
        lists: state.lists.map(l => l.id === id ? { ...l, ...updated } : l)
      }));
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to update list' });
      console.error('Failed to update list:', error);
      throw error;
    }
  },

  deleteList: async (id) => {
    set({ error: null });
    try {
      await listService.delete(id);
      set(state => {
        const newCards = { ...state.cards };
        delete newCards[id];
        return {
          lists: state.lists.filter(l => l.id !== id),
          cards: newCards
        };
      });
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to delete list' });
      console.error('Failed to delete list:', error);
      throw error;
    }
  },

  updateCard: async (id, data) => {
    set({ error: null });
    try {
      const updated = await cardService.update(id, data);
      set(state => {
        const newCards = { ...state.cards };
        Object.keys(newCards).forEach(listId => {
          newCards[listId] = newCards[listId].map(c =>
            c.id === id ? { ...c, ...updated } : c
          );
        });
        return { cards: newCards };
      });
      return updated;
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to update card' });
      console.error('Failed to update card:', error);
      throw error;
    }
  },

  deleteCard: async (id, listId) => {
    set({ error: null });
    try {
      await cardService.delete(id);
      set(state => ({
        cards: {
          ...state.cards,
          [listId]: (state.cards[listId] || []).filter(c => c.id !== id)
        }
      }));
    } catch (error) {
      set({ error: error.response?.data?.detail || 'Failed to delete card' });
      console.error('Failed to delete card:', error);
      throw error;
    }
  },

  findCardContainer: (id) => {
    if (!id) return null;
    const idStr = String(id);
    const cards = get().cards;

    if (idStr.startsWith('card-')) {
      const cardId = idStr.replace('card-', '');
      for (const listId in cards) {
        if (cards[listId].some(c => String(c.id) === cardId)) {
          return String(listId);
        }
      }
    }

    if (idStr.startsWith('list-')) {
      return idStr.replace('list-', '');
    }

    for (const listId in cards) {
      if (cards[listId].some(c => String(c.id) === idStr)) {
        return String(listId);
      }
    }

    return null;
  },

  moveCardOptimistic: (activeId, overId) => {
    set((state) => {
      const activeIdStr = String(activeId);
      const overIdStr = String(overId);

      const activeContainer = get().findCardContainer(activeId);
      const overContainer = get().findCardContainer(overId);

      if (!activeContainer || !overContainer) return state;

      const currentCards = { ...state.cards };
      const realActiveId = activeIdStr.replace('card-', '');
      const realOverId = overIdStr.replace('card-', '').replace('list-', '');

      if (activeContainer === overContainer) {
        const items = [...(currentCards[activeContainer] || [])];
        const activeIndex = items.findIndex(c => String(c.id) === realActiveId);
        const overIndex = items.findIndex(c => String(c.id) === realOverId);

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return state;

        const newItems = [...items];
        const [movedItem] = newItems.splice(activeIndex, 1);
        newItems.splice(overIndex, 0, movedItem);

        return {
          cards: {
            ...currentCards,
            [activeContainer]: newItems
          }
        };
      }

      let movedItem = null;
      const newCards = {};

      Object.keys(currentCards).forEach(listId => {
        const items = [...(currentCards[listId] || [])];
        const index = items.findIndex(c => String(c.id) === realActiveId);
        if (index !== -1) {
          [movedItem] = items.splice(index, 1);
        }
        newCards[listId] = items;
      });

      if (!movedItem) return state;

      const overItems = [...(newCards[overContainer] || [])];
      const overIndex = overItems.findIndex(c => String(c.id) === realOverId);

      const isOverList = overIdStr.startsWith('list-');
      const insertAt = isOverList ? overItems.length : (overIndex >= 0 ? overIndex : overItems.length);

      overItems.splice(insertAt, 0, { ...movedItem, list_id: parseInt(overContainer) });
      newCards[overContainer] = overItems;

      return { cards: newCards };
    });
  },

  moveCardBackend: async (activeId, overContainerId, index) => {
    const cardId = String(activeId).replace('card-', '');
    try {
      await api.patch(`/cards/${cardId}/move`, {
        list_id: parseInt(overContainerId),
        position: index
      });
    } catch (err) {
      console.error('Failed to move card in backend:', err);
      const board = get().board;
      if (board) {
        get().fetchBoard(board.id);
      }
    }
  }
}));

export default useBoardStore;
