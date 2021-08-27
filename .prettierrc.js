module.exports = {
    tabWidth: 4,
    printWidth: 120,
    singleQuote: true,
    trailingComma: 'es5',
    quoteProps: 'consistent',
    overrides: [
        {
            files: '*.md',
            tabWidth: 2, // To accommodate doctoc formatting (no override for tab width in doctoc)
        },
    ],
};
