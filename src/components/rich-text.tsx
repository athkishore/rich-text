import { CSSProperties } from "react";
import { richText } from "../data";

type Props = {
    richText: typeof richText,
    style?: CSSProperties
}

export default function RichText(props: Props) {
    const { richText, style } = props;

    return (
        <>
        {
            richText.spans.map((span, index) => (
                <span  key={index} style={{ ...style, ...span.attributes, whiteSpace: 'pre-line' }}>
                    {richText.content.slice(span.start, span.end).replaceAll('\\n', '\n')}
                </span>
            ))
        }
        </>
    );
}
