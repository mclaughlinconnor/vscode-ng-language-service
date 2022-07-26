import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
import {filePathToUri} from './utils';

export function _tsTextSpanToLspRangeScriptInfo(scriptInfo: ts.server.ScriptInfo, textSpan: ts.TextSpan) {
  const start = scriptInfo.positionToLineOffset(textSpan.start);
  const end = scriptInfo.positionToLineOffset(textSpan.start + textSpan.length);
  // ScriptInfo (TS) is 1-based, LSP is 0-based.
  return lsp.Range.create(start.line - 1, start.offset - 1, end.line - 1, end.offset - 1);
}

export function _lspPositionToTsPositionScriptInfo(scriptInfo: ts.server.ScriptInfo, position: lsp.Position): number { const {line, character} = position;
  // ScriptInfo (TS) is 1-based, LSP is 0-based.
  return scriptInfo.lineOffsetToPosition(line + 1, character + 1);
}


export function _tsRelatedInformationToLspRelatedInformationScriptInfo(
    scriptInfo: ts.server.ScriptInfo,
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
        _tsTextSpanToLspRangeScriptInfo(scriptInfo, textSpan),
    );
    lspRelatedInfo.push(lsp.DiagnosticRelatedInformation.create(
        location,
        ts.flattenDiagnosticMessageText(info.messageText, '\n'),
        ));
  }
  return lspRelatedInfo;
}
