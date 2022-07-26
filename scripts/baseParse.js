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
const missingCommaRegex = /(&quot;|')\n\s+\[.*?]=\1/;
function baseParse(pugCode) {
    const fileName = 'foo.pug';
    const pugTextDocument = vscode_languageserver_textdocument_1.TextDocument.create(shared.fsPathToUri(fileName), 'jade', 0, pugCode);
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
        codeGen.addCode(
            '\n',
            {
                start: pugCode.trimEnd().length + 1,
                end: pugCode.length + 1,
            },
            SourceMap.Mode.Expand,
            {
                text: 'newline',
                isEmptyTagCompletion: false,
            }
        );
        // codeGen.addText('\n');
        // codeGen.addMapping2({
        //     data: {
        //         text: 'newline',
        //         isEmptyTagCompletion: false,
        //     },
        //     sourceRange: {
        //         start: pugCode.trimEnd().length + 1,
        //         end: pugCode.length,
        //     },
        //     mappedRange: {
        //         start: codeGen.getText().length,
        //         end: codeGen.getText().length,
        //     },
        //     mode: SourceMap.Mode.Expand,
        // });
    }
    catch (e) {
        const _error = e;
        error = Object.assign(Object.assign({}, _error), { line: _error.line - 1 || 0, column: _error.column - 1 || 0 });
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
        const htmlStartRange = codeGen.getText().length - 0;
        if (!codeGen.getText().endsWith('\n\n')) {
            if ((codeGen.getText().length !== 0 && !codeGen.getText().endsWith('\n'))) {
                codeGen.addText('\n');
            }
            codeGen.addText('\n');
        }
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
    function extractBlockFromContainer(node) {
        const _node = node;
        let blockNode;
        switch (_node.type) {
            case 'Conditional':
                blockNode = _node.consequent;
                break;
            case 'Mixin':
            case 'Each':
            case 'Case':
                blockNode = _node.block;
                break;
            case 'Block':
            case 'NamedBlock':
                blockNode = _node;
                break;
        }
        return blockNode;
    }
    function isContainerNode(node) {
        return ['Block', 'Case', 'Conditional', 'Each', 'Mixin', 'NamedBlock'].includes(node.type);
    }
    function visitNewlines(node) {
        const nodeOffset = 'column' in node ? getDocOffset(node.line, node.column) : getDocOffset(node.line, 0);
        let nextEmptyLineToken = emptyLineEndsLineTokens[0];
        while (nextEmptyLineToken && nodeOffset >= getDocOffset(nextEmptyLineToken.start.line, nextEmptyLineToken.start.column)) {
            addNewlinesByToken(nextEmptyLineToken);
            emptyLineEndsLineTokens.shift();
            nextEmptyLineToken = emptyLineEndsLineTokens[0];
        }
    }
    function visitTagNodes(node, next, parent) {
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
    function handleInterpolations(node, interpolations) {
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
            handleFunctionCalls(interpolationContent, startOffset, startOffset - htmlLength - 2);
        }
    }
    function visitTextNodes(node) {
        const text = node.val;
        const interpolationPattern = /\{\{(.*?)\}\}/g;
        const interpolations = [...text.matchAll(interpolationPattern)];
        if ((interpolations === null || interpolations === void 0 ? void 0 : interpolations.length) > 0) {
            handleInterpolations(node, interpolations);
        }
        codeGen.addCode(node.val, getDocRange(node.line, node.column, node.val.length), SourceMap.Mode.Offset, {
            text: 'text',
            isEmptyTagCompletion: false,
        });
        // The space comes from between the tag and the text: `span [here] text`
        fullPugTagEnd += node.val.length + ' '.length;
    }
    function handleFunctionCalls(text, startOffset, htmlDifference) {
        const callParamsPattern = /\((?<completeContent>.*)\)|\((?<incompleteContent>.*)$/g;
        const callParams = [...text.matchAll(callParamsPattern)]
            .reduce((acc, match) => {
            if (!match.groups) {
                return acc;
            }
            const { completeContent, incompleteContent } = match.groups;
            acc.push({
                index: match.index,
                // completeContent can be '' which is falsy
                content: (completeContent !== undefined)
                    ? completeContent
                    : incompleteContent
            });
            return acc;
        }, []);
        callParams.forEach(callParam => {
            const matchIndex = callParam.index || 0;
            const callParamContent = callParam.content;
            const paramStart = startOffset + matchIndex;
            const start = paramStart + 1;
            const end = start + callParamContent.length;
            codeGen.addMapping2({
                data: { text: 'callparams', isEmptyTagCompletion: false },
                sourceRange: {
                    start,
                    end,
                },
                mappedRange: {
                    start: start + htmlDifference,
                    end: end + htmlDifference,
                },
                mode: SourceMap.Mode.Totally,
            });
            handleFunctionCalls(callParamContent, startOffset + matchIndex + 1, htmlDifference);
        });
    }
    function visitNode(node, next, parent) {
        if (isContainerNode(node)) {
            const blockNode = extractBlockFromContainer(node);
            if (!blockNode) {
                return;
            }
            for (let i = 0; i < blockNode.nodes.length; i++) {
                visitNode(blockNode.nodes[i], blockNode.nodes[i + 1], blockNode);
            }
        }
        visitNewlines(node);
        if (node.type === 'Tag') {
            visitTagNodes(node, next, parent);
        }
        else if (node.type === 'Text') {
            visitTextNodes(node);
        }
    }
    function handleAttributes(node) {
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
            const attributePattern = /([^,\s"']*?)=('|")(.*?)\2/g;
            const attributes = [...attrsBlock.text.matchAll(attributePattern)];
            for (const attr of attributes) {
                handleAttributeFunctionCalls(attr, attrsBlock.offset, codeGen.getText().length - attrsBlock.offset);
            }
            // handleFunctionCalls(text, startOffset, htmlDifference)
            codeGen.addCode(attrsBlock.text, { start: attrsBlock.offset, end: attrsBlock.offset + attrsBlock.text.length }, SourceMap.Mode.Offset, {
                text: 'attrblock',
                isEmptyTagCompletion: false,
            });
            fullPugTagEnd += '('.length + attrsBlock.text.length + ')'.length;
        }
    }
    function handleAttributeFunctionCalls(attribute, startOffset, htmlDifference) {
        const [_whole, key, _quote, value] = attribute;
        const keyStart = pugTextDocument.getText().substring(startOffset).indexOf(key);
        handleFunctionCalls(value, startOffset + keyStart + key.length + '=\''.length, htmlDifference);
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
        handleAttributes(node);
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
            // Is indent needed? 2022-08-07
            if (token.type === 'newline' || token.type === 'outdent' || token.type === 'indent') {
                // const totalNumberOfNewlines = nextToken.loc.end.line - prevToken.loc.start.line;
                const firstLine = prevToken.loc.end.line + 1 || 0;
                const lastLine = nextToken.loc.start.line - 1 || token.loc.end.line;

                for ( let line = firstLine; line <= lastLine; line++ ) {
                    ends.push({
                        // One indexed
                        start: {line: line, column: 1},
                        end: {line: line, column: 1},
                    });
                }

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
                // Iterate through all previous nodes
                for (let j = i - 1; j >= 0; j--) {
                    const prevToken = tokens[j];
                    if (prevToken.type === 'newline' || prevToken.type === 'indent' || prevToken.type === 'outdent' || prevToken.type === ':') {
                        break;
                    }
                    tagStart = prevToken;
                    if (prevToken.type === 'tag') {
                        break;
                    }
                }
                let prevToken = token;
                let text = '';
                // Find previous token, add all indents
                for (i++; i < tokens.length; i++) {
                    const attrToken = tokens[i];
                    addPrevSpace(attrToken);
                    if (attrToken.type === 'attribute') {
                        text += checkPotentiallyMissingCommas(attrToken.val, attrToken);
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
    function checkPotentiallyMissingCommas(value, attrToken) {
        let strippedValue = value;
        if (typeof value === 'string') {
            strippedValue = value.slice(1, -1).replace(/ \\\n/g, '//\n');
        }
        const escaped = pugRuntime.attr(attrToken.name, strippedValue, true, true).trimLeft();
        if (missingCommaRegex.test(escaped)) {
            error = {
                code: 'PUG:SUSPECTED_MISSING_COMMA',
                msg: `Suspect missing comma between attrs: "${escaped.replace('\n', ' ')}"`,
                line: attrToken.loc.start.line,
                column: attrToken.loc.start.column,
                filename: fileName,
                src: attrToken.name,
            };
        }
        return escaped;
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
