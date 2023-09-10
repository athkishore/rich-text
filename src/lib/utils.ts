import { richText } from "../data";

export function updateContent(
    prevRichText: typeof richText, 
    newTextContent: string, 
    _: number,
    endOffset: number
) {
    const diff = newTextContent.length - prevRichText.content.length;
    let updatedSpans: typeof richText.spans;

    console.log(endOffset, diff);

    const effectiveStartOffset = newTextContent.split('')
        .findIndex((char, index) => char !== prevRichText.content[index]);

    const effectiveEndOffset = endOffset - diff;

    console.log(effectiveStartOffset, effectiveEndOffset);

    if (effectiveEndOffset - effectiveStartOffset <= 1) {
        updatedSpans = prevRichText.spans.map(span => {
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
    } else {
        const precedingSpans = prevRichText.spans
            .filter(span => span.end <= effectiveStartOffset);
        const overlappingSpans = prevRichText.spans
            .filter(span => span.start < effectiveEndOffset && span.end > effectiveStartOffset);
        let succeedingSpans = prevRichText.spans
            .filter(span => span.start >= effectiveEndOffset);

        console.log(precedingSpans, overlappingSpans, succeedingSpans);
            
        let middleSpans = [];
        if (overlappingSpans.length === 1) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: overlappingSpans[0].end + diff
            });

            for (const span of succeedingSpans) {
                span.start += diff;
                span.end += diff;
            }
        } else if (overlappingSpans.length >= 2) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: endOffset
            });

            middleSpans.push({
                ...overlappingSpans.slice(-1)[0],
                start: endOffset,
                end: overlappingSpans.slice(-1)[0].end + diff,
            });

            for (const span of succeedingSpans) {
                span.start += diff;
                span.end += diff;
            }
        } 

        updatedSpans = [
            ...precedingSpans,
            ...middleSpans,
            ...succeedingSpans
        ].filter(span => span.start !== span.end);

        console.log(updatedSpans);

    } 
    // Bugs in the span logic above:
    // 1. When the selection covers two spans, there is inconsistency


    return {
        ...prevRichText,
        content: newTextContent,
        spans: updatedSpans
    };
}

export function updateFormatting(
    prevRichText: typeof richText,
    key: string,
    startOffset: number,
    endOffset: number
) {
    let attribute: string, value: string;

    if (key === 'b') {
        attribute = 'fontWeight';
        value = 'bold';
    } else {
        return prevRichText;
    }

    if (startOffset !== endOffset) {
        const precedingSpans = prevRichText.spans
            .filter(span => span.end <= startOffset);
        const overlappingSpans = prevRichText.spans
            .filter(span => span.start < endOffset && span.end > startOffset);
        const succeedingSpans = prevRichText.spans
            .filter(span => span.start >= endOffset);
            
        let middleSpans = [];
        if (overlappingSpans.length === 1) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: startOffset
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: startOffset,
                end: endOffset,
                attributes: {
                    ...overlappingSpans[0].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: endOffset
            });
        } else if (overlappingSpans.length >= 3) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: startOffset
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: startOffset,
                attributes: {
                    ...overlappingSpans[0].attributes,
                    [attribute]: value
                }
            });

            for (const span of overlappingSpans.slice(1, -1)) {
                middleSpans.push({
                    ...span,
                    attributes: {
                        ...span.attributes,
                        [attribute]: value
                    }
                } as any);
            }

            middleSpans.push({
                ...overlappingSpans.slice(-1)[0],
                end: endOffset,
                attributes: {
                    ...overlappingSpans.slice(-1)[0].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans.slice(-1)[0],
                start: endOffset
            });
        } else if (overlappingSpans.length === 2) {
            middleSpans.push({
                ...overlappingSpans[0],
                end: startOffset
            });

            middleSpans.push({
                ...overlappingSpans[0],
                start: startOffset,
                attributes: {
                    ...overlappingSpans[0].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans[1],
                end: endOffset,
                attributes: {
                    ...overlappingSpans[1].attributes,
                    [attribute]: value
                }
            });

            middleSpans.push({
                ...overlappingSpans[1],
                start: endOffset
            });
        }

        const spans = [
            ...precedingSpans,
            ...middleSpans,
            ...succeedingSpans
        ].filter(span => span.start !== span.end);

        return {
            ...prevRichText,
            spans
        };
    } else {
        return prevRichText;
    }
}
