import { React, ReactNative, constants } from '@vendetta/metro/common';
import { findByProps, findByName } from '@vendetta/metro';
import { General } from '@vendetta/ui/components';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { showToast } from '@vendetta/ui/toasts';
import { DownloadButton, FCButton, FCButtonBar, MonospaceSvg, WordWrapSvg } from './FCButtons';
import JumpModal from './JumpModal';
import { FCTitle } from './FCTitle';
import LoadMore from './LoadMore';
import getMessages from '../translations';
import { ensureSettings, getBooleanSetting, getChunkSize, getTextZoomHoldMs } from '../settings';
import { BubbleField, GlassPanel, getGlassColors } from './glass';
import { getCodeInsights, tokenizeCode } from '../utils/codeIntelligence';

const intl = findByProps('intl').intl;

// https://github.com/nexpid/VendettaPlugins/blob/main/stuff/types.tsx#L43-L47
const Navigator = findByName('Navigator') ?? findByProps('Navigator')?.Navigator;
const closeButton = findByProps('getRenderCloseButton')?.getRenderCloseButton ?? findByProps('getHeaderCloseButton')?.getHeaderCloseButton;

const { ScrollView, Image, Modal, Animated }: { [key: string]: any } = ReactNative;

const { View, Text, TouchableOpacity } = General;

const SafeArea = findByProps('useSafeAreaInsets');
const humanize = findByProps('intword');

const fallbackFilesize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${unitIndex === 0 || value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
};

const filesize = (bytes: number): string =>
  humanize?.intword?.(bytes, ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'], 1024, undefined, undefined, undefined, ' ') ?? fallbackFilesize(bytes);

const modals = findByProps('pushModal');

const Loading: any = ({ colors, text }) => (
  <GlassPanel colors={colors} style={{ margin: 15 }} innerStyle={{ gap: 10 }}>
    <View style={{ height: 16, width: '72%', borderRadius: 999, backgroundColor: colors.coreStrong }} />
    <View style={{ height: 16, width: '92%', borderRadius: 999, backgroundColor: colors.core }} />
    <View style={{ height: 16, width: '48%', borderRadius: 999, backgroundColor: colors.core }} />
    <Text style={{ color: colors.muted, marginTop: 6 }}>{text}</Text>
  </GlassPanel>
);

const StateMessage: any = ({ colors, title, actionText, onAction }) => (
  <GlassPanel colors={colors} style={{ margin: 15 }} innerStyle={{ padding: 16 }}>
    <Text style={{ color: colors.text, lineHeight: 20 }}>{title}</Text>
    {onAction && (
      <TouchableOpacity
        onPress={onAction}
        style={{
          marginTop: 12,
          padding: 11,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: colors.accent,
          backgroundColor: colors.accentSoft,
        }}>
        <Text style={{ color: colors.text, textAlign: 'center', fontFamily: constants.Fonts.PRIMARY_BOLD }}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </GlassPanel>
);

const ToolbarTextIcon: any = ({ label, color }) => (
  <Text style={{ color, fontFamily: constants.Fonts.PRIMARY_BOLD, fontSize: 15, minWidth: 24, textAlign: 'center' }}>{label}</Text>
);

const MetricChip: any = ({ colors, label, value }) => (
  <View
    style={{
      borderWidth: 1,
      borderColor: colors.hairline,
      backgroundColor: colors.core,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minWidth: 72,
    }}>
    <Text style={{ color: colors.muted, fontSize: 10, fontFamily: constants.Fonts.PRIMARY_BOLD, textTransform: 'uppercase' }}>{label}</Text>
    <Text style={{ color: colors.text, marginTop: 3, fontSize: 13, fontFamily: constants.Fonts.PRIMARY_BOLD }} numberOfLines={1}>{value}</Text>
  </View>
);

const ProgressBar: any = ({ colors, percent }) => (
  <View
    style={{
      height: 7,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: colors.core,
      borderWidth: 1,
      borderColor: colors.hairline,
    }}>
    <View
      style={{
        width: `${Math.max(4, Math.min(100, percent))}%`,
        height: '100%',
        borderRadius: 999,
        backgroundColor: colors.accent,
      }}
    />
  </View>
);

const InfoStrip: any = ({ colors, insights, filename, loadedBytes, totalBytes }) => (
  <GlassPanel colors={colors} style={{ marginHorizontal: 15, marginTop: 12 }} innerStyle={{ padding: 13 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontFamily: constants.Fonts.PRIMARY_BOLD }} numberOfLines={1}>{filename}</Text>
        <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }} numberOfLines={1}>{insights.language.label}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.accentSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }}>
        <Text style={{ color: colors.accent, fontSize: 12, fontFamily: constants.Fonts.PRIMARY_BOLD }}>{insights.metrics.loadedPercent}%</Text>
      </View>
    </View>
    <View style={{ marginTop: 12 }}>
      <ProgressBar colors={colors} percent={insights.metrics.loadedPercent} />
    </View>
    <Text style={{ color: colors.muted, marginTop: 8, fontSize: 11 }} numberOfLines={1}>
      Loaded {filesize(loadedBytes)} of {filesize(totalBytes)}
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 }}>
      <MetricChip colors={colors} label="Lines" value={String(insights.metrics.lines)} />
      <MetricChip colors={colors} label="Blocks" value={String(insights.metrics.functions)} />
      <MetricChip colors={colors} label="Imports" value={String(insights.metrics.imports)} />
      <MetricChip colors={colors} label="Signals" value={String(insights.signals.length)} />
    </View>
  </GlassPanel>
);

