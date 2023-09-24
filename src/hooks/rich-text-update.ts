import { richText } from "../data";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateContent, updateFormatting } from "../lib/utils";

const specialKeys = [
    'Control', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
];

export function useRichTextUpdate(
    initialValue: typeof richText
) {
    const [richText, setRichText] = useState(initialValue);

    const rangeRef = useRef<Range>();
    const offsets = useRef({ start: 0, end: 0 });
    const contentEditableDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => setRichText(initialValue), [initialValue]);

    const updateOnKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        
        if (specialKeys.includes(e.key)) return;
        if (!contentEditableDivRef.current) return;

        const selection = window.getSelection()!;
        const range = selection.getRangeAt(0).cloneRange();
        const selectedLength = range.toString().length;
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentEditableDivRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const endOffset = preCaretRange.toString().length;
        const startOffset = endOffset - selectedLength;
        
        rangeRef.current = range.cloneRange();
        offsets.current = { start: startOffset, end: endOffset };

        let textContent: any = (e.target as Node).textContent || '';
        if (e.key === 'Enter') {
            console.log(startOffset);
            textContent = textContent.split('');
            textContent.splice(startOffset, 0, '\n')
            textContent = textContent.join('');
            console.log(textContent);
        };

        console.log(textContent);
        
        const updatedRichText = !e.ctrlKey
            ? updateContent(
                richText,
                textContent,
                startOffset,
                endOffset
            )
            : updateFormatting(
                richText,
                e.key,
                startOffset,
                endOffset
            );

        console.log(e.key);
        console.log(updatedRichText);

        setRichText(updatedRichText);
        
    }, [richText]);

    useEffect(() => {
        if(!contentEditableDivRef.current) return;
        renderRichText(contentEditableDivRef.current, richText);
        const parentDiv = contentEditableDivRef.current;
        if (!parentDiv) return;

        const startSpanIndex = richText.spans.findIndex(span => span.start <= offsets.current.start && span.end >= offsets.current.start);
        const endSpanIndex = richText.spans.findIndex(span => span.end >= offsets.current.end);        
        const prevSpansLengthStart = richText.spans.reduce((acc, span, index) => acc + (index < startSpanIndex ? (span.end - span.start) : 0), 0);
        const prevSpansLengthEnd = richText.spans.reduce((acc, span, index) => acc + (index < endSpanIndex ? (span.end - span.start) : 0), 0);
        const localStartOffset = offsets.current.start - prevSpansLengthStart;
        const localEndOffset = offsets.current.end - prevSpansLengthEnd;
        
        rangeRef.current?.selectNodeContents(parentDiv);

        rangeRef.current?.setStart(parentDiv.children[startSpanIndex].childNodes[0], localStartOffset);
        rangeRef.current?.setEnd(parentDiv.children[endSpanIndex].childNodes[0], localEndOffset);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        rangeRef.current && selection.addRange(rangeRef.current);
    }, [richText]);

    return {
        richText,
        updateOnKeyUp,
        contentEditableDivRef
    };
}


function renderRichText(element: HTMLDivElement, data: typeof richText) {
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }

    for (const span of data.spans) {
        const newSpan = document.createElement('span');
        newSpan.textContent = data.content.slice(span.start, span.end);
        for (const key of Object.keys(span.attributes)) {
            newSpan.style[key as any] = (span.attributes as any)[key];
        }
        element.appendChild(newSpan);
    }
}


// Edge cases and bugs
// 1. Crashes if all the text is deleted
// 2. On entering new line, cursor stays at the end of the first line

// Restructuring of actions
// onkeyup -> 
//  - if !e.ctrlKey -> updateContent