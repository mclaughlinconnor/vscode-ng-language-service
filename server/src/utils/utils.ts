/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
import {URI} from 'vscode-uri';

import * as pugLs from 'pugjs-language-service';
import * as vscode from 'vscode-languageserver-types';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {
  _lspPositionToTsPositionTextDocument,
  _lspRangeToTsPositionsTextDocument,
  _tsRelatedInformationToLspRelatedInformationTextDocument,
  _tsTextSpanToLspRangeTextDocument,
} from './textDocument';
import {
  _lspPositionToTsPositionScriptInfo,
  _tsRelatedInformationToLspRelatedInformationScriptInfo,
  _tsTextSpanToLspRangeScriptInfo,
} from './scriptInfo';

export {
  translateHtmlOffsetToPug,
  translateHtmlPositionToPug,
  translateHtmlRangeToPug,
  translatePosition,
  translatePugOffsetToHtml,
  translatePugPositionToHtml,
  translateRange,
} from './translation'

export const isDebugMode = process.env['NG_DEBUG'] === 'true';

enum Scheme {
  File = 'file',
}

/**
 * Extract the file path from the specified `uri`.
 * @param uri
 */
export function uriToFilePath(uri: string): string {
  // Note: uri.path is different from uri.fsPath
  // See
  // https://github.com/microsoft/vscode-uri/blob/413805221cc6ed167186ab3103d3248d6f7161f2/src/index.ts#L622-L645
  const {scheme, fsPath} = URI.parse(uri);
  if (scheme !== Scheme.File) {
    return '';
  }
  return fsPath;
}

/**
 * Converts the specified `filePath` to a proper URI.
 * @param filePath
 */
export function filePathToUri(filePath: string): lsp.DocumentUri {
  return URI.file(filePath).toString();
}

/**
 * Get the starting offset/position from a source map result
 * @param sourceMapPosition
 */
export function extractOffsetFromSourceMapPosition<T = vscode.Position | number>(
  sourceMapPosition: [{start: T; end: T;}, {isEmptyTagCompletion: boolean;} | undefined] | undefined
): T | undefined {
  return sourceMapPosition?.[0].start;
}

/**
 * Get the parsed PugDocument that corresponds to a ts.server.ScriptInfo
 * @param pugLs
 * @param scriptInfo
 * @param scriptInfo
 */
export function getPugDocumentFromScriptInfo(pugLs: pugLs.LanguageService, scriptInfo: ts.server.ScriptInfo): pugLs.PugDocument {
    const documentSnapshot = scriptInfo.getSnapshot()
    const documentText = documentSnapshot
      .getText(0, documentSnapshot.getLength());

    return pugLs.parsePugDocument(documentText);
}

/**
 * Check if a project is configured
 * @param project
 */
export function isConfiguredProject(project: ts.server.Project):
    project is ts.server.ConfiguredProject {
  return project.projectKind === ts.server.ProjectKind.Configured;
}

/**
 * A class that tracks items in most recently used order.
 */
export class MruTracker {
  private readonly set = new Set<string>();

  update(item: string) {
    if (this.set.has(item)) {
      this.set.delete(item);
    }
    this.set.add(item);
  }

  delete(item: string) {
    this.set.delete(item);
  }

  /**
   * Returns all items sorted by most recently used.
   */
  getAll(): string[] {
    // Javascript Set maintains insertion order, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
    // Since items are sorted from least recently used to most recently used,
    // we reverse the result.
    return [...this.set].reverse();
  }
}

/**
 * Combine ts.SymboleDisplayParts into a regular string
 * @param parts
 */
export function tsDisplayPartsToText(parts: ts.SymbolDisplayPart[]): string {
  return parts.map(dp => dp.text).join('');
}

interface DocumentPosition {
  fileName: string;
  pos: number;
}

/**
 *
 * This function attempts to use *internal* TypeScript APIs to find the original source spans for
 * the `ts.DefinitionInfo` using source maps. If it fails, this function returns the same
 * `ts.DefinitionInfo` that was passed in.
 *
 * @see https://github.com/angular/vscode-ng-language-service/issues/1588
 */
