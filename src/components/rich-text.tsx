import { richText } from "../data";

type Props = {
    richText: typeof richText,
}

export default function RichText(props: Props) {
    const { richText } = props;

    return (
        <>
        {
            richText.spans.map((span, index) => (
                <span  key={index} style={span.attributes}>
                    {richText.content.slice(span.start, span.end)}
                </span>
            ))
        }
        </>
    );
}
