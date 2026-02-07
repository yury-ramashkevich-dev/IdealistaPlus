import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookmarkletInstall from './BookmarkletInstall';

describe('BookmarkletInstall', () => {
  it('renders draggable link with bookmark text', () => {
    render(<BookmarkletInstall />);
    expect(screen.getByText('+ IdealistaPlus')).toBeInTheDocument();
  });

  it('sets javascript: href on the link via useEffect', async () => {
    render(<BookmarkletInstall />);
    const link = screen.getByText('+ IdealistaPlus');

    await waitFor(() => {
      expect(link.getAttribute('href')).toMatch(/^javascript:/);
    });
  });

  it('renders installation instructions', () => {
    render(<BookmarkletInstall />);
    expect(screen.getByText('How to use:')).toBeInTheDocument();
    expect(screen.getByText(/Drag/)).toBeInTheDocument();
  });

  it('renders copy fallback button', () => {
    render(<BookmarkletInstall />);
    expect(screen.getByText("Can't drag? Click to copy bookmarklet code")).toBeInTheDocument();
  });

  it('copies bookmarklet code to clipboard on click', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<BookmarkletInstall />);
    await user.click(screen.getByText("Can't drag? Click to copy bookmarklet code"));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('javascript:'));
  });

  it('shows "Copied!" text after copying', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    render(<BookmarkletInstall />);
    await user.click(screen.getByText("Can't drag? Click to copy bookmarklet code"));

    await waitFor(() => {
      expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument();
    });
  });
});
