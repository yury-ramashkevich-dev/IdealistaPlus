import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComparisonContainer from './ComparisonContainer';

// Mock Swiper to avoid complex library internals
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
  title: 'Nice flat in Barcelona',
  price: '300.000 €',
  propertyType: 'Flat',
  size: '85 m²',
  rooms: '3 hab.',
  bathrooms: '2 baños',
  constructionYear: '2015',
  orientation: 'South',
  energyConsumption: '150 kWh/m²',
  emissions: '30 kg CO₂/m²',
  description: 'A lovely property with great views and modern amenities throughout the building.',
  features: ['Elevator', 'Air conditioning', 'Balcony', 'Parking', 'Pool', 'Gym', 'Storage'],
  images: ['img1.jpg', 'img2.jpg'],
};

const mockProperty2 = {
  url: 'https://www.idealista.com/inmueble/456/',
  title: 'Cozy studio in Madrid',
  price: '180.000 €',
  propertyType: 'Studio',
  size: '40 m²',
  rooms: '1 hab.',
  bathrooms: '1 baño',
  constructionYear: null,
  orientation: null,
  energyConsumption: null,
  emissions: null,
  description: null,
  features: [],
  images: [],
};

describe('ComparisonContainer', () => {
  it('renders empty state when no properties', () => {
    render(<ComparisonContainer properties={[]} onRemove={() => {}} />);
    expect(screen.getByText('No properties to compare yet')).toBeInTheDocument();
  });

  it('renders table with correct number of columns', () => {
    render(<ComparisonContainer properties={[mockProperty, mockProperty2]} onRemove={() => {}} />);
    const table = screen.getByRole('table');
    // colgroup has 3 cols: label + 2 properties
    const cols = table.querySelectorAll('col');
    expect(cols).toHaveLength(3);
  });

  it('renders all 11 comparison row labels', () => {
    render(<ComparisonContainer properties={[mockProperty]} onRemove={() => {}} />);
    const expectedLabels = ['Price', 'Type', 'Size', 'Rooms', 'Bathrooms', 'Year built', 'Orientation', 'Consumption', 'Emissions', 'Features', 'Description'];
    expectedLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders property values in cells', () => {
    render(<ComparisonContainer properties={[mockProperty]} onRemove={() => {}} />);
    expect(screen.getByText('300.000 €')).toBeInTheDocument();
    expect(screen.getByText('85 m²')).toBeInTheDocument();
    expect(screen.getByText('3 hab.')).toBeInTheDocument();
    expect(screen.getByText('2 baños')).toBeInTheDocument();
    expect(screen.getByText('Flat')).toBeInTheDocument();
    expect(screen.getByText('2015')).toBeInTheDocument();
    expect(screen.getByText('South')).toBeInTheDocument();
  });

  it('renders em dash for null/missing values', () => {
    render(<ComparisonContainer properties={[mockProperty2]} onRemove={() => {}} />);
    // mdash is rendered as \u2014
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBeGreaterThan(0);
  });

  it('renders property title as link', () => {
    render(<ComparisonContainer properties={[mockProperty]} onRemove={() => {}} />);
    const link = screen.getByText('Nice flat in Barcelona');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', mockProperty.url);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('calls onRemove when remove button clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<ComparisonContainer properties={[mockProperty]} onRemove={onRemove} />);

    const removeBtn = screen.getByTitle('Remove property');
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith(mockProperty.url);
  });

  describe('FeaturesCell', () => {
    it('shows first 5 features and "+N more" button', () => {
      render(<ComparisonContainer properties={[mockProperty]} onRemove={() => {}} />);
      expect(screen.getByText('Elevator')).toBeInTheDocument();
      expect(screen.getByText('Air conditioning')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('expands to show all features when clicking "+N more"', async () => {
      const user = userEvent.setup();
      render(<ComparisonContainer properties={[mockProperty]} onRemove={() => {}} />);

      await user.click(screen.getByText('+2 more'));
      expect(screen.getByText('Gym')).toBeInTheDocument();
      expect(screen.getByText('Storage')).toBeInTheDocument();
      expect(screen.getByText('Show less')).toBeInTheDocument();
    });
  });

  describe('DescriptionCell', () => {
    it('renders description text', () => {
      render(<ComparisonContainer properties={[mockProperty]} onRemove={() => {}} />);
      expect(screen.getByText(mockProperty.description)).toBeInTheDocument();
    });

    it('shows "Show more" for long descriptions', () => {
      const longDesc = 'A'.repeat(200);
      const prop = { ...mockProperty, description: longDesc };
      render(<ComparisonContainer properties={[prop]} onRemove={() => {}} />);
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    it('toggles expanded state when clicking "Show more"/"Show less"', async () => {
      const user = userEvent.setup();
      const longDesc = 'A'.repeat(200);
      const prop = { ...mockProperty, description: longDesc };
      render(<ComparisonContainer properties={[prop]} onRemove={() => {}} />);

      await user.click(screen.getByText('Show more'));
      expect(screen.getByText('Show less')).toBeInTheDocument();

      await user.click(screen.getByText('Show less'));
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
  });
});
