import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

vi.mock('../../api/cardService', () => ({
  default: {
    getById: vi.fn(),
  },
}));

vi.mock('../../store/boardStore', () => ({
  default: vi.fn(),
}));

import CardModal from './CardModal';
import cardService from '../../api/cardService';
import useBoardStore from '../../store/boardStore';

describe('CardModal', () => {
  const mockOnClose = vi.fn();
  const mockUpdateCard = vi.fn();
  const mockDeleteCard = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useBoardStore.mockImplementation((selector) => {
      const state = { updateCard: mockUpdateCard, deleteCard: mockDeleteCard };
      return selector ? selector(state) : state;
    });
  });

  it('renders loading spinner when fetching card', () => {
    const pending = new Promise(() => {});
    cardService.getById.mockReturnValue(pending);

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });

  it('fetches and displays card data', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: 'Desc' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('shows placeholder when no description', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });
    expect(screen.getByText('Add a more detailed description...')).toBeInTheDocument();
  });

  it('edits title on click and saves with Enter', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Old Title', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Old Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Old Title'));

    const input = screen.getByDisplayValue('Old Title');
    fireEvent.change(input, { target: { value: 'New' } });
    mockUpdateCard.mockResolvedValue({ id: 1, title: 'New' });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockUpdateCard).toHaveBeenCalledWith(1, { title: 'New' });
    });
  });

  it('cancels title edit with Escape', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Old Title', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Old Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Old Title'));

    const input = screen.getByDisplayValue('Old Title');
    fireEvent.change(input, { target: { value: 'Draft' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.getByText('Old Title')).toBeInTheDocument();
    });
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  it('edits description and saves with Ctrl+Enter', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Add a more detailed description...')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add a more detailed description...'));

    const textarea = screen.getByPlaceholderText('Add a more detailed description...');
    fireEvent.change(textarea, { target: { value: 'D' } });
    mockUpdateCard.mockResolvedValue({ id: 1, description: 'D' });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(mockUpdateCard).toHaveBeenCalledWith(1, { description: 'D' });
    });
  });

  it('cancels description edit with Escape', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Add a more detailed description...')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add a more detailed description...'));

    const textarea = screen.getByPlaceholderText('Add a more detailed description...');
    fireEvent.change(textarea, { target: { value: 'Draft' } });
    fireEvent.keyDown(textarea, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.getByText('Add a more detailed description...')).toBeInTheDocument();
    });
    expect(mockUpdateCard).not.toHaveBeenCalled();
  });

  it('shows ConfirmModal on delete button click', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete card'));

    expect(screen.getByText('Delete card?')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Task"/)).toBeInTheDocument();
  });

  it('confirms delete and calls deleteCard and onClose', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });
    mockDeleteCard.mockResolvedValue({});

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete card'));

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteCard).toHaveBeenCalledWith(1, 1);
    });
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error and retry button on load failure', async () => {
    cardService.getById.mockRejectedValue({ response: { data: { detail: 'NF' } } });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('NF')).toBeInTheDocument();
    });
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows save error when updateCard fails', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Old Title', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Old Title')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Old Title'));

    const input = screen.getByDisplayValue('Old Title');
    fireEvent.change(input, { target: { value: 'New' } });
    mockUpdateCard.mockRejectedValue({ response: { data: { detail: 'Conflict' } } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Conflict')).toBeInTheDocument();
    });
    expect(screen.getByText('Conflict')).toHaveClass('text-red-600');
  });

  it('calls onClose when Escape key is pressed', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when backdrop is clicked', async () => {
    cardService.getById.mockResolvedValue({ id: 1, title: 'Task', description: '' });

    render(<CardModal cardId={1} listId={1} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('Task')).toBeInTheDocument();
    });

    const backdrop = document.querySelector('.absolute.inset-0');
    fireEvent.click(backdrop);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('returns null when cardId is null', () => {
    const { container } = render(
      <CardModal cardId={null} listId={1} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });
});
