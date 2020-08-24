'use strict';
const acorn = require('acorn');

// acorn JS node types
export const VARIABLE_DECLARATION_TYPE = 'VariableDeclaration';
export const EXPRESSION_STATEMENT_TYPE = 'ExpressionStatement';
export const OBJECT_EXPRESSION_TYPE = 'ObjectExpression';
export const LITERAL_TYPE = 'Literal';
export const IDENTIFIER_TYPE = 'Identifier';

// invalid output message
export const INVALID_FORMAT_OUTPUT = 'Invalid format';

export function camelToKebab(string) {
    return `${string}`.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function objectExpressionToCss({ objectExpression, className }) {
    let cssRule = `.${className} {\n`;
    cssRule += objectExpression.properties.reduce((output, property) => {
        const { key, value } = property;
        if (
            value.type !== LITERAL_TYPE ||
            (key.type !== IDENTIFIER_TYPE && key.type !== LITERAL_TYPE)
        ) {
            throw Error('Wrong format');
        }

        const attribute =
            key.type === IDENTIFIER_TYPE ? key.name : key.type === LITERAL_TYPE ? key.value : '';
        const attrValue = value.value;

        output += `  ${camelToKebab(attribute)}: ${attrValue};\n`;

        return output;
    }, '');
    cssRule += '}\n\n';
    return cssRule;
}

// let input = ' let a = { teste: "asf", 123: "null" }';
const acornConfig = { ecmaVersion: '2020' };
const invalidSyntaxMessageError = 'Invalid syntax';

export function transformVariableDeclaration(variableDeclaration) {
    if (
        variableDeclaration.type === VARIABLE_DECLARATION_TYPE &&
        (variableDeclaration.declarations.length !== 1 ||
            variableDeclaration.declarations[0].init.type !== OBJECT_EXPRESSION_TYPE)
    )
        throw Error(invalidSyntaxMessageError);

    const [declaration] = variableDeclaration.declarations;

    return objectExpressionToCss({
        objectExpression: declaration.init,
        className: declaration.id.name,
    });
}

export function transformExpressionStatement(expressionStatement) {
    if (expressionStatement.expression.type !== OBJECT_EXPRESSION_TYPE)
        throw Error(invalidSyntaxMessageError);
    return objectExpressionToCss({
        objectExpression: expressionStatement.expression,
        className: 'class-name',
    });
}

export function transformJsToCss(input) {
    let parsedProgram;
    let output = INVALID_FORMAT_OUTPUT;
    try {
        parsedProgram = acorn.parse(`${input}`, acornConfig);
        const globalScopeNodes = parsedProgram.body.filter(
            (node) =>
                node.type === VARIABLE_DECLARATION_TYPE || node.type === EXPRESSION_STATEMENT_TYPE,
        );
        output = globalScopeNodes.reduce((acc, node) => {
            if (node.type === VARIABLE_DECLARATION_TYPE) {
                acc += transformVariableDeclaration(node);
            }
            if (node.type === EXPRESSION_STATEMENT_TYPE) {
                acc += transformExpressionStatement(node);
            }
            return acc;
        }, '');
    } catch (e) {
        console.log(e);
    }

    return output;
}
