// import { richText } from "../data";
import richText from '../data.json';
import RichText from "./rich-text";
import { useRichTextUpdate } from '../hooks/rich-text-update';
import { useEffect, useState } from 'react';

type Props = {
    richText: typeof richText,
    edit?: boolean,
    onBlur?: (v: typeof richText) => void
};

export default function RichTextInput(props: Props) {
    const {
        richText, 
        updateOnKeyUp,
        lastOpType,
        contentEditableDivRef
    } = useRichTextUpdate(props.richText);

    const [memoizedRichText, setMemoizedRichText] = useState(richText);

    // useEffect(() => {
    //     if (lastOpType.current === 'formatting') {
    //         setMemoizedRichText(richText);
    //     }
    // }, [richText]);

    if (lastOpType.current === 'formatting') {
        setMemoizedRichText(richText);
        lastOpType.current = '';
    }

    const onBlur = () => {
        props.onBlur?.(richText);
    };

    return (
        <div
            ref={contentEditableDivRef}
            contentEditable={props.edit}
            suppressContentEditableWarning
            onKeyUp={updateOnKeyUp}
            onKeyDown={e => e.ctrlKey ? e.preventDefault() : null}
            // onKeyDown={e => e.preventDefault()}
            onBlur={onBlur}
        >
            <RichText 
                richText={memoizedRichText} 
            
            />
        </div>
    )
}
