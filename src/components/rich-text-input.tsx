// import { richText } from "../data";
import richText from '../data.json';
import RichText from "./rich-text";
import { useRichTextUpdate } from '../hooks/rich-text-update';

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
            onKeyDown={e => e.ctrlKey ? e.preventDefault() : null}
            // onKeyDown={e => e.preventDefault()}
            onBlur={onBlur}
        >
            <RichText 
                richText={richText} 
            
            />
        </div>
    )
}
