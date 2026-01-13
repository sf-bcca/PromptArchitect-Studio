import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VersionHistory from './VersionHistory';
import { PromptHistoryItem } from '../types';

describe('VersionHistory', () => {
  const mockHistory: PromptHistoryItem[] = [
    { id: 'p1', originalInput: 'parent text', result: { refinedPrompt: '', whyThisWorks: '', suggestedVariables: [] }, timestamp: 1 },
    { id: 'c1', originalInput: 'child text', result: { refinedPrompt: '', whyThisWorks: '', suggestedVariables: [] }, timestamp: 2, parentId: 'p1' },
    { id: 'c2', originalInput: 'child2 text', result: { refinedPrompt: '', whyThisWorks: '', suggestedVariables: [] }, timestamp: 3, parentId: 'p1' },
  ];

  it('renders nothing if no relations exist', () => {
    const { container } = render(
      <VersionHistory 
        currentItem={mockHistory[0]} 
        history={[mockHistory[0]]} 
        onSelectVersion={() => {}} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders parent if current is child', () => {
    render(
      <VersionHistory 
        currentItem={mockHistory[1]} 
        history={mockHistory} 
        onSelectVersion={() => {}} 
      />
    );
    expect(screen.getByText('Derived From')).toBeDefined();
    // Use partial match because of the '...' in component
    expect(screen.getByText(/parent text/)).toBeDefined();
  });

  it('renders children if current is parent', () => {
    render(
      <VersionHistory 
        currentItem={mockHistory[0]} 
        history={mockHistory} 
        onSelectVersion={() => {}} 
      />
    );
    expect(screen.getByText('Derived Variations (2)')).toBeDefined();
    expect(screen.getByText(/child text/)).toBeDefined();
    expect(screen.getByText(/child2 text/)).toBeDefined();
  });

  it('calls onSelectVersion when clicked', () => {
    const onSelect = vi.fn();
    render(
      <VersionHistory 
        currentItem={mockHistory[1]} 
        history={mockHistory} 
        onSelectVersion={onSelect} 
      />
    );
    fireEvent.click(screen.getByText(/parent text/));
    expect(onSelect).toHaveBeenCalled();
  });
});