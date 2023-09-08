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

        const range = window.getSelection()!.getRangeAt(0).cloneRange();
        const updatedRichText = updateContent(
            richTextRef.current,
            (e.target as Node).textContent || '',
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
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(range.startContainer.parentElement!.parentElement!);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const endOffset = preCaretRange.toString().length;

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