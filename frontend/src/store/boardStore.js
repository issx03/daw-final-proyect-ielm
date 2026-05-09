import { create } from 'zustand';
import api from '../api/axios';

const useBoardStore = create((set, get) => ({
  board: null,
  lists: [],
  cards: {}, // Normalized state: Map of lists IDs to arrays of cards { listId: [card1, card2] }
  loading: false,
  error: null,

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
  }
}));

export default useBoardStore;
