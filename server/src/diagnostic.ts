/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
import type {TextDocument} from 'vscode-html-languageservice';
import * as pugLs from 'pugjs-language-service';
import * as utils from './utils/utils';

/**
 * Convert ts.DiagnosticCategory to lsp.DiagnosticSeverity
 * @param category diagnostic category
 */
function tsDiagnosticCategoryToLspDiagnosticSeverity(category: ts.DiagnosticCategory) {
  switch (category) {
    case ts.DiagnosticCategory.Warning:
      return lsp.DiagnosticSeverity.Warning;
    case ts.DiagnosticCategory.Error:
      return lsp.DiagnosticSeverity.Error;
    case ts.DiagnosticCategory.Suggestion:
      return lsp.DiagnosticSeverity.Hint;
    case ts.DiagnosticCategory.Message:
    default:
      return lsp.DiagnosticSeverity.Information;
  }
}

/**
 * Convert PugDocumen errors into LSP diagnostics
 * @param pugDiagnostic
 */
export function pugDiagnosticToLspDiagnostic(pugDiagnostic: pugLs.PugDocument['error']): lsp.Diagnostic | undefined {
  if (!pugDiagnostic) {
    return
  }

  let message = `${pugDiagnostic.code}`;
  if (pugDiagnostic.msg) {
    message += `: ${pugDiagnostic.msg.replace(/\n/g, "\\n")}`
  }

  return lsp.Diagnostic.create(
      lsp.Range.create(pugDiagnostic.line, pugDiagnostic.column + 1, pugDiagnostic.line, pugDiagnostic.column + 1),
      message,
      lsp.DiagnosticSeverity.Error,
      pugDiagnostic.code,
  );
}

function _tsDiagnosticToLspDiagnosticTextDocument(
    tsDiag: ts.Diagnostic, document: TextDocument): lsp.Diagnostic {
  const textSpan: ts.TextSpan = {
    start: tsDiag.start || 0,
    length: tsDiag.length || 0,
  };

  return lsp.Diagnostic.create(
      utils.tsTextSpanToLspRange(document, textSpan),
      ts.flattenDiagnosticMessageText(tsDiag.messageText, '\n'),
      tsDiagnosticCategoryToLspDiagnosticSeverity(tsDiag.category),
      tsDiag.code,
      tsDiag.source,
      utils.tsRelatedInformationToLspRelatedInformation(document, tsDiag.relatedInformation),
  );
}

function _tsDiagnosticToLspDiagnosticScriptInfo(
    tsDiag: ts.Diagnostic, scriptInfo: ts.server.ScriptInfo): lsp.Diagnostic {
  const textSpan: ts.TextSpan = {
    start: tsDiag.start || 0,
    length: tsDiag.length || 0,
  };

  return lsp.Diagnostic.create(
      utils.tsTextSpanToLspRange(scriptInfo, textSpan),
      ts.flattenDiagnosticMessageText(tsDiag.messageText, '\n'),
      tsDiagnosticCategoryToLspDiagnosticSeverity(tsDiag.category),
      tsDiag.code,
      tsDiag.source,
      utils.tsRelatedInformationToLspRelatedInformation(scriptInfo, tsDiag.relatedInformation),
  );
}

/**
 * Convert ts.Diagnostic to lsp.Diagnostic
 * @param tsDiag TS diagnostic
 * @param file Used to compute proper offset.
 */
export function tsDiagnosticToLspDiagnostic(
  tsDiag: ts.Diagnostic, file: ts.server.ScriptInfo | TextDocument): lsp.Diagnostic {
  if (file instanceof ts.server.ScriptInfo) {
    return _tsDiagnosticToLspDiagnosticScriptInfo(tsDiag, file)
  } else {
    return _tsDiagnosticToLspDiagnosticTextDocument(tsDiag, file)
  }
}
