/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';

import * as utils from './utils/utils';

import * as pugLs from '@volar/pug-language-service';
import type {Position} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode-html-languageservice';
import {NgLanguageService} from '@angular/language-service/api';
const SourceMap = require("@volar/source-map");

// TODO: Move this to `@angular/language-service`.
enum CompletionKind {
  attribute = 'attribute',
  htmlAttribute = 'html attribute',
  property = 'property',
  component = 'component',
  directive = 'directive',
  element = 'element',
  event = 'event',
  key = 'key',
  method = 'method',
  pipe = 'pipe',
  type = 'type',
  reference = 'reference',
  variable = 'variable',
  entity = 'entity',
}

/**
 * Information about the origin of an `lsp.CompletionItem`, which is stored in the
 * `lsp.CompletionItem.data` property.
 *
 * On future requests for details about a completion item, this information allows the language
 * service to determine the context for the original completion request, in order to return more
 * detailed results.
 */
export interface NgCompletionOriginData {
  /**
   * Used to validate the type of `lsp.CompletionItem.data` is correct, since that field is type
   * `any`.
   */
  kind: 'ngCompletionOriginData';

  filePath: string;
  position: lsp.Position;
}

/**
 * Extract `NgCompletionOriginData` from an `lsp.CompletionItem` if present.
 */
export function readNgCompletionData(item: lsp.CompletionItem): NgCompletionOriginData|null {
  if (item.data === undefined) {
    return null;
  }

  // Validate that `item.data.kind` is actually the right tag, and narrow its type in the process.
  const data: NgCompletionOriginData|{kind?: never} = item.data;
  if (data.kind !== 'ngCompletionOriginData') {
    return null;
  }

  return data;
}

/**
 * Convert Angular's CompletionKind to LSP CompletionItemKind.
 * @param kind Angular's CompletionKind
 */
function ngCompletionKindToLspCompletionItemKind(kind: CompletionKind): lsp.CompletionItemKind {
  switch (kind) {
    case CompletionKind.attribute:
    case CompletionKind.htmlAttribute:
    case CompletionKind.property:
    case CompletionKind.event:
      return lsp.CompletionItemKind.Property;
    case CompletionKind.directive:
    case CompletionKind.component:
    case CompletionKind.element:
    case CompletionKind.key:
      return lsp.CompletionItemKind.Class;
    case CompletionKind.method:
      return lsp.CompletionItemKind.Method;
    case CompletionKind.pipe:
      return lsp.CompletionItemKind.Function;
    case CompletionKind.type:
      return lsp.CompletionItemKind.Interface;
    case CompletionKind.reference:
    case CompletionKind.variable:
      return lsp.CompletionItemKind.Variable;
    case CompletionKind.entity:
    default:
      return lsp.CompletionItemKind.Text;
  }
}

/**
 * Convert ts.CompletionEntry to LSP Completion Item.
 * @param entry completion entry
 * @param position position where completion is requested.
 * @param scriptInfo
 */
export function tsCompletionEntryToLspCompletionItem(
    entry: ts.CompletionEntry,
    position: lsp.Position,
    scriptInfo: ts.server.ScriptInfo,
    insertReplaceSupport: boolean,
    isIvy: boolean,
    document?: TextDocument,
): lsp.CompletionItem {
  const item = lsp.CompletionItem.create(entry.name);
  // Even though `entry.kind` is typed as ts.ScriptElementKind, it's
  // really Angular's CompletionKind. This is because ts.ScriptElementKind does
  // not sufficiently capture the HTML entities.
  // This is a limitation of being a tsserver plugin.
  const kind = entry.kind as unknown as CompletionKind;
  item.kind = ngCompletionKindToLspCompletionItemKind(kind);
  item.detail = entry.kind;
  item.sortText = entry.sortText;
  // Text that actually gets inserted to the document. It could be different
  // from 'entry.name'. For example, a method name could be 'greet', but the
  // insertText is 'greet()'.
  const insertText = entry.insertText || entry.name;
  if (document) {
    item.textEdit = createTextEdit(document, entry, position, insertText, insertReplaceSupport);
  } else {
    item.textEdit = createTextEdit(scriptInfo, entry, position, insertText, insertReplaceSupport);
  }

  if (isIvy) {
    // If the user enables the config `includeAutomaticOptionalChainCompletions`, the `insertText`
    // range will include the dot. the `insertText` should be assigned to the `filterText` to filter
    // the completion items.
    item.filterText = entry.insertText;
    if (entry.isSnippet) {
      item.insertTextFormat = lsp.InsertTextFormat.Snippet;
    }
  }

  item.data = {
    kind: 'ngCompletionOriginData',
    filePath: scriptInfo.fileName,
    position,
  } as NgCompletionOriginData;
  return item;
}


function createTextEdit(
    file: ts.server.ScriptInfo | TextDocument, entry: ts.CompletionEntry, position: lsp.Position,
    insertText: string, insertReplaceSupport: boolean) {
  if (file instanceof ts.server.ScriptInfo) {
    return _createTextEditScriptInfo(file, entry, position, insertText, insertReplaceSupport);
  } else {
    return _createTextEditTextDocument(file, entry, position, insertText, insertReplaceSupport);
  }
}

export function getHtmlCompletions(
  scriptInfo: ts.server.ScriptInfo,
  ngLs: NgLanguageService,
  position: lsp.Position,
  options: ts.GetCompletionsAtPositionOptions,
  clientSupportsInsertReplaceCompletion: boolean,
  ivy: boolean
): lsp.CompletionItem[] | null {
  const offset = utils.lspPositionToTsPosition(scriptInfo, position);
  const ngCompletions = ngLs.getCompletionsAtPosition(
    scriptInfo.fileName,
    offset,
    options,
  );

  if (ngCompletions?.entries.length) {
    return ngCompletions.entries.map((entry) => {
      return tsCompletionEntryToLspCompletionItem(
        entry,
        position,
        scriptInfo,
        clientSupportsInsertReplaceCompletion,
        ivy
      )
    })
  }

  return null
}

function _createTextEditTextDocument(
    document: TextDocument, entry: ts.CompletionEntry, position: lsp.Position,
    insertText: string, insertReplaceSupport: boolean) {
  if (entry.replacementSpan === undefined) {
    return lsp.TextEdit.insert(position, insertText);
  } else if (insertReplaceSupport) {
    const replacementRange = utils.tsTextSpanToLspRange(document, entry.replacementSpan);
    const tsPosition = utils.lspPositionToTsPosition(document, position);
    const insertLength = document.offsetAt(position) - entry.replacementSpan.start;
    const insertionRange =
        utils.tsTextSpanToLspRange(document, {...entry.replacementSpan, length: insertLength});
    return lsp.InsertReplaceEdit.create(insertText, insertionRange, replacementRange);
  } else {
    return lsp.TextEdit.replace(
        utils.tsTextSpanToLspRange(document, entry.replacementSpan), insertText);
  }
}

function _createTextEditScriptInfo(
    scriptInfo: ts.server.ScriptInfo, entry: ts.CompletionEntry, position: lsp.Position,
    insertText: string, insertReplaceSupport: boolean) {
  if (entry.replacementSpan === undefined) {
    return lsp.TextEdit.insert(position, insertText);
  } else if (insertReplaceSupport) {
    const replacementRange = utils.tsTextSpanToLspRange(scriptInfo, entry.replacementSpan);
    const tsPosition = utils.lspPositionToTsPosition(scriptInfo, position);
    const insertLength = tsPosition - entry.replacementSpan.start;
    const insertionRange =
        utils.tsTextSpanToLspRange(scriptInfo, {...entry.replacementSpan, length: insertLength});
    return lsp.InsertReplaceEdit.create(insertText, insertionRange, replacementRange);
  } else {
    return lsp.TextEdit.replace(
        utils.tsTextSpanToLspRange(scriptInfo, entry.replacementSpan), insertText);
  }
}

export async function getPugCompletions(
  pugDocument: pugLs.PugDocument,
  pugCursorPosition: Position,
  htmlCursorOffset: number,
  pugCursorOffset: number,
  pugLs: pugLs.LanguageService
): Promise<lsp.CompletionList | undefined> {
  const plusOnePugPosition = pugDocument.pugTextDocument.positionAt(pugDocument.pugTextDocument.offsetAt(pugCursorPosition) + 1)
  let newPugDoc = pugDocument;
  if (pugDocument.sourceMap.getMappedRange(pugCursorPosition)?.[1]?.text === 'newline') {
    pugDocument.sourceMap.mappings
    const newText = pugDocument.htmlTextDocument.getText().substring(0, htmlCursorOffset - 0) + '<' + pugDocument.htmlTextDocument.getText().substring(htmlCursorOffset + 1 - 1);
    const newDocument = TextDocument.create('foo.html', 'html', 0, newText)
    newPugDoc.htmlTextDocument = newDocument;

    newPugDoc.sourceMap.mappings.unshift({
      sourceRange: {start: pugCursorOffset, end: pugCursorOffset},
      mappedRange: {start: htmlCursorOffset + 1, end: htmlCursorOffset + 1},
      mode: SourceMap.Mode.Totally,
      data: {isEmptyTagCompletion: true, text: 'htmlcorrection'}
    })
  }

  return await pugLs.doComplete(
    newPugDoc,
    pugCursorPosition,
    {resolveReference: (ref, base) => `${ref}/${base}`}
  )
}
