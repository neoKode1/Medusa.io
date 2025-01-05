import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModelCard } from '../../components/ui/ModelCard';

describe('ModelCard', () => {
  const mockOnClick = jest.fn();

  it('renders correctly with basic props', () => {
    render(
      <ModelCard
        title="Test Model"
        description="Test Description"
        isActive={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Test Model')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows active state correctly', () => {
    render(
      <ModelCard
        title="Test Model"
        description="Test Description"
        isActive={true}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Active')).toBeInTheDocument();
  });
}); 