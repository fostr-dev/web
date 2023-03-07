// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        quotes: ["error", "double", {
            avoidEscape: true,
            allowTemplateLiterals: true
        }],
        "no-undef": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-var-requires": "off",
        // Doesn't like my screenshot uploader
        "no-irregular-whitespace": "off",
        "no-self-assign": "off",
        "prefer-rest-params": "off",
        "no-empty": ["error", {
            allowEmptyCatch: true
        }],
        "@typescript-eslint/no-this-alias": "off"
    }
};