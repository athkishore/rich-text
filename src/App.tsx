import { richText } from "./data"

function App() {
  return (
    <>
      <RichText richText={richText} />
    </>
  )
}

export default App

type Props = {
  richText: typeof richText
}
function RichText(props: Props) {
  const { richText } = props;
  return (
    <span>
      {
        richText.spans.map(span => (
          <span style={span.attributes}>
            {richText.content.slice(span.start, span.end)}
          </span>
        ))
      }
    </span>
  )
}
