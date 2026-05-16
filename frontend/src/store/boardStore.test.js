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
});