export function getMappedDefinitionInfo(
    info: ts.DefinitionInfo, project: ts.server.Project): ts.DefinitionInfo {
  try {
    const mappedDocumentSpan = getMappedDocumentSpan(info, project);
    return {...info, ...mappedDocumentSpan};
  } catch {
    return info;
  }
}

function getMappedDocumentSpan(
    documentSpan: ts.DocumentSpan, project: ts.server.Project): ts.DocumentSpan|undefined {
  const newPosition = getMappedLocation(documentSpanLocation(documentSpan), project);
  if (!newPosition) return undefined;
  return {
    fileName: newPosition.fileName,
    textSpan: {start: newPosition.pos, length: documentSpan.textSpan.length},
    originalFileName: documentSpan.fileName,
    originalTextSpan: documentSpan.textSpan,
    contextSpan: getMappedContextSpan(documentSpan, project),
    originalContextSpan: documentSpan.contextSpan
  };
}

function getMappedLocation(
    location: DocumentPosition, project: ts.server.Project): DocumentPosition|undefined {
  const mapsTo = (project as any).getSourceMapper().tryGetSourcePosition(location);
  return mapsTo &&
          (project.projectService as any).fileExists(ts.server.toNormalizedPath(mapsTo.fileName)) ?
      mapsTo :
      undefined;
}

function documentSpanLocation({fileName, textSpan}: ts.DocumentSpan): DocumentPosition {
  return {fileName, pos: textSpan.start};
}

function getMappedContextSpan(
    documentSpan: ts.DocumentSpan, project: ts.server.Project): ts.TextSpan|undefined {
  const contextSpanStart = documentSpan.contextSpan &&
    getMappedLocation(
      {fileName: documentSpan.fileName, pos: documentSpan.contextSpan.start},
      project
    );
  const contextSpanEnd = documentSpan.contextSpan &&
    getMappedLocation(
      { fileName: documentSpan.fileName, pos: documentSpan.contextSpan.start + documentSpan.contextSpan.length },
      project
    );
  return contextSpanStart && contextSpanEnd ?
      {start: contextSpanStart.pos, length: contextSpanEnd.pos - contextSpanStart.pos} :
      undefined;
}

/**
 * Convert lsp.Position to the absolute offset in the file. LSP keeps track of
 * offset using 0-based index whereas TypeScript uses 1-based index.
 * @param file Used to determine the offsets.
 * @param position
 */
export function lspPositionToTsPosition(file: ts.server.ScriptInfo | TextDocument, position: lsp.Position): number {
  if (file instanceof ts.server.ScriptInfo) {
    return _lspPositionToTsPositionScriptInfo(file, position);
  } else {
    return _lspPositionToTsPositionTextDocument(file, position);
  }
}

/**
 * Convert ts.TextSpan to lsp.TextSpan. TypeScript keeps track of offset using
 * 1-based index whereas LSP uses 0-based index.
 * @param file Used to determine the offsets.
 * @param textSpan
 */
export function tsTextSpanToLspRange(file: ts.server.ScriptInfo | TextDocument, textSpan: ts.TextSpan) {
  if (file instanceof ts.server.ScriptInfo) {
    return _tsTextSpanToLspRangeScriptInfo(file, textSpan);
  } else {
    return _tsTextSpanToLspRangeTextDocument(file, textSpan);
  }
}

/**
 * Convert lsp.Range which is made up of `start` and `end` positions to
 * TypeScript's absolute offsets.
 * @param file Used to determine the offsets.
 * @param range
 */
export function lspRangeToTsPositions(
  file: TextDocument, range: lsp.Range
): [number, number] {
  return _lspRangeToTsPositionsTextDocument(file, range);
}

/**
 * Convert a ts.DiagnosticRelatedInformation array to a
 * lsp.DiagnosticRelatedInformation array
 * @param file Used to determine the offsets.
 * @param relatedInfo
 */
export function tsRelatedInformationToLspRelatedInformation(
    file: ts.server.ScriptInfo | TextDocument,
    relatedInfo?: ts.DiagnosticRelatedInformation[]
  ): lsp.DiagnosticRelatedInformation[] | undefined {
  if (file instanceof ts.server.ScriptInfo) {
    return _tsRelatedInformationToLspRelatedInformationScriptInfo(file, relatedInfo);
  } else {
    return _tsRelatedInformationToLspRelatedInformationTextDocument(file, relatedInfo);
  }
}
