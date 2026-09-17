import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import type { DocColorScheme, DocumentSource, SpeechEngine } from '../src';
import {
    createKeyValueHighlightStore,
    createMockSpeechEngine,
    createNativeSpeechEngine,
    DocumentViewer,
    useDocumentSource,
    useHighlights,
    useTextToSpeech,
} from '../src';
import { A_001_MD } from './aDoc';

const store = createKeyValueHighlightStore(AsyncStorage);

function makeSpeechEngine(): SpeechEngine {
    try {
        return createNativeSpeechEngine();
    } catch {
        return createMockSpeechEngine({ wordsPerMinute: 200 });
    }
}
const speechEngine = makeSpeechEngine();

const REMOTE_URL = 'https://raw.githubusercontent.com/OWNER/REPO/main/a-001.md';
const LOCAL_PATH = 'file:///ruta/en/el/dispositivo/a-001.md';

type Origin = 'project' | 'url' | 'local';
const ORIGINS: Origin[] = ['project', 'url', 'local'];
const ORIGIN_LABEL: Record<Origin, string> = { project: 'Proyecto', url: 'URL', local: 'Local' };

const SCHEME_CYCLE: DocColorScheme[] = ['auto', 'light', 'dark'];
const SCHEME_LABEL: Record<DocColorScheme, string> = { auto: 'Auto', light: 'Claro', dark: 'Oscuro' };

function sourceFor(origin: Origin): DocumentSource {
    if (origin === 'url') {
        return { uri: REMOTE_URL };
    }
    if (origin === 'local') {
        return { uri: LOCAL_PATH };
    }
    return { markdown: A_001_MD };
}

export default function App(): React.JSX.Element {
    const [scheme, setScheme] = useState<DocColorScheme>('auto');
    const [origin, setOrigin] = useState<Origin>('project');
    const [page, setPage] = useState({ index: 0, count: 0 });

    const { document, isLoading, error, reload } = useDocumentSource(sourceFor(origin));
    const { highlights, toggleWordAt } = useHighlights({
        docId: `a-001:${origin}`,
        plainText: document?.plainText ?? '',
        store,
    });
    const tts = useTextToSpeech({
        plainText: document?.plainText ?? '',
        engine: speechEngine,
    });

    const handleToggleSpeech = (): void => {
        if (tts.status === 'speaking') {
            tts.pause();
        } else if (tts.status === 'paused') {
            tts.resume();
        } else {
            tts.play();
        }
    };
    const speechLabel =
        tts.status === 'speaking' ? 'Pausa' : tts.status === 'paused' ? 'Reanudar' : 'Leer';

    const system = useColorScheme();
    const mode = scheme === 'auto' ? (system ?? 'light') : scheme;
    const isDark = mode === 'dark';
    const chrome = isDark ? darkChrome : lightChrome;

    const handleToggleScheme = (): void => {
        setScheme((prev) => {
            const idx = SCHEME_CYCLE.indexOf(prev);
            return SCHEME_CYCLE[(idx + 1) % SCHEME_CYCLE.length]!;
        });
    };

    return (
        <GestureHandlerRootView style={[styles.root, { backgroundColor: chrome.background }]}>
            <SafeAreaView style={styles.root}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: chrome.title }]}>react-native-document</Text>
                    <Pressable
                        style={[styles.pill, { borderColor: chrome.border }]}
                        onPress={handleToggleScheme}
                    >
                        <Text style={[styles.pillLabel, { color: chrome.title }]}>
                            {SCHEME_LABEL[scheme]}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.controls}>
                    <View style={styles.segment}>
                        {ORIGINS.map((o) => {
                            const activeOrigin = o === origin;
                            return (
                                <Pressable
                                    key={o}
                                    style={[
                                        styles.segmentItem,
                                        { borderColor: chrome.border },
                                        activeOrigin && { backgroundColor: chrome.accent },
                                    ]}
                                    onPress={() => setOrigin(o)}
                                >
                                    <Text
                                        style={[
                                            styles.segmentLabel,
                                            { color: activeOrigin ? chrome.onAccent : chrome.meta },
                                        ]}
                                    >
                                        {ORIGIN_LABEL[o]}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    <View style={styles.speechControls}>
                        <Text style={[styles.meta, { color: chrome.meta }]}>
                            {page.count > 0 ? `Pág. ${page.index + 1}/${page.count}` : ''}
                        </Text>
                        {document ? (
                            <Pressable
                                style={[styles.pill, { borderColor: chrome.border }]}
                                onPress={handleToggleSpeech}
                            >
                                <Text style={[styles.pillLabel, { color: chrome.title }]}>
                                    {speechLabel}
                                </Text>
                            </Pressable>
                        ) : null}
                        {document && tts.status !== 'idle' ? (
                            <Pressable
                                style={[styles.pill, { borderColor: chrome.border }]}
                                onPress={tts.stop}
                            >
                                <Text style={[styles.pillLabel, { color: chrome.title }]}>■</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                <View style={[styles.viewer, { backgroundColor: chrome.card }]}>
                    {document ? (
                        <DocumentViewer
                            document={document}
                            colorScheme={scheme}
                            highlights={highlights}
                            active={tts.activeRange}
                            onWordPress={toggleWordAt}
                            onPageChange={(index, count) => setPage({ index, count })}
                        />
                    ) : (
                        <View style={styles.status}>
                            <Text style={[styles.statusText, { color: chrome.meta }]}>
                                {isLoading
                                    ? 'Cargando…'
                                    : (error?.message ?? 'Sin documento')}
                            </Text>
                            {error ? (
                                <Pressable
                                    style={[styles.pill, { borderColor: chrome.border }]}
                                    onPress={reload}
                                >
                                    <Text style={[styles.pillLabel, { color: chrome.title }]}>
                                        Reintentar
                                    </Text>
                                </Pressable>
                            ) : null}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const lightChrome = {
    background: '#ececef',
    card: '#ffffff',
    title: '#1a1a1a',
    meta: '#6a6a72',
    border: '#cfcfd6',
    accent: '#0b62d6',
    onAccent: '#ffffff',
};

const darkChrome = {
    background: '#0a0a0d',
    card: '#141418',
    title: '#f5f5f7',
    meta: '#9a9aa2',
    border: '#33333c',
    accent: '#3b82f6',
    onAccent: '#ffffff',
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controls: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    segment: {
        flexDirection: 'row',
        gap: 6,
    },
    speechControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    segmentItem: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    segmentLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    meta: {
        fontSize: 13,
    },
    pill: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    pillLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    viewer: {
        flex: 1,
        margin: 12,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    status: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
    },
    statusText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
