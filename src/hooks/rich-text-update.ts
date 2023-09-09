import { richText } from "../data";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateContent, updateFormatting } from "../lib/utils";

export function useRichTextUpdate(
    initialValue: typeof richText
) {
    const [richText, setRichText] = useState(initialValue);
    const rangeRef = useRef<Range>();
    const offsets = useRef({ start: 0, end: 0 });

    const updateOnKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.ctrlKey) e.preventDefault();

        const selection = window.getSelection()!;
        const range = selection.getRangeAt(0).cloneRange();
        const selectedLength = range.toString().length;
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(range.startContainer.parentElement!.parentElement!);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const endOffset = preCaretRange.toString().length;
        const startOffset = endOffset - selectedLength;
        
        console.log('setting range: ', range);
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
        
        // richTextRef.current = updatedRichText;
        setRichText(updatedRichText);
    }, [richText]);

    useEffect(() => {
        console.log(offsets.current);
        const parentDiv = rangeRef.current?.startContainer.parentElement!.parentElement!;
        const spanIndex = richText.spans.findIndex(span => span.start >= offsets.current.start);
        rangeRef.current?.selectNodeContents(parentDiv);
        rangeRef.current?.setStart(parentDiv, spanIndex);
        rangeRef.current?.setEnd(parentDiv, spanIndex + 1);
        const selection = window.getSelection()!;
        selection.removeAllRanges();
        rangeRef.current && selection.addRange(rangeRef.current);
    }, [richText]);

    return {
        richText,
        updateOnKeyUp
    };
}
