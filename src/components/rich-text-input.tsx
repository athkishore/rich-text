import richText from '../data.json';
import { useRichTextUpdate } from '../hooks/rich-text-update';

type Props = {
    richText: typeof richText,
    edit?: boolean,
    onBlur?: (v: typeof richText) => void
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
            onKeyDown={e => e.ctrlKey || e.key === 'Enter' ? e.preventDefault() : null}
            onBlur={onBlur}
        >
        </div>
    )
}
