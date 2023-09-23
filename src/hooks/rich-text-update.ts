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
    const lastOpType = useRef('');
    const contentEditableDivRef = useRef<HTMLDivElement>(null);

    const updateOnKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.ctrlKey) e.preventDefault();

        console.log(e.key);
        
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
            );

        if (e.ctrlKey) {
            lastOpType.current = 'formatting';
        } else {
            lastOpType.current = 'text';
        }
        
        console.log(updatedRichText)
        setRichText(updatedRichText);
    }, [richText]);

    useEffect(() => {
        // const parentDiv = rangeRef.current?.startContainer.parentElement!.parentElement!;
        const parentDiv = contentEditableDivRef.current;
        if (!parentDiv) return;

        console.log(parentDiv);
        // const editableDivSpans = ((new Array(parentDiv.children.length).fill(0)).map((item, index) => parentDiv.children[index].textContent));
        // const editableDivSpansWithStartEnd = editableDivSpans.map((item, index, arr) => {
        //     return {
        //         start: arr.slice(0, index).join('').length,
        //         end: arr.slice(0, index).join('').length + (item?.length || 0)
        //     };
        // });

        // console.log(editableDivSpansWithStartEnd);

        const startSpanIndex = richText.spans.findIndex(span => span.start <= offsets.current.start && span.end > offsets.current.start);
        // const startSpanIndex = editableDivSpansWithStartEnd.findIndex(span => span.start <= offsets.current.start && span.end > offsets.current.start);
        const endSpanIndex = richText.spans.findIndex(span => span.end > offsets.current.end);
        // const endSpanIndex = editableDivSpansWithStartEnd.findIndex(span => span.end > offsets.current.end);
        
        const prevSpansLengthStart = richText.spans.reduce((acc, span, index) => acc + (index < startSpanIndex ? (span.end - span.start) : 0), 0);
        const prevSpansLengthEnd = richText.spans.reduce((acc, span, index) => acc + (index < endSpanIndex ? (span.end - span.start) : 0), 0);
        const localStartOffset = offsets.current.start - prevSpansLengthStart;
        const localEndOffset = offsets.current.end - prevSpansLengthEnd;
        
        rangeRef.current?.selectNodeContents(parentDiv);

        console.log(parentDiv?.children, startSpanIndex, endSpanIndex);
        rangeRef.current?.setStart(parentDiv.children[startSpanIndex].childNodes[0], localStartOffset);
        rangeRef.current?.setEnd(parentDiv.children[endSpanIndex].childNodes[0], localEndOffset);

        const selection = window.getSelection()!;
        selection.removeAllRanges();
        rangeRef.current && selection.addRange(rangeRef.current);
    }, [richText]);

    return {
        richText,
        updateOnKeyUp,
        lastOpType,
        contentEditableDivRef
    };
}

// Edge cases and bugs
// 1. Crashes if text is added after the last character.
// 2. Text entry with selection across spans - incorrect logic
// 3. Crashes if text deleted with backspace or delete buttons