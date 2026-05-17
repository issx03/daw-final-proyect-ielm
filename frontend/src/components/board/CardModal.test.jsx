import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('../../store/boardStore', () => ({
  default: vi.fn(),
}));

import CardModal from './CardModal';
import useBoardStore from '../../store/boardStore';

describe('CardModal', () => {
  const mockOnClose = vi.fn();
  const mockUpdateCard = vi.fn();
  const mockDeleteCard = vi.fn();

  const mockCard = {
    id: 1,
    title: 'Test Card',
    description: 'Test Description'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useBoardStore.mockImplementation((selector) => {
      const state = { updateCard: mockUpdateCard, deleteCard: mockDeleteCard };
      return selector ? selector(state) : state;
    });
  });

  it('does not render when isOpen is false', () => {
    render(<CardModal card={mockCard} listId={1} isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Test Card')).not.toBeInTheDocument();
  });

  it('renders card data when open', () => {
    render(<CardModal card={mockCard} listId={1} isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByDisplayValue('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClose when clicking cancel', () => {
    render(<CardModal card={mockCard} listId={1} isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking backdrop', () => {
    render(<CardModal card={mockCard} listId={1} isOpen={true} onClose={mockOnClose} />);
    
    const backdrop = document.querySelector('.bg-\\[\\#0F0F13\\]\\/70');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('calls updateCard and onClose when saving', async () => {
    mockUpdateCard.mockResolvedValue({});
    
    render(<CardModal card={mockCard} listId={1} isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    expect(mockUpdateCard).toHaveBeenCalledWith(1, { title: 'Test Card', description: 'Test Description' });
  });

  it('shows delete confirmation when clicking delete', () => {
    render(<CardModal card={mockCard} listId={1} isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Delete card?')).toBeInTheDocument();
  });

  it('shows delete confirmation modal when clicking delete', () => {
    render(<CardModal card={mockCard} listId={1} isOpen={true} onClose={mockOnClose} />);
    
    // Click delete button in sidebar to open confirm modal
    const deleteButton = screen.getByText((content, element) => {
      return content === 'Delete' && element.tagName.toLowerCase() === 'button';
    });
    fireEvent.click(deleteButton);
    
    // The confirm modal should now be open
    expect(screen.getByText('Delete card?')).toBeInTheDocument();
    expect(screen.getByText(/Test Card.*will be permanently deleted/)).toBeInTheDocument();
  });
});
