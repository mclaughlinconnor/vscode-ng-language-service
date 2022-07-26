"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseParse = void 0;
const shared = require("@volar/shared");
const SourceMap = require("@volar/source-map");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const code_gen_1 = require("@volar/code-gen");
const pugLex = require("pug-lexer");
const pugParser = require('pug-parser');
const pugRuntime = require('pug-runtime');
const voidElements = require('void-elements');
function baseParse(pugCode) {
    const fileName = 'foo.pug';
    const pugTextDocument = vscode_languageserver_textdocument_1.TextDocument.create(shared.fsPathToUri('foo.pug'), 'jade', 0, pugCode);
    const codeGen = new code_gen_1.CodeGen();
    let error;
    let fullPugTagEnd;
    let attrsBlocks;
    let ast;
    let emptyLineEndsLineTokens;
    try {
        const tokens = pugLex(pugCode, { filename: fileName });
        emptyLineEndsLineTokens = collectNewlinesLoc(tokens);
        attrsBlocks = collectAttrsBlocks(tokens);
        ast = pugParser(tokens, { filename: fileName, src: pugCode });
        visitNode(ast, undefined, undefined);
        codeGen.addCode('', {
            start: pugCode.trimEnd().length,
            end: pugCode.trimEnd().length,
        }, SourceMap.Mode.Totally, undefined);
    }
    catch (e) {
        const _error = e; console.log( _error );
        error = Object.assign(Object.assign({}, _error), { line: _error.line - 1, column: _error.column - 1 });
    }
    ;
    const htmlCode = codeGen.getText();
    const sourceMap = new SourceMap.SourceMapBase(codeGen.getMappings());
    return {
        htmlCode,
        pugTextDocument,
        sourceMap,
        error,
        ast,
    };
    function addNewlinesByToken(token) {
        const startOffset = getDocOffset(token.start.line, token.start.column);
        const endOffset = getDocOffset(token.end.line, token.end.column);
        const htmlStartRange = codeGen.getText().length;
        if ((codeGen.getText().length !== 0 && !codeGen.getText().endsWith('\n'))) {
            codeGen.addText('\n');
        }
        codeGen.addText('\n');
        const htmlEndRange = codeGen.getText().length - 1;
        codeGen.addMapping2({
            data: {
                text: 'newline',
                isEmptyTagCompletion: false,
            },
            sourceRange: {
                start: startOffset,
                end: endOffset,
            },
            mappedRange: {
                start: htmlStartRange,
                end: htmlEndRange,
            },
            mode: SourceMap.Mode.Expand,
        });
    }
    function visitNode(node, next, parent) {
        if (['Block', 'Case', 'Conditional', 'Each', 'Mixin', 'NamedBlock'].includes(node.type)) {
            let blockNode;
            switch (node.type) {
                case 'Conditional':
                    blockNode = node.consequent;
                    break;
                case 'Mixin':
                case 'Each':
                case 'Case':
                    blockNode = node.block;
                    break;
                default:
                    blockNode = node;
                    break;
            }
            if (!blockNode) {
                return;
            }
            for (let i = 0; i < blockNode.nodes.length; i++) {
                visitNode(blockNode.nodes[i], blockNode.nodes[i + 1], blockNode);
            }
        }
        const nodeOffset = 'column' in node ? getDocOffset(node.line + 0, node.column + 0) : getDocOffset(node.line + 0, 0 + 0);
        let nextEmptyLineToken = emptyLineEndsLineTokens[0];
        while (nextEmptyLineToken && nodeOffset >= getDocOffset(nextEmptyLineToken.start.line, nextEmptyLineToken.start.column)) {
            addNewlinesByToken(nextEmptyLineToken);
            emptyLineEndsLineTokens.shift();
            nextEmptyLineToken = emptyLineEndsLineTokens[0];
        }
        if (node.type === 'Tag') {
            const pugTagRange = getDocRange(node.line, node.column, node.name.length);
            const fullHtmlStart = codeGen.getText().length;
            fullPugTagEnd = pugTagRange.end;
            const selfClosing = Boolean(voidElements[node.name]) || node.selfClosing;
            addStartTag(node, selfClosing);
            if (!selfClosing) {
                visitNode(node.block, next, parent);
                addEndTag(node, next, parent);
            }
            const fullHtmlEnd = codeGen.getText().length;
            // const m = pugTextDocument.getText().substring( fullPugTagEnd ).match( /[^\s]/ );
            // if ( m ) {
            //     // fullPugTagEnd += m.index; // 0 indexed already and we capture the first non-whitespace so don't add one
            // }
            codeGen.addMapping2({
                data: { text: 'tag', isEmptyTagCompletion: false },
                sourceRange: {
                    start: pugTagRange.start,
                    end: fullPugTagEnd,
                },
                mappedRange: {
                    start: fullHtmlStart,
                    end: fullHtmlEnd,
                },
                mode: SourceMap.Mode.Totally,
            });
        }
        else if (node.type === 'Text') {
            const text = node.val;
            const interpolationPattern = /\{\{(.*?)\}\}/g;
            const interpolations = [...text.matchAll(interpolationPattern)];
            if ((interpolations === null || interpolations === void 0 ? void 0 : interpolations.length) > 0) {
                for (const interpolationMatch of interpolations) {
                    const interpolationContent = interpolationMatch[1]; // 0: {{text}}, 1: text
                    const matchIndex = interpolationMatch.index || 0;
                    // +2 to compensate for {{
                    const startOffset = getDocOffset(node.line, node.column) + matchIndex + 2;
                    const htmlLength = codeGen.getText().length;
                    const htmlInterpolationStart = matchIndex + htmlLength;
                    codeGen.addMapping2({
                        data: { text: 'interpolation', isEmptyTagCompletion: false },
                        sourceRange: {
                            start: startOffset,
                            end: startOffset + interpolationContent.length,
                        },
                        mappedRange: {
                            // +2 for }}
                            start: htmlInterpolationStart + 2,
                            end: htmlInterpolationStart + interpolationContent.length + 2
                        },
                        mode: SourceMap.Mode.Totally,
                    });
                }
            }
            codeGen.addCode(node.val, getDocRange(node.line, node.column, node.val.length), SourceMap.Mode.Offset, {
                text: 'text',
                isEmptyTagCompletion: false,
            });
            // The space comes from between the tag and the text span_text
            fullPugTagEnd += node.val.length + ' '.length;
        }
    }
    function addStartTag(node, selfClosing) {
        codeGen.addCode('', getDocRange(node.line, node.column, 0), SourceMap.Mode.Totally, undefined);
        codeGen.addText('<');
        const tagRange = getDocRange(node.line, node.column, node.name.length);
        if (pugCode.substring(tagRange.start, tagRange.end) === node.name) {
            codeGen.addCode(node.name, tagRange, SourceMap.Mode.Offset, undefined);
        }
        else {
            codeGen.addText(node.name);
        }
        const noTitleAttrs = node.attrs.filter(attr => !attr.mustEscape && attr.name !== 'class');
        const noTitleClassAttrs = node.attrs.filter(attr => !attr.mustEscape && attr.name === 'class');
        const attrsBlock = attrsBlocks.get(getDocOffset(node.line, node.column)); // support attr auto-complete in empty space
        addClassesOrStyles(noTitleClassAttrs, 'class');
        for (const attr of noTitleAttrs) {
            codeGen.addText(' ');
            codeGen.addText(attr.name);
            if (typeof attr.val !== 'boolean') {
                codeGen.addText('=');
                codeGen.addCode(attr.val, getDocRange(attr.line, attr.column, attr.val.length), SourceMap.Mode.Offset, {
                    text: 'attrval',
                    isEmptyTagCompletion: false,
                });
                fullPugTagEnd += attr.val.replace(/'|"/g, '').length + '#'.length; // For now we're assuming these are only ids
            }
        }
        if (attrsBlock) {
            codeGen.addText(' ');
            codeGen.addCode(attrsBlock.text, { start: attrsBlock.offset, end: attrsBlock.offset + attrsBlock.text.length }, SourceMap.Mode.Offset, {
                text: 'attrblock',
                isEmptyTagCompletion: false,
            });
            fullPugTagEnd += '('.length + attrsBlock.text.length + ')'.length;
        }
        codeGen.addText(" ");
        if (selfClosing) {
            codeGen.addText(' />');
        }
        else {
            codeGen.addText('>');
        }
    }
    function addEndTag(node, next, parent) {
        let nextStart;
        if (next) {
            if (next.type === 'Block') {
                nextStart = getDocOffset(next.line, 1);
            }
            else {
                nextStart = getDocOffset(next.line, next.column);
            }
        }
        else if (!parent) {
            nextStart = pugCode.length;
        }
        if (nextStart !== undefined) {
            // fullPugTagEnd = nextStart;
        }
        codeGen.addText(`</${node.name}>`);
    }
    function addClassesOrStyles(attrs, attrName) {
        if (!attrs.length)
            return;
        codeGen.addText(' ');
        codeGen.addText(attrName);
        codeGen.addText('=');
        codeGen.addText('"');
        for (const attr of attrs) {
            if (typeof attr.val !== 'boolean') {
                codeGen.addText(' ');
                codeGen.addCode(attr.val.slice(1, -1), // remove "
                getDocRange(attr.line, attr.column + 1, attr.val.length - 2), SourceMap.Mode.Offset, undefined);
                // . is for classes
                fullPugTagEnd += attr.val.replace(/'|"/g, '').length + '.'.length;
            }
        }
        codeGen.addText('"');
    }
    function collectNewlinesLoc(tokens) {
        const ends = [];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens === null || tokens === void 0 ? void 0 : tokens[i + 1];
            const prevToken = tokens === null || tokens === void 0 ? void 0 : tokens[i - 1];
            // Indent is needed? 2022-08-07
            if (token.type === 'newline' || token.type === 'outdent' || token.type === 'indent') {
                ends.push({
                    start: (prevToken === null || prevToken === void 0 ? void 0 : prevToken.loc.end) || { line: 1, column: 1 },
                    end: (nextToken === null || nextToken === void 0 ? void 0 : nextToken.loc.start) || token.loc.end,
                });
            }
        }
        return ends;
    }
    function collectAttrsBlocks(tokens) {
        const blocks = new Map();
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === 'start-attributes') {
                let tagStart = token;
                for (let j = i - 1; j >= 0; j--) {
                    const prevToken = tokens[j];
                    if (prevToken.type === 'newline'
                        || prevToken.type === 'indent'
                        || prevToken.type === 'outdent'
                        || prevToken.type === ':')
                        break;
                    tagStart = prevToken;
                    if (prevToken.type === 'tag')
                        break;
                }
                let prevToken = token;
                let text = '';
                for (i++; i < tokens.length; i++) {
                    const attrToken = tokens[i];
                    addPrevSpace(attrToken);
                    if (attrToken.type === 'attribute') {
                        let value = attrToken.val;
                        if ( typeof value === 'string' ) {
                            value = value.slice( 1, -1 );
                            value = value.replace(/ \\\n/g, '//\n');
                        }
                        const escaped = pugRuntime.attr(attrToken.name, value, true, true).trimLeft();
                        if ( /(&quot;|')\n\s+\[.*?]=\1/.test( escaped ) ) {
                            error = {
                                code: 'PUG:SUSPECTED_MISSING_COMMA',
                                msg: `Suspect missing comma between attrs: "${escaped.replace( '\n', ' ' )}"`,
                                line: attrToken.loc.start.line,
                                column: attrToken.loc.start.column,
                                filename: fileName,
                                src: attrToken.name,
                            };
                        }
                        text += escaped;
                        // let attrText = pugCode.substring(
                        // 	getDocOffset(attrToken.loc.start.line, attrToken.loc.start.column),
                        // 	getDocOffset(attrToken.loc.end.line, attrToken.loc.end.column),
                        // );
                        // if (typeof attrToken.val === 'string' && attrText.indexOf('=') >= 0) {
                        // 	let valText = attrToken.val;
                        // 	if (valText.startsWith('`') && valText.endsWith('`')) {
                        // 		valText = `"${valText.slice(1, -1)}"`;
                        // 	}
                        // 	valText = valText.replace(/ \\\n/g, '//\n');
                        // 	text += attrText.substring(0, attrText.lastIndexOf(attrToken.val)) + valText;
                        // }
                        // else {
                        // 	text += attrText;
                        // }
                    }
                    else if (attrToken.type === 'end-attributes') {
                        blocks.set(getDocOffset(tagStart.loc.start.line, tagStart.loc.start.column), {
                            offset: getDocOffset(token.loc.end.line, token.loc.end.column),
                            text,
                        });
                        break;
                    }
                    prevToken = attrToken;
                }
                function addPrevSpace(currentToken) {
                    text += pugCode.substring(getDocOffset(prevToken.loc.end.line, prevToken.loc.end.column), getDocOffset(currentToken.loc.start.line, currentToken.loc.start.column)).replace(/,/g, '\n');
                }
            }
        }
        return blocks;
    }
    function getDocOffset(pugLine, pugColumn) {
        return pugTextDocument.offsetAt({ line: pugLine - 1, character: pugColumn - 1 });
    }
    function getDocRange(pugLine, pugColumn, length) {
        const start = pugTextDocument.offsetAt({ line: pugLine - 1, character: pugColumn - 1 });
        const end = start + length;
        return {
            start,
            end,
        };
    }
}
exports.baseParse = baseParse;
//# sourceMappingURL=baseParse.js.map
