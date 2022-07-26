import * as lsp from 'vscode-languageserver';
import * as pugLs from '@volar/pug-language-service';
import {SourceMapBase} from '@volar/source-map';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {extractOffsetFromSourceMapPosition} from './utils';

export function translateHtmlOffsetToPug(
  originOffset: number,
  sourceMap: SourceMapBase
): number {
  return extractOffsetFromSourceMapPosition(sourceMap.getSourceRange(originOffset)) || originOffset;
}

export function translatePugOffsetToHtml(
  originOffset: number,
  sourceMap: SourceMapBase
): number {
  return extractOffsetFromSourceMapPosition(sourceMap.getMappedRange(originOffset)) || originOffset;
}

export function translatePosition(
  originPosition: lsp.Position,
  originTextDocument: TextDocument,
  targetTextDocument: TextDocument,
  sourceMap: SourceMapBase,
  sourceMapFunction: 'getSourceRange' | 'getMappedRange'
): lsp.Position {
  const originOffset = originTextDocument.offsetAt(
    {line: originPosition.line, character: originPosition.character}
  ) + 0;

  const targetOffset = extractOffsetFromSourceMapPosition(sourceMap[sourceMapFunction](originOffset)) || originOffset;
  const targetPosition = targetTextDocument.positionAt(targetOffset);

  return targetPosition;
}

export function translatePugPositionToHtml(
  originalPosition: lsp.Position,
  pugDocument: pugLs.PugDocument
) {
  return translatePosition(
    originalPosition,
    pugDocument.pugTextDocument,
    pugDocument.htmlTextDocument,
    pugDocument.sourceMap as SourceMapBase,
    'getMappedRange',
  );
}

export function translateHtmlPositionToPug(
  originalPosition: lsp.Position,
  pugDocument: pugLs.PugDocument
) {
  return translatePosition(
    originalPosition,
    pugDocument.htmlTextDocument,
    pugDocument.pugTextDocument,
    pugDocument.sourceMap as SourceMapBase,
    'getSourceRange',
  );
}

export function translateHtmlRangeToPug(
  originalRange: lsp.Range,
  pugDocument: pugLs.PugDocument
) {
  return translateRange(
    originalRange,
    pugDocument.htmlTextDocument,
    pugDocument.pugTextDocument,
    pugDocument.sourceMap as SourceMapBase,
    'getSourceRange',
  );
}

export function translateRange(
  originRange: lsp.Range,
  originTextDocument: TextDocument,
  targetTextDocument: TextDocument,
  sourceMap: SourceMapBase,
  sourceMapFunction: 'getSourceRange' | 'getMappedRange'
): lsp.Range {
  const calculateOriginOffset = (position: lsp.Position) => originTextDocument.offsetAt(
    {line: position.line, character: position.character}
  );

  const originStartOffset = calculateOriginOffset(originRange.start);
  const originEndOffset = calculateOriginOffset(originRange.end);

  const sourceMapResult = sourceMap[sourceMapFunction](originStartOffset, originEndOffset)

  let targetEndOffset = 0;
  let targetStartOffset = 0;

  if (sourceMapResult && sourceMapResult?.[0]) {
    targetStartOffset = sourceMapResult[0].start;
    targetEndOffset = sourceMapResult[0].end;
  }

  const targetRange = {
    start: targetTextDocument.positionAt(targetStartOffset),
    end: targetTextDocument.positionAt(targetEndOffset),
  };

  return targetRange;
}
