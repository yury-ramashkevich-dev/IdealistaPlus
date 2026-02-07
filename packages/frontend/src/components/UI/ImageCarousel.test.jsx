import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageCarousel from './ImageCarousel';

// Mock Swiper
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

describe('ImageCarousel', () => {
  it('renders empty state when images array is empty', () => {
    render(<ImageCarousel images={[]} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('renders empty state when images prop is undefined', () => {
    render(<ImageCarousel />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('renders slides for each image', () => {
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
    render(<ImageCarousel images={images} />);

    const slides = screen.getAllByTestId('swiper-slide');
    expect(slides).toHaveLength(3);
  });

  it('renders images with correct src and alt', () => {
    const images = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];
    render(<ImageCarousel images={images} />);

    const imgs = screen.getAllByRole('img');
    expect(imgs[0]).toHaveAttribute('src', images[0]);
    expect(imgs[0]).toHaveAttribute('alt', 'Property image 1');
    expect(imgs[1]).toHaveAttribute('src', images[1]);
    expect(imgs[1]).toHaveAttribute('alt', 'Property image 2');
  });

  it('renders images with lazy loading', () => {
    render(<ImageCarousel images={['img1.jpg']} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
