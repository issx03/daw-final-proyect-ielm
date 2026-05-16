import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/listService', () => ({
  default: {
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../api/cardService', () => ({
  default: {
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import useBoardStore from './boardStore';
import listService from '../api/listService';
import cardService from '../api/cardService';
import api from '../api/axios';

describe('boardStore CRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useBoardStore.setState({
      board: null,
      lists: [],
      cards: {},
      loading: false,
      error: null,
    });
  });

  describe('updateList', () => {
    it('updates a list successfully', async () => {
      useBoardStore.setState({ lists: [{ id: 1, title: 'Old' }] });
      listService.update.mockResolvedValue({ id: 1, title: 'New' });

      await useBoardStore.getState().updateList(1, { title: 'New' });

      const state = useBoardStore.getState();
      expect(state.lists[0].title).toBe('New');
      expect(state.error).toBeNull();
    });

    it('handles updateList failure', async () => {
      useBoardStore.setState({ lists: [{ id: 1, title: 'Old' }] });
      listService.update.mockRejectedValue({ response: { data: { detail: 'E' } } });

      await expect(
        useBoardStore.getState().updateList(1, { title: 'New' })
      ).rejects.toBeDefined();

      const state = useBoardStore.getState();
      expect(state.error).toBe('E');
    });
  });

  describe('deleteList', () => {
    it('deletes a list and its cards', async () => {
      useBoardStore.setState({
        lists: [{ id: 1 }],
        cards: { 1: [{ id: 10 }] },
      });
      listService.delete.mockResolvedValue({});

      await useBoardStore.getState().deleteList(1);

      const state = useBoardStore.getState();
      expect(state.lists).toEqual([]);
      expect(state.cards).not.toHaveProperty('1');
    });

    it('handles deleteList failure', async () => {
      useBoardStore.setState({
        lists: [{ id: 1 }],
        cards: { 1: [{ id: 10 }] },
      });
      listService.delete.mockRejectedValue({ response: { data: { detail: 'E' } } });

      await expect(useBoardStore.getState().deleteList(1)).rejects.toBeDefined();

      const state = useBoardStore.getState();
      expect(state.error).toBe('E');
    });
  });

  describe('updateCard', () => {
    it('updates a card across all lists', async () => {
      useBoardStore.setState({
        cards: {
          1: [{ id: 99, title: 'A' }],
          2: [{ id: 99, title: 'A' }],
        },
      });
      cardService.update.mockResolvedValue({ id: 99, title: 'B' });

      await useBoardStore.getState().updateCard(99, { title: 'B' });

      const state = useBoardStore.getState();
      expect(state.cards[1][0].title).toBe('B');
      expect(state.cards[2][0].title).toBe('B');
    });

    it('handles updateCard failure', async () => {
      cardService.update.mockRejectedValue({ response: { data: { detail: 'E' } } });

      await expect(
        useBoardStore.getState().updateCard(99, { title: 'B' })
      ).rejects.toBeDefined();

      const state = useBoardStore.getState();
      expect(state.error).toBe('E');
    });
  });

  describe('deleteCard', () => {
    it('deletes a card from a list', async () => {
      useBoardStore.setState({
        cards: { 1: [{ id: 10 }, { id: 11 }] },
      });
      cardService.delete.mockResolvedValue({});

      await useBoardStore.getState().deleteCard(10, 1);

      const state = useBoardStore.getState();
      expect(state.cards[1]).toEqual([{ id: 11 }]);
    });

    it('handles deleteCard failure', async () => {
      cardService.delete.mockRejectedValue({ response: { data: { detail: 'E' } } });

      await expect(useBoardStore.getState().deleteCard(10, 1)).rejects.toBeDefined();

      const state = useBoardStore.getState();
      expect(state.error).toBe('E');
    });
  });

  describe('fetchBoard', () => {
    it('fetches and normalizes board data', async () => {
      api.get.mockResolvedValue({
        data: {
          id: 1,
          title: 'B',
          lists: [
            {
              id: 10,
              title: 'L1',
              position: 0,
              cards: [{ id: 20, position: 0 }],
            },
          ],
        },
      });

      await useBoardStore.getState().fetchBoard(1);

      const state = useBoardStore.getState();
      expect(state.board).toEqual({ id: 1, title: 'B' });
      expect(state.lists[0].id).toBe(10);
      expect(state.cards[10][0].id).toBe(20);
      expect(state.loading).toBe(false);
    });

    it('handles fetchBoard failure', async () => {
      api.get.mockRejectedValue({ response: { data: { detail: 'NF' } } });

      await useBoardStore.getState().fetchBoard(1);

      const state = useBoardStore.getState();
      expect(state.error).toBe('NF');
      expect(state.loading).toBe(false);
    });
  });

  describe('findCardContainer', () => {
    it('finds container by prefixed card id', () => {
      useBoardStore.setState({
        cards: { 1: [{ id: 10 }] },
      });

      const result = useBoardStore.getState().findCardContainer('card-10');
      expect(result).toBe('1');
    });

    it('finds container by prefixed list id', () => {
      useBoardStore.setState({
        cards: { 1: [] },
      });

      const result = useBoardStore.getState().findCardContainer('list-1');
      expect(result).toBe('1');
    });

    it('finds container by raw card id', () => {
      useBoardStore.setState({
        cards: { 1: [{ id: 10 }] },
      });

      const result = useBoardStore.getState().findCardContainer('10');
      expect(result).toBe('1');
    });

    it('returns null for unknown id', () => {
      const result = useBoardStore.getState().findCardContainer('card-999');
      expect(result).toBeNull();
    });
  });

  describe('moveCardOptimistic', () => {
    it('reorders cards within the same list', () => {
      useBoardStore.setState({
        cards: { 1: [{ id: 10 }, { id: 11 }, { id: 12 }] },
      });

      useBoardStore.getState().moveCardOptimistic('card-10', 'card-12');

      const state = useBoardStore.getState();
      // Moves card-10 to position of card-12 (index 2), result: [11, 12, 10]
      expect(state.cards[1].map(c => c.id)).toEqual([11, 12, 10]);
    });

    it('moves card to another list', () => {
      useBoardStore.setState({
        cards: {
          1: [{ id: 10, list_id: 1 }],
          2: [{ id: 11, list_id: 2 }],
        },
      });

      useBoardStore.getState().moveCardOptimistic('card-10', 'card-11');

      const state = useBoardStore.getState();
      expect(state.cards[1]).toEqual([]);
      expect(state.cards[2].map(c => c.id)).toEqual([10, 11]);
      expect(state.cards[2][0].list_id).toBe(2);
    });

    it('appends to end when dropping on list container', () => {
      useBoardStore.setState({
        cards: {
          1: [{ id: 10, list_id: 1 }],
          2: [{ id: 11, list_id: 2 }],
        },
      });

      useBoardStore.getState().moveCardOptimistic('card-10', 'list-2');

      const state = useBoardStore.getState();
      expect(state.cards[1]).toEqual([]);
      expect(state.cards[2].map(c => c.id)).toEqual([11, 10]);
    });

    it('does nothing when active and over are the same', () => {
      useBoardStore.setState({
        cards: { 1: [{ id: 10 }, { id: 11 }] },
      });

      useBoardStore.getState().moveCardOptimistic('card-10', 'card-10');

      const state = useBoardStore.getState();
      expect(state.cards[1].map(c => c.id)).toEqual([10, 11]);
    });
  });

  describe('moveCardBackend', () => {
    it('calls API to persist card move', async () => {
      useBoardStore.setState({
        board: { id: 1 },
      });
      api.patch.mockResolvedValue({});

      await useBoardStore.getState().moveCardBackend('card-10', '2', 1);

      expect(api.patch).toHaveBeenCalledWith('/cards/10/move', {
        list_id: 2,
        position: 1,
      });
    });

    it('rolls back by re-fetching board on failure', async () => {
      useBoardStore.setState({
        board: { id: 1 },
      });
      api.patch.mockRejectedValue(new Error('Network error'));
      api.get.mockResolvedValue({
        data: { id: 1, title: 'B', lists: [] },
      });

      await useBoardStore.getState().moveCardBackend('card-10', '2', 1);

      expect(api.patch).toHaveBeenCalled();
      expect(api.get).toHaveBeenCalledWith('/boards/1');
    });
  });
});
