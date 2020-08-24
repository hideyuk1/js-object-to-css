import {
    transformJsToCss,
    camelToKebab,
    OBJECT_EXPRESSION_TYPE,
    EXPRESSION_STATEMENT_TYPE,
    INVALID_FORMAT_OUTPUT,
} from './parser';
const acorn = require('acorn');
import CSSOM from 'cssom';

function getContext(input) {
    const parsedJs = acorn.parse(input, { ecmaVersion: 2020 });
    const output = transformJsToCss(input);
    const parsedCss = CSSOM.parse(output);
    return { parsedJs, output, parsedCss };
}

function testObjectExpression(objectExpression, cssRule) {
    const jsObjectProperties = objectExpression.properties;

    for (let i = 0; i < jsObjectProperties.length; i++) {
        const camelPropertyName = jsObjectProperties[i].key.name;
        const kebabPropertyName = camelToKebab(camelPropertyName);
        // expect paddingTop -> padding-top === padding-top
        expect(kebabPropertyName).toBe(cssRule.style[i]);

        // compare values
        const propertyValue = jsObjectProperties[i].value.value;
        expect(propertyValue.toString()).toBe(cssRule.style[kebabPropertyName]);
    }
}

test('Expression block', () => {
    const input = `({
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingBottom: 100
        })`;
    const { parsedJs, parsedCss } = getContext(input);
    const cssRule = parsedCss.cssRules[0];

    expect(cssRule.selectorText.slice(1)).toBe('class-name');

    // expect type === ExpressionStatement
    expect(parsedJs.body[0].type).toBe(EXPRESSION_STATEMENT_TYPE);
    const jsExpression = parsedJs.body[0];

    const objectExpression = jsExpression.expression;
    testObjectExpression(objectExpression, cssRule);
});

test('Variable declaration', () => {
    const input = `let class2 = {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0
        }`;
    const { parsedJs, parsedCss } = getContext(input);
    const jsDeclaration = parsedJs.body[0].declarations[0];
    const cssRule = parsedCss.cssRules[0];

    // expect className === .className
    expect(jsDeclaration.id.name).toBe(cssRule.selectorText.slice(1));

    // expect type === ObjectExpression
    expect(jsDeclaration.init.type).toBe(OBJECT_EXPRESSION_TYPE);

    const objectExpression = jsDeclaration.init;
    testObjectExpression(objectExpression, cssRule);
});

test('Not literal value', () => {
    const input = `let class2 = {
            position: notLiteral,
        }`;
    const { output } = getContext(input);

    expect(output).toBe(INVALID_FORMAT_OUTPUT);
});

test('Invalid syntax', () => {
    const input = `let class2 = {
            position: notLiteral,
        `;
    expect(() => {
        getContext(input);
    }).toThrow();
});
