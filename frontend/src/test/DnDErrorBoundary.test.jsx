import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DnDErrorBoundary from '../components/common/DnDErrorBoundary';

// Mock window.location.reload
const mockReload = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    value: { reload: mockReload },
    writable: true
  });
});

describe('DnDErrorBoundary Component', () => {
  describe('Normal Behavior', () => {
    it('renders children when there is no error', () => {
      render(
        <DnDErrorBoundary>
          <div data-testid="child-content">Child Content</div>
        </DnDErrorBoundary>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      render(
        <DnDErrorBoundary>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </DnDErrorBoundary>
      );
      
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('renders nested children correctly', () => {
      render(
        <DnDErrorBoundary>
          <div>
            <span>
              <p>Nested Content</p>
            </span>
          </div>
        </DnDErrorBoundary>
      );
      
      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error UI when child component throws an error', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      expect(screen.getByText(/DnD Interaction Error/i)).toBeInTheDocument();
    });

    it('displays error message explaining the error', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      expect(screen.getByText(/Drag-and-Drop engine encountered an unexpected state/i)).toBeInTheDocument();
    });

    it('displays reset button when error occurs', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      expect(screen.getByRole('button', { name: /RESET BOARD ENGINE/i })).toBeInTheDocument();
    });

    it('handles different error types', () => {
      const ErrorThrowingComponent = ({ shouldThrow }) => {
        if (shouldThrow) {
          throw new TypeError('Type error occurred');
        }
        return <div>Content</div>;
      };
      
      // First render without error - wrapped in DnDErrorBoundary
      const { rerender } = render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </DnDErrorBoundary>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      
      // Rerender with error - need to wrap properly
      rerender(
        <DnDErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </DnDErrorBoundary>
      );
      
      expect(screen.getByText(/DnD Interaction Error/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('reset button calls window.location.reload', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      const resetButton = screen.getByRole('button', { name: /RESET BOARD ENGINE/i });
      fireEvent.click(resetButton);
      
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('can handle multiple errors in sequence', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      const { rerender } = render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      expect(screen.getByText(/DnD Interaction Error/i)).toBeInTheDocument();
      
      // Click reset to reload page (simulating recovery)
      const resetButton = screen.getByRole('button', { name: /RESET BOARD ENGINE/i });
      fireEvent.click(resetButton);
      
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('UI Elements', () => {
    it('displays error icon', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      // Check for SVG icon (error icon)
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('has proper error heading', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/DnD Interaction Error/i);
    });

    it('reset button has proper styling classes', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      const resetButton = screen.getByRole('button', { name: /RESET BOARD ENGINE/i });
      expect(resetButton).toHaveClass('btn-primary');
    });
  });

  describe('Class Component Behavior', () => {
    it('initializes with no error state', () => {
      render(
        <DnDErrorBoundary>
          <div>Content</div>
        </DnDErrorBoundary>
      );
      
      // Children should render, not error UI
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByText(/DnD Interaction Error/i)).not.toBeInTheDocument();
    });

    it('getDerivedStateFromError returns correct state on error', () => {
      const testError = new Error('Test error');
      
      // Call the static method directly
      const result = DnDErrorBoundary.getDerivedStateFromError(testError);
      
      expect(result).toEqual({
        hasError: true,
        error: testError
      });
    });

    it('componentDidCatch is called when error occurs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      // componentDidCatch should have logged the error
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('error message has proper text content', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      const errorMessage = screen.getByText(/Drag-and-Drop engine encountered an unexpected state/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('reset button is a proper button element', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      const resetButton = screen.getByRole('button', { name: /RESET BOARD ENGINE/i });
      // Check that it's a button element
      expect(resetButton.tagName).toBe('BUTTON');
    });

    it('reset button has accessible name', () => {
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      
      render(
        <DnDErrorBoundary>
          <ErrorThrowingComponent />
        </DnDErrorBoundary>
      );
      
      const resetButton = screen.getByRole('button', { name: /RESET BOARD ENGINE/i });
      expect(resetButton).toHaveAccessibleName();
    });
  });
});
