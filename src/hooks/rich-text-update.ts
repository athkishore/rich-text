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

    const updateOnKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.ctrlKey) e.preventDefault();

        if (specialKeys.includes(e.key)) return;

        const selection = window.getSelection()!;
        const range = selection.getRangeAt(0).cloneRange();
        const selectedLength = range.toString().length;
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(range.startContainer.parentElement!.parentElement!);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const endOffset = preCaretRange.toString().length;
        const startOffset = endOffset - selectedLength;
        
        rangeRef.current = range.cloneRange();
        offsets.current = { start: startOffset, end: endOffset };
        
        const updatedRichText = !e.ctrlKey
            ? updateContent(
                richText,
                (e.target as Node).textContent || '',
                startOffset,
                endOffset
            )
            : updateFormatting(
                richText,
                e.key,
                startOffset,
                endOffset
            )
        
        setRichText(updatedRichText);
    }, [richText]);

    useEffect(() => {
        const parentDiv = rangeRef.current?.startContainer.parentElement!.parentElement!;

        const startSpanIndex = richText.spans.findIndex(span => span.start <= offsets.current.start && span.end > offsets.current.start);
        const endSpanIndex = richText.spans.findIndex(span => span.end > offsets.current.end);
        
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
        updateOnKeyUp
    };
}
