import PageContainer from '@/components/layout/PageContainer';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('PageContainer Component', () => {
  const childText = 'Test Child Content';
  const ChildComponent = () => <div>{childText}</div>;

  it('should render children inside ScrollArea by default (scrollable=true)', () => {
    render(
      <PageContainer>
        <ChildComponent />
      </PageContainer>
    );

    const pageContainer = screen.getByTestId('page-container');
    expect(pageContainer).toBeInTheDocument();

    const contentArea = screen.getByTestId('content-area');
    expect(pageContainer).toContainElement(contentArea);
    expect(contentArea).toHaveTextContent(childText);

    // Verify ScrollArea is used by checking for the presence of the element
    // with the specific class applied to ScrollArea within the page container.
    // Note: CSS class names with special characters need escaping in querySelector.
    const scrollAreaElement = pageContainer.querySelector(
      '.h-\\[calc\\(100dvh-52px\\)\\]'
    );
    expect(scrollAreaElement).toBeInTheDocument();
    // Optionally verify that the content area is inside the identified scroll area element
    expect(scrollAreaElement).toContainElement(contentArea);
  });

  it('should render children directly when scrollable is false', () => {
    render(
      <PageContainer scrollable={false}>
        <ChildComponent />
      </PageContainer>
    );

    const pageContainer = screen.getByTestId('page-container');
    expect(pageContainer).toBeInTheDocument();

    const contentArea = screen.getByTestId('content-area');
    expect(pageContainer).toContainElement(contentArea);
    expect(contentArea).toHaveTextContent(childText);

    // Verify ScrollArea is NOT used.
    expect(contentArea.parentElement).toBe(pageContainer);
    // Check that the specific ScrollArea class is not present on the page container itself
    // or any intermediate wrapper when scrollable is false.
    const scrollAreaElement = pageContainer.querySelector(
      '.h-\\[calc\\(100dvh-52px\\)\\]'
    );
    expect(scrollAreaElement).not.toBeInTheDocument();
  });

  it('should render the passed children correctly', () => {
    render(
      <PageContainer>
        <p>Paragraph 1</p>
        <span>Span 1</span>
      </PageContainer>
    );

    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Span 1')).toBeInTheDocument();
  });
});
