// import { richText } from "./data";
import richText from './data.json';
import RichTextInput from "./components/rich-text-input";
// import { useEffect, useState } from "react";

if (!localStorage.getItem('data')) {
  localStorage.setItem('data', JSON.stringify(richText));
}

function App() {
  const richText = JSON.parse(localStorage.getItem('data') as any);

  const saveUpdatedRichText = (updatedRichText: typeof richText) => {
    console.log(updatedRichText);
    localStorage.setItem('data', JSON.stringify(updatedRichText));
  }

  return (
    <RichTextInput 
      richText={richText as any} 
      edit
      onBlur={saveUpdatedRichText}
    />
  )
}

export default App

