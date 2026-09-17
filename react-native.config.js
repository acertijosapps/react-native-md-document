module.exports = {
    dependency: {
        platforms: {
            ios: {},
            android: {
                packageImportPath: 'import com.reactnativedocument.DocumentSpeechPackage;',
                packageInstance: 'new DocumentSpeechPackage()',
            },
        },
    },
};