const EditorChrome: any = ({ colors, filename, insights, children }) => (
  <GlassPanel colors={colors} innerStyle={{ padding: 0, backgroundColor: colors.editor }}>
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.hairline,
        backgroundColor: colors.lineRail,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.editorText, fontSize: 13, fontFamily: constants.Fonts.PRIMARY_BOLD }} numberOfLines={1}>{filename}</Text>
        <Text style={{ color: colors.editorMuted, marginTop: 2, fontSize: 11 }} numberOfLines={1}>Preview editor</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: colors.hairline, backgroundColor: colors.core, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
        <Text style={{ color: colors.accent, fontSize: 11, fontFamily: constants.Fonts.PRIMARY_BOLD }}>{insights.language.label}</Text>
      </View>
    </View>
    <View style={{ padding: 10 }}>
      {children}
    </View>
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: colors.hairline,
        backgroundColor: colors.lineRail,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
      <Text style={{ color: colors.editorMuted, fontSize: 11 }} numberOfLines={1}>
        {insights.metrics.lines} lines
      </Text>
      <Text style={{ color: colors.editorMuted, fontSize: 11 }} numberOfLines={1}>
        {insights.metrics.functions} blocks
      </Text>
      <Text style={{ color: colors.editorMuted, fontSize: 11 }} numberOfLines={1}>
        {insights.metrics.loadedPercent}% loaded
      </Text>
    </View>
  </GlassPanel>
);

const InfoModal: any = ({ colors, insights, filename, sizeText, onClose }) => (
  <>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontFamily: constants.Fonts.PRIMARY_BOLD }}>File Information</Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>{filename} - {sizeText}</Text>
      </View>
      <TouchableOpacity onPress={onClose} style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.core, borderWidth: 1, borderColor: colors.hairline }}>
        <Text style={{ color: colors.text, fontFamily: constants.Fonts.PRIMARY_BOLD }}>Close</Text>
      </TouchableOpacity>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      <MetricChip colors={colors} label="Language" value={insights.language.label} />
      <MetricChip colors={colors} label="Active" value={String(insights.metrics.nonEmptyLines)} />
      <MetricChip colors={colors} label="Comments" value={String(insights.metrics.commentLines)} />
      <MetricChip colors={colors} label="Longest" value={`${insights.metrics.longestLine} chars`} />
    </View>
    <Text style={{ color: colors.muted, lineHeight: 20 }}>
      {insights.signals.length ? `Signals: ${insights.signals.join(', ')}` : 'No high-level signals were detected in the loaded chunk.'}
    </Text>
  </>
);

