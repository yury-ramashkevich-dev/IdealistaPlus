import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import App from './App';

// Mock Swiper to avoid complex library setup
vi.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}));
vi.mock('swiper/modules', () => ({
  Navigation: 'Navigation',
  Pagination: 'Pagination',
}));
vi.mock('swiper/css', () => ({}));
vi.mock('swiper/css/navigation', () => ({}));
vi.mock('swiper/css/pagination', () => ({}));

const mockProperty = {
  url: 'https://www.idealista.com/inmueble/123/',
  title: 'Test Property',
  price: '300.000 €',
  size: '85 m²',
  rooms: '3 hab.',
  bathrooms: '2 baños',
  images: [],
  features: [],
};

function encodeProperty(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('renders header with title', () => {
    render(<App />);
    expect(screen.getByText('IdealistaPlus')).toBeInTheDocument();
  });

  it('renders bookmarklet install section', () => {
    render(<App />);
    expect(screen.getByText('+ IdealistaPlus')).toBeInTheDocument();
  });

  it('renders empty comparison state', () => {
    render(<App />);
    expect(screen.getByText('No properties to compare yet')).toBeInTheDocument();
  });

  it('does not show "Clear all" when no properties', () => {
    render(<App />);
    expect(screen.queryByText(/Clear all/)).not.toBeInTheDocument();
  });

  describe('hash import', () => {
    it('imports property from valid hash', async () => {
      const encoded = encodeProperty(mockProperty);
      window.location.hash = `#import=${encoded}`;

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Added:/)).toBeInTheDocument();
      });

      expect(screen.getByText('300.000 €')).toBeInTheDocument();
    });

    it('shows error for malformed base64', async () => {
      window.location.hash = '#import=!!!invalid-base64!!!';

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Failed to import property data.')).toBeInTheDocument();
      });
    });

    it('shows error for non-Idealista URL in data', async () => {
      const badData = { ...mockProperty, url: 'https://example.com/not-idealista' };
      const encoded = encodeProperty(badData);
      window.location.hash = `#import=${encoded}`;

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Invalid property data received.')).toBeInTheDocument();
      });
    });

    it('shows duplicate message for already-imported property', async () => {
      const encoded = encodeProperty(mockProperty);
      localStorage.setItem('idealista-comparisons', JSON.stringify([mockProperty]));
      window.location.hash = `#import=${encoded}`;

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('This property is already in your comparison.')).toBeInTheDocument();
      });
    });

    it('clears hash from URL after processing', async () => {
      const encoded = encodeProperty(mockProperty);
      window.location.hash = `#import=${encoded}`;

      render(<App />);

      await waitFor(() => {
        expect(window.location.hash).toBe('');
      });
    });
  });

  describe('import message auto-dismiss', () => {
    it('dismisses message after 4 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const encoded = encodeProperty(mockProperty);
      window.location.hash = `#import=${encoded}`;

      await act(async () => {
        render(<App />);
      });

      // Message should be visible
      expect(screen.getByText(/Added:/)).toBeInTheDocument();

      // Advance past auto-dismiss timer (4s) + debounce (300ms)
      await act(async () => {
        vi.advanceTimersByTime(4500);
      });

      expect(screen.queryByText(/Added:/)).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('clear all', () => {
    it('shows "Clear all" button when properties exist', () => {
      localStorage.setItem('idealista-comparisons', JSON.stringify([mockProperty]));
      render(<App />);
      expect(screen.getByText(/Clear all/)).toBeInTheDocument();
    });

    it('calls clearAll on confirm', async () => {
      localStorage.setItem('idealista-comparisons', JSON.stringify([mockProperty]));
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<App />);

      // Use fireEvent for synchronous confirm dialog interaction
      fireEvent.click(screen.getByText(/Clear all/));

      expect(window.confirm).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('No properties to compare yet')).toBeInTheDocument();
      });
    });

    it('does not clear when user cancels confirmation', async () => {
      localStorage.setItem('idealista-comparisons', JSON.stringify([mockProperty]));
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<App />);

      fireEvent.click(screen.getByText(/Clear all/));

      // Property should still be visible
      expect(screen.getByText('300.000 €')).toBeInTheDocument();
    });
  });
});
