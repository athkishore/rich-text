import { useCallback, useRef } from "react";
// import { richText } from "../data";
import richText from '../data.json';
import RichText from "./rich-text";

type Props = {
    richText: typeof richText,
    edit?: boolean,
    onBlur?: (v: typeof richText) => void
};

export default function RichTextInput(props: Props) {
    const {
        richTextRef, 
        updateOnKeyUp
    } = useRichTextUpdate(props.richText);

    const onBlur = () => {
        props.onBlur?.(richTextRef.current);
    };

    if (richTextRef.current !== props.richText) {
        richTextRef.current = props.richText;
        console.log('updating rich text from parent state');
    }

    return (
        <div
            contentEditable={props.edit}
            suppressContentEditableWarning
            onKeyUp={updateOnKeyUp}
            onKeyDown={e => e.ctrlKey ? e.preventDefault() : null}
            onBlur={onBlur}
        >
            <RichText 
                richText={richTextRef.current} 
            
            />
        </div>
    )
}

function useRichTextUpdate(
    initialValue: typeof richText
) {
    const richTextRef = useRef(initialValue);

    const updateOnKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.ctrlKey) e.preventDefault();

        const range = window.getSelection()!.getRangeAt(0).cloneRange();
        
        const updatedRichText = !e.ctrlKey
            ? updateContent(
                richTextRef.current,
                (e.target as Node).textContent || '',
                range
            )
            : updateFormatting(
                richTextRef.current,
                e.key,
                range
            )
        
        richTextRef.current = updatedRichText;
        console.log(richTextRef.current);
    }, []);

    return {
        richTextRef: richTextRef,
        updateOnKeyUp
    }
}

function updateContent(
    prevRichText: typeof richText, 
    newTextContent: string, 
    range: Range
) {
    console.log('running update content');
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(range.startContainer.parentElement!.parentElement!);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const endOffset = preCaretRange.toString().length;
    console.log(preCaretRange.toString());
    const diff = newTextContent.length - prevRichText.content.length;
    console.log(endOffset, diff);
    const updatedSpans = prevRichText.spans.map(span => {
        if (
            (span.start < endOffset - diff && span.end >= endOffset - diff)
            || (span.start === 0 && endOffset - diff === 0)
        ) {
            return {
                ...span,
                end: span.end + diff
            };
        } else if (
            span.start >= endOffset - diff && span.end >= endOffset - diff
        ) {
            return {
                ...span,
                start: span.start + diff,
                end: span.end + diff
            };
        } else {
            return span;
        }
    }); 
    // Bugs in the span logic above:
    // 1. When the selection covers two spans, there is inconsistency


    return {
        ...prevRichText,
        content: newTextContent,
        spans: updatedSpans
    };
}

function updateFormatting(
    prevRichText: typeof richText,
    key: string,
    range: Range
) {
    console.log('running update formatting');
    let endOffset = 0, startOffset = 0;
    let attribute: string, value: string;

    if (key === 'b') {
        attribute = 'fontWeight';
        value = 'bold';
    } else {
        return prevRichText;
    }

    const selectedLength = range.toString().length;
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(range.startContainer.parentElement!.parentElement!.parentElement!);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    endOffset = preCaretRange.toString().length;
    startOffset = endOffset - selectedLength;

    console.log(startOffset, endOffset);
    console.log(range.startContainer.parentElement!.parentElement!.parentElement!);

    if (startOffset !== endOffset) {
        const precedingSpans = prevRichText.spans
            .filter(span => span.end <= startOffset);
        const overlappingSpans = prevRichText.spans
            .filter(span => span.start < endOffset && span.end > startOffset);
        const succeedingSpans = prevRichText.spans
            .filter(span => span.start >= endOffset);
            
        let middleSpans = [];
        if (overlappingSpans.length === 1) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: startOffset
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: startOffset,
                end: endOffset,
                attributes: {
                    ...overlappingSpans[0].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: endOffset
            });
        } else if (overlappingSpans.length === 3) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: startOffset
            });

            middleSpans.push({
                ...overlappingSpans[1],
                start: startOffset,
                end: endOffset,
                attributes: {
                    ...overlappingSpans[1].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans[2],
                start: endOffset
            });
        } else if (overlappingSpans.length === 2) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: startOffset
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: startOffset,
                end: endOffset,
                attributes: {
                    ...overlappingSpans[0].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans[1],
                start: endOffset
            });
        }

        const spans = [
            ...precedingSpans,
            ...middleSpans,
            ...succeedingSpans
        ].filter(span => span.start !== span.end);

        return {
            ...prevRichText,
            spans
        };
    } else {
        return prevRichText;
    }
}