const ExplainModal: any = ({ colors, insights, filename, onClose }) => (
  <>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: colors.text, fontSize: 20, fontFamily: constants.Fonts.PRIMARY_BOLD }}>Code Explain</Text>
        <Text style={{ color: colors.muted, marginTop: 4 }}>{filename}</Text>
      </View>
      <TouchableOpacity onPress={onClose} style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: colors.core, borderWidth: 1, borderColor: colors.hairline }}>
        <Text style={{ color: colors.text, fontFamily: constants.Fonts.PRIMARY_BOLD }}>Close</Text>
      </TouchableOpacity>
    </View>
    <ScrollView style={{ maxHeight: 420 }}>
      {insights.overview.map((line) => (
        <Text key={line} style={{ color: colors.editorText, lineHeight: 21, marginBottom: 8 }}>{line}</Text>
      ))}
      {insights.sections.map((section) => (
        <View key={section.title} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.accent, fontFamily: constants.Fonts.PRIMARY_BOLD, marginBottom: 7 }}>{section.title}</Text>
          {section.items.map((item) => (
            <Text key={item} style={{ color: colors.muted, lineHeight: 20, marginBottom: 5 }}>- {item}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  </>
);

function getSyntaxPalette(colors) {
  return {
    plain: colors.editorText,
    keyword: colors.accent,
    string: colors.isDark ? '#ce9178' : '#0a7f42',
    number: colors.isDark ? '#b5cea8' : '#0550ae',
    comment: colors.editorMuted,
    function: colors.isDark ? '#dcdcaa' : '#795e26',
    operator: colors.muted,
  };
}

const HighlightedCodeText: any = ({ content, tokens, colors }) => {
  if (!tokens) return <>{content}</>;
  const palette = getSyntaxPalette(colors);
  return (
    <>
      {tokens.map((line, lineIndex) => (
        <React.Fragment key={`line-${lineIndex}`}>
          {line.map((token, tokenIndex) => (
            <Text key={`${lineIndex}-${tokenIndex}`} style={{ color: palette[token.type] ?? palette.plain }}>
              {token.text}
            </Text>
          ))}
          {lineIndex < tokens.length - 1 && <Text>{'\n'}</Text>}
        </React.Fragment>
      ))}
    </>
  );
};

const MODALS = {
  JUMP: JumpModal,
  INFO: InfoModal,
  EXPLAIN: ExplainModal,
};

type LoadState = {
  content: string;
  loadedBytes: number;
  status: 'loading' | 'ready' | 'empty' | 'error';
  error: string;
};

export const FCModal: any = ({
  filename = 'unknown',
  url = '',
  bytes = 1,
}) => {
  ensureSettings();
  const [translations] = React.useState(() => getMessages(intl.currentLocale));
  const glassColors = getGlassColors();
  const colors = {
    ...glassColors,
    header: glassColors.text,
    sub: glassColors.muted,
    bgDark: glassColors.core,
    bgBright: glassColors.coreStrong,
    bgBrighter: glassColors.shell,
  };

  const buttonColors = {
    background: {
      active: colors.accentSoft,
      inactive: colors.core,
    },
    border: {
      active: colors.accent,
      inactive: colors.hairline,
    },
  };

  const Content: any = () => {
    const insets = SafeArea.useSafeAreaInsets();
    const [visibleModal, setVisibleModal] = React.useState<{
      key: keyof typeof MODALS;
      props: { [key: string]: any };
    } | null>(null);
    const [zoomVisible, setZoomVisible] = React.useState(false);
    const maxBytes = getChunkSize();
    const totalBytes = Math.max(0, Number(bytes) || 0);
    const [state, setState] = React.useState<LoadState>({ content: '', loadedBytes: 0, status: 'loading', error: '' });
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const scrollViewRef = React.useRef(null);
    const requestRef = React.useRef(0);
    const pendingMoreRef = React.useRef(false);

    const [wordWrap, setWordWrap] = React.useState(() => getBooleanSetting('defaultWordWrap'));
    const [monospace, setMonospace] = React.useState(() => getBooleanSetting('defaultMonospace'));
    const [nl, setnl] = React.useState<boolean[]>([]);
    const showLineNumbers = getBooleanSetting('showLineNumbers');
    const bubblesEnabled = getBooleanSetting('bubbleEffects') && getBooleanSetting('liquidGlass');
    const textZoomEnabled = getBooleanSetting('textGlassZoom');
    const textZoomHoldMs = getTextZoomHoldMs();
    const syntaxHighlightEnabled = getBooleanSetting('syntaxHighlight');
    const codeInsightsEnabled = getBooleanSetting('codeInsights');
    const animatedReader = getBooleanSetting('animatedReader');
    const entrance = React.useRef(new Animated.Value(1)).current;

    const getRange = (startByte: number) => {
      if (totalBytes <= 0) return null;
      const endByte = Math.min(startByte + maxBytes - 1, totalBytes - 1);
      return {
        startByte,
        endByte,
        nextLoadedBytes: endByte + 1,
      };
    };

    const loadInitial = React.useCallback(() => {
      const requestId = ++requestRef.current;
      pendingMoreRef.current = false;
      setIsLoadingMore(false);
      setnl([]);

      if (!url) {
        setState({ content: '', loadedBytes: 0, status: 'error', error: translations.LOAD_ERROR });
        return;
      }

      if (totalBytes === 0) {
        setState({ content: '', loadedBytes: 0, status: 'empty', error: '' });
        return;
      }

      const range = getRange(0);
      if (!range) return;

      setState({ content: '', loadedBytes: 0, status: 'loading', error: '' });
      fetch(url, {
        headers: {
          Range: `bytes=${range.startByte}-${range.endByte}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const text = await response.text();
          if (requestRef.current !== requestId) return;
          const loadedBytes = response.status === 206 ? range.nextLoadedBytes : totalBytes;
          setState({
            content: text,
            loadedBytes,
            status: text.length || totalBytes > 0 ? 'ready' : 'empty',
            error: '',
          });
        })
        .catch((error) => {
          if (requestRef.current !== requestId) return;
          setState({ content: '', loadedBytes: 0, status: 'error', error: error?.message ?? translations.LOAD_ERROR });
        });
    }, [url, totalBytes, maxBytes, translations]);

    React.useEffect(() => {
      loadInitial();
      return () => {
        requestRef.current++;
        pendingMoreRef.current = false;
      };
    }, [loadInitial]);

    const ModalComponent = visibleModal ? MODALS[visibleModal.key] : null;

    function onJumpToTop() {
      setVisibleModal(null);
      let scrollView: any = scrollViewRef.current;
      scrollView?.scrollTo?.({ y: 0, animated: true });
    }

    function onJumpToBottom() {
      setVisibleModal(null);
      let scrollView: any = scrollViewRef.current;
      scrollView?.scrollToEnd?.({ animated: true });
    }

    function onLoadMore() {
      if (pendingMoreRef.current || state.loadedBytes >= totalBytes) return;
      const range = getRange(state.loadedBytes);
      if (!range) return;

      pendingMoreRef.current = true;
      setIsLoadingMore(true);
      fetch(url, {
        headers: {
          Range: `bytes=${range.startByte}-${range.endByte}`,
        },
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const text = await response.text();
          const loadedBytes = response.status === 206 ? range.nextLoadedBytes : totalBytes;
          setState((current) => ({
            content: current.content + text,
            loadedBytes: Math.max(current.loadedBytes, loadedBytes),
            status: 'ready',
            error: '',
          }));
        })
        .catch(() => {
          showToast('Error: Network response was not ok', getAssetIDByName('ic_close_circle'));
        })
        .finally(() => {
          pendingMoreRef.current = false;
          setIsLoadingMore(false);
        });
    }

    const insights = React.useMemo(
      () => getCodeInsights(state.content, filename, totalBytes, state.loadedBytes),
      [state.content, state.loadedBytes, totalBytes],
    );
    const highlightedTokens = React.useMemo(
      () => (syntaxHighlightEnabled ? tokenizeCode(state.content, insights.language.key) : null),
      [state.content, insights.language.key, syntaxHighlightEnabled],
    );

    React.useEffect(() => {
      if (!animatedReader || state.status !== 'ready') {
        entrance.setValue(1);
        return;
      }

      entrance.setValue(0);
      Animated.timing(entrance, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }).start();
    }, [animatedReader, entrance, state.loadedBytes, state.status]);

    const entranceStyle = animatedReader
      ? {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
            {
              scale: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.985, 1],
              }),
            },
          ],
        }
      : null;

    let lineIteration = 0;

    if (state.status === 'loading') return <Loading colors={colors} text={translations.LOADING} />;
    if (state.status === 'error') return <StateMessage colors={colors} title={state.error || translations.LOAD_ERROR} actionText={translations.RETRY} onAction={loadInitial} />;
    if (state.status === 'empty') return <StateMessage colors={colors} title={translations.EMPTY_FILE} />;

    return (
      <View style={{ flex: 1, marginTop: 0, backgroundColor: colors.screen }}>
        <BubbleField colors={colors} enabled={bubblesEnabled} />
        <FCButtonBar colors={colors}>
          <FCButton
            onPress={() => setWordWrap((v) => !v)}
            active={wordWrap}
            colors={buttonColors}
            info={translations.TOGGLE_WORD_WRAP}
            content={<WordWrapSvg color={wordWrap ? colors.header : colors.sub} />}
          />
          <FCButton
            onPress={() => setMonospace((v) => !v)}
            active={monospace}
            colors={buttonColors}
            info={translations.MONOSPACE}
            content={<MonospaceSvg color={monospace ? colors.header : colors.sub} />}
          />
          <FCButton
            onPress={() =>
              setVisibleModal({
                key: 'JUMP',
                props: {
                  onJumpToTop,
                  onJumpToBottom,
                  onClose: () => setVisibleModal(null),
                  textColor: colors.sub,
                  buttonColor: colors.core,
                  borderColor: colors.hairline,
                  texts: {
                    JUMP: translations.JUMP,
                    JUMP_BOTTOM: translations.JUMP_BOTTOM,
                    JUMP_TOP: translations.JUMP_TOP,
                  },
                },
              })
            }
            active={false}
            colors={buttonColors}
            info={translations.JUMP}
            content={
              <Image
                source={getAssetIDByName('ic_arrow_right')}
                style={{
                  height: 24,
                  width: 24,
                  tintColor: colors.sub,
                  transform: [{ scaleX: -1 }, { rotate: '90deg' }],
                }}
              />
            }
          />
          {codeInsightsEnabled && (
            <FCButton
              onPress={() =>
                setVisibleModal({
                  key: 'INFO',
                  props: {
                    colors,
                    insights,
                    filename,
                    sizeText: filesize(bytes),
                    onClose: () => setVisibleModal(null),
                  },
                })
              }
              active={false}
              colors={buttonColors}
              info="File information"
              content={<ToolbarTextIcon label="i" color={colors.sub} />}
            />
          )}
          {codeInsightsEnabled && (
            <FCButton
              onPress={() =>
                setVisibleModal({
                  key: 'EXPLAIN',
                  props: {
                    colors,
                    insights,
                    filename,
                    onClose: () => setVisibleModal(null),
                  },
                })
              }
              active={false}
              colors={buttonColors}
              info="Code explain"
              content={<ToolbarTextIcon label="{}" color={colors.sub} />}
            />
          )}
        </FCButtonBar>
        {codeInsightsEnabled && (
          <Animated.View style={entranceStyle}>
            <InfoStrip colors={colors} insights={insights} filename={filename} loadedBytes={state.loadedBytes} totalBytes={totalBytes} />
          </Animated.View>
        )}
        <Animated.View style={entranceStyle}>
        <ScrollView ref={scrollViewRef} style={{ margin: 15, marginBottom: 50 + insets.bottom }}>
          <EditorChrome colors={colors} filename={filename} insights={insights}>
            <ScrollView horizontal={!wordWrap}>
              <View style={{ flexDirection: 'row' }}>
                {showLineNumbers && (
                  <View
                    style={{
                      borderRadius: 18,
                      backgroundColor: colors.lineRail,
                      borderWidth: 1,
                      borderColor: colors.hairline,
                      marginRight: 8,
                      paddingVertical: 5,
                      paddingRight: 7,
                      paddingLeft: 7,
                      alignSelf: 'flex-start',
                      minWidth: 36,
                    }}>
                    <Text style={{ textAlign: 'right', color: colors.editorMuted, lineHeight: 20 }}>
                      {nl.map((line) => (line ? ++lineIteration : ' ')).join('\n')}
                    </Text>
                  </View>
                )}
                <Text
                  selectable={true}
                  delayLongPress={textZoomHoldMs}
                  onLongPress={() => {
                    if (textZoomEnabled) setZoomVisible(true);
                  }}
                  style={[{ color: colors.editorText, lineHeight: 20, flex: 1 }, monospace && { fontFamily: constants.Fonts.CODE_NORMAL }]}
                  onTextLayout={(e) => {
                    if (!showLineNumbers) return;
                    let lines = e.nativeEvent.lines;
                    const nextLines = lines.map((_line, i) => (i > 0 ? lines[i - 1].text.indexOf('\n') > -1 : true));
                    setnl((current) => (current.length === nextLines.length && current.every((line, i) => line === nextLines[i]) ? current : nextLines));
                  }}>
                  <HighlightedCodeText content={state.content} tokens={highlightedTokens} colors={colors} />
                </Text>
              </View>
            </ScrollView>
          </EditorChrome>
          {state.loadedBytes < totalBytes && (
            <LoadMore
              buttonColor={colors.core}
              buttonTextColor={colors.text}
              textColor={colors.muted}
              borderColor={colors.hairline}
              remainingText={`+ ${filesize(totalBytes - state.loadedBytes)} ${translations.NOT_LOADED}.`}
              moreText={isLoadingMore ? translations.LOADING : translations.LOAD_MORE}
              disabled={isLoadingMore}
              onPress={onLoadMore}
            />
          )}
        </ScrollView>
        </Animated.View>
        <Modal transparent={true} animationType="none" visible={visibleModal != null} onRequestClose={() => setVisibleModal(null)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.isDark ? 'rgba(5, 8, 16, 0.58)' : 'rgba(225, 235, 255, 0.48)',
            }}>
            <BubbleField colors={colors} enabled={bubblesEnabled} />
            <GlassPanel colors={colors} style={{ width: '90%' }} innerStyle={{ padding: 20 }}>
              {visibleModal != null && <ModalComponent {...visibleModal.props} />}
            </GlassPanel>
          </View>
        </Modal>
        <Modal transparent={true} animationType="fade" visible={zoomVisible} onRequestClose={() => setZoomVisible(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 18,
              backgroundColor: colors.isDark ? 'rgba(4, 7, 13, 0.64)' : 'rgba(218, 229, 247, 0.56)',
            }}>
            <BubbleField colors={colors} enabled={bubblesEnabled} />
            <GlassPanel colors={colors} style={{ width: '100%', maxHeight: '78%' }} innerStyle={{ padding: 16, backgroundColor: colors.editor }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View>
                  <Text style={{ color: colors.accent, fontSize: 12, fontFamily: constants.Fonts.PRIMARY_BOLD, textTransform: 'uppercase' }}>Glass Zoom</Text>
                  <Text style={{ color: colors.muted, marginTop: 2, fontSize: 12 }}>{filename}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setZoomVisible(false)}
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    backgroundColor: colors.core,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                  }}>
                  <Text style={{ color: colors.text, fontFamily: constants.Fonts.PRIMARY_BOLD }}>Close</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                <Text
                  selectable={true}
                  style={[
                    {
                      color: colors.editorText,
                      fontSize: 19,
                      lineHeight: 29,
                    },
                    monospace && { fontFamily: constants.Fonts.CODE_NORMAL },
                  ]}>
                  <HighlightedCodeText content={state.content} tokens={highlightedTokens} colors={colors} />
                </Text>
              </ScrollView>
            </GlassPanel>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <Navigator
      initialRouteName="FILE_CONTENT_PREVIEW"
      screens={{
        FILE_CONTENT_PREVIEW: {
          headerLeft: closeButton(() => modals.popModal('file-content-preview')),
          headerRight: () => <DownloadButton url={url} saveText={translations.FILE_SAVED} failText={translations.FILE_SAVE_ERROR} copyText={translations.COPIED} />,
          render: () => <Content />,
          headerTitle: () => <FCTitle filename={filename} subtext={filesize(bytes)} color={colors.header} copyText={translations.COPIED} />,
        },
      }}
    />
  );
};
