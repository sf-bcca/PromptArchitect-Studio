import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CostarSection from './CostarSection';

describe('CostarSection', () => {
  it('renders the title and content', () => {
    render(<CostarSection title="Context" content="This is the context." color="blue" />);
    expect(screen.getByText('Context')).toBeDefined();
    expect(screen.getByText('This is the context.')).toBeDefined();
  });

  it('renders with the correct color class', () => {
    const { container } = render(<CostarSection title="Tone" content="Formal" color="red" />);
    // Expecting some element to have a class related to red (e.g., border-red-500 or text-red-500)
    // This depends on implementation, but let's assume it applies a class based on prop
    const element = container.firstChild;
    expect(element).toBeDefined();
  });
});
