import { CSSProperties } from 'react';
import richText from '../data.json';
import { useRichTextUpdate } from '../hooks/rich-text-update';

type Props = {
    richText: typeof richText,
    edit?: boolean,
    onBlur?: (v: typeof richText) => void,
    style?: CSSProperties
};

export default function RichTextInput(props: Props) {
    const {
        richText,
        updateOnKeyUp,
        contentEditableDivRef
    } = useRichTextUpdate(props.richText);

    const onBlur = () => {
        props.onBlur?.(richText);
    };

    return (
        <div
            ref={contentEditableDivRef}
            contentEditable={props.edit}
            onKeyUp={updateOnKeyUp}
            onBlur={onBlur}
            style={{ ...props.style, whiteSpace: 'pre-line' }}
        >
        </div>
    )
}