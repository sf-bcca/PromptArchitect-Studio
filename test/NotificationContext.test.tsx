import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProvider, useNotifications } from '../context/NotificationContext';

const TestComponent = () => {
  const { notify } = useNotifications();
  return <button onClick={() => notify('Error message', 'error')}>Notify</button>;
};

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should add a notification and display it', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const button = screen.getByText('Notify');
    await act(async () => {
        button.click();
    });

    expect(screen.getByText('Error message')).toBeDefined();
  });

  it('should remove a notification after timeout', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    const button = screen.getByText('Notify');
    await act(async () => {
        button.click();
    });

    expect(screen.getByText('Error message')).toBeDefined();

    await act(async () => {
        vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Error message')).toBeNull();
  });
});
