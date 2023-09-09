import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import richText from '../data.json';
import RichText from './rich-text';

describe('Renders static rich text', () => {
    it('renders the text in the correct number of spans', () => {
        render(
            <RichText 
                richText={richText}
            />
        );

        const spans = document.querySelectorAll('span');
        expect(spans.length).toBe(richText.spans.length);
        for (const [index, span] of spans.entries()) {
            const { start, end } = richText.spans[index];
            expect(span.innerHTML).toBe(richText.content.slice(start, end));
        }
    });

    it('renders the correct attributes for each span', () => {
        render(
            <RichText 
                richText={richText}
            />
        );

        const spans = document.querySelectorAll('span');
        for (const [index, span] of spans.entries()) {
            const { attributes } = richText.spans[index];
            expect(span.style.color).toBe(attributes.color);
        }
    });
})