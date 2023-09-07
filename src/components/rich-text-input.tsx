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
        richText, 
        updateOnKeyUp
    } = useRichTextUpdate(props.richText);

    const onBlur = () => {
        props.onBlur?.(richText);
    };

    return (
        <div
            contentEditable={props.edit}
            suppressContentEditableWarning
            onKeyUp={updateOnKeyUp}
            onBlur={onBlur}
        >
            <RichText 
                richText={richText} 
            
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
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(range.startContainer.parentElement!.parentElement!);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const endOffset = preCaretRange.toString().length;

        const updatedContent = (e.target as Node).textContent!;
        const diff = updatedContent.length - richTextRef.current.content.length;
        console.log(endOffset, diff);
        richTextRef.current.content = updatedContent;

        const updatedSpans = richTextRef.current.spans.map(span => {
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
        richTextRef.current.spans = updatedSpans;
    }, []);

    return {
        richText: richTextRef.current,
        updateOnKeyUp
    }
}