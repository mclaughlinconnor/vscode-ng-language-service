import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {filePathToUri} from './utils';

/**
 * Convert ts.TextSpan to lsp.TextSpan. TypeScript keeps track of offset using
 * 1-based index whereas LSP uses 0-based index.
 * @param scriptInfo Used to determine the offsets.
 * @param textSpan
 */
export function _tsTextSpanToLspRangeTextDocument(document: TextDocument, textSpan: ts.TextSpan) {
  const positionStart = document.positionAt(textSpan.start)
  const positionEnd = document.positionAt(textSpan.start + textSpan.length)

  return lsp.Range.create(positionStart.line, positionStart.character, positionEnd.line, positionEnd.character);
}


export function _lspPositionToTsPositionTextDocument(document: TextDocument, position: lsp.Position): number {
  const {line, character} = position;
  // ScriptInfo (TS) is 1-based, LSP is 0-based.
  return document.offsetAt({line: line + 1, character: character + 1});
}

export function _lspRangeToTsPositionsTextDocument(
    document: TextDocument, range: lsp.Range): [number, number] {
  const start = _lspPositionToTsPositionTextDocument(document, range.start);
  const end = _lspPositionToTsPositionTextDocument(document, range.end);
  return [start, end];
}

export function _tsRelatedInformationToLspRelatedInformationTextDocument(
    document: TextDocument,
    relatedInfo?: ts.DiagnosticRelatedInformation[]): lsp.DiagnosticRelatedInformation[]|undefined {
  if (relatedInfo === undefined) return;
  const lspRelatedInfo: lsp.DiagnosticRelatedInformation[] = [];
  for (const info of relatedInfo) {
    if (info.file === undefined || info.start === undefined || info.length === undefined) continue;
    const textSpan: ts.TextSpan = {
      start: info.start,
      length: info.length,
    };
    const location = lsp.Location.create(
        filePathToUri(info.file.fileName),
        _tsTextSpanToLspRangeTextDocument(document, textSpan),
    );
    lspRelatedInfo.push(lsp.DiagnosticRelatedInformation.create(
        location,
        ts.flattenDiagnosticMessageText(info.messageText, '\n'),
        ));
  }
  return lspRelatedInfo;
}
