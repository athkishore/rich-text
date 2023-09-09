// import { richText } from "./data";
import data from './data.json';
import RichTextInput from "./components/rich-text-input";
import { useState } from 'react';
import RichText from './components/rich-text';

function App() {
  const [richText, setRichText] = useState(data);

  const onBlur = (v: typeof data) => {
    console.log('runing onblur');
    setRichText(v);
  }

  return (
    <>
    <div>
      <RichTextInput 
        richText={richText} 
        edit
        onBlur={onBlur}
      />
    </div>
    <div>
      <RichText richText={richText} />
    </div>
    </>
  )
}

export default App

