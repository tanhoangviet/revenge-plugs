import { React, ReactNative, constants } from '@vendetta/metro/common';
import { storage } from '@vendetta/plugin';
import { find, findByProps, findByName, findByStoreName } from '@vendetta/metro';
import { General } from '@vendetta/ui/components';
import { getAssetIDByName } from '@vendetta/ui/assets';
import { showToast } from '@vendetta/ui/toasts';
import { DownloadButton, FCButton, FCButtonBar, MonospaceSvg, WordWrapSvg } from './FCButtons';
import JumpModal from './JumpModal';
import { FCTitle } from './FCTitle';
import { semanticColors } from '@vendetta/ui';
import LoadMore from './LoadMore';
import getMessages from '../translations';

const intl = findByProps('intl').intl;
const ThemeStore = findByStoreName('ThemeStore');
const resolveSemanticColor =
  find((m) => m.default?.internal?.resolveSemanticColor)?.default.internal.resolveSemanticColor ??
  find((m) => m.meta?.resolveSemanticColor)?.meta.resolveSemanticColor ??
  (() => {});

// https://github.com/nexpid/VendettaPlugins/blob/main/stuff/types.tsx#L43-L47
const Navigator = findByName('Navigator') ?? findByProps('Navigator')?.Navigator;
const closeButton = findByProps('getRenderCloseButton')?.getRenderCloseButton ?? findByProps('getHeaderCloseButton')?.getHeaderCloseButton;

const { ScrollView, Image, Modal }: { [key: string]: any } = ReactNative;

const { View, Text, TouchableOpacity } = General;

const SafeArea = findByProps('useSafeAreaInsets');
const humanize = findByProps('intword');
const DEFAULT_CHUNK_SIZE = 60 * 1024;

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

const MODALS = {
  JUMP: JumpModal,
};

const Loading: any = ({ colors, text }) => (
  <View style={{ margin: 15, gap: 10 }}>
    <View style={{ height: 16, width: '72%', borderRadius: 4, backgroundColor: colors.bgBright }} />
    <View style={{ height: 16, width: '92%', borderRadius: 4, backgroundColor: colors.bgDark }} />
    <View style={{ height: 16, width: '48%', borderRadius: 4, backgroundColor: colors.bgDark }} />
    <Text style={{ color: colors.sub, marginTop: 6 }}>{text}</Text>
  </View>
);

const StateMessage: any = ({ colors, title, actionText, onAction }) => (
  <View style={{ margin: 15, padding: 14, borderRadius: 6, backgroundColor: colors.bgDark }}>
    <Text style={{ color: colors.header, lineHeight: 20 }}>{title}</Text>
    {onAction && (
      <TouchableOpacity onPress={onAction} style={{ marginTop: 12, padding: 10, borderRadius: 5, backgroundColor: colors.bgBright }}>
        <Text style={{ color: colors.header, textAlign: 'center', fontFamily: constants.Fonts.PRIMARY_BOLD }}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

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
  const [translations] = React.useState(() => getMessages(intl.currentLocale));
  const color = (semantic, fallback) => resolveSemanticColor(ThemeStore.theme, semantic) ?? fallback;
  const colors = {
    header: color(semanticColors.MOBILE_TEXT_HEADING_PRIMARY, '#f4f4f5'),
    sub: color(semanticColors.TEXT_MUTED, '#a1a1aa'),
    bgDark: color(semanticColors.BACKGROUND_BASE_LOWEST, '#18181b'),
    bgBright: color(semanticColors.BACKGROUND_BASE_LOWER, '#27272a'),
    bgBrighter: color(semanticColors.BACKGROUND_ACCENT, '#3f3f46'),
  };

  const buttonColors = {
    background: {
      active: colors.bgBrighter,
      inactive: colors.bgDark,
    },
    border: {
      active: colors.bgBright,
      inactive: colors.bgDark,
    },
  };

  const Content: any = () => {
    const insets = SafeArea.useSafeAreaInsets();
    const [visibleModal, setVisibleModal] = React.useState<{
      key: keyof typeof MODALS;
      props: { [key: string]: any };
    } | null>(null);
    const configuredChunkSize = Number(storage.chunkSize);
    const maxBytes = Number.isFinite(configuredChunkSize) && configuredChunkSize > 0 ? Math.floor(configuredChunkSize) : DEFAULT_CHUNK_SIZE;
    const totalBytes = Math.max(0, Number(bytes) || 0);
    const [state, setState] = React.useState<LoadState>({ content: '', loadedBytes: 0, status: 'loading', error: '' });
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);

    const scrollViewRef = React.useRef(null);
    const requestRef = React.useRef(0);
    const pendingMoreRef = React.useRef(false);

    const [wordWrap, setWordWrap] = React.useState(false);
    const [monospace, setMonospace] = React.useState(true);
    const [nl, setnl] = React.useState<boolean[]>([]);

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

    let lineIteration = 0;

    if (state.status === 'loading') return <Loading colors={colors} text={translations.LOADING} />;
    if (state.status === 'error') return <StateMessage colors={colors} title={state.error || translations.LOAD_ERROR} actionText={translations.RETRY} onAction={loadInitial} />;
    if (state.status === 'empty') return <StateMessage colors={colors} title={translations.EMPTY_FILE} />;

    return (
      <View style={{ marginTop: 0 }}>
        <FCButtonBar>
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
                  buttonColor: colors.bgBright,
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
                  transform: [{ scaleX: -1 }, { rotate: '90deg' }],
                }}
              />
            }
          />
        </FCButtonBar>
        <ScrollView ref={scrollViewRef} style={{ margin: 15, marginBottom: 50 + insets.bottom }}>
          <ScrollView horizontal={!wordWrap}>
            <View style={{ flexDirection: 'row' }}>
              <View
                style={{
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                  backgroundColor: colors.bgDark,
                  marginRight: 5,
                  paddingRight: 2,
                  paddingLeft: 2,
                  alignSelf: 'flex-start',
                }}>
                <Text style={{ textAlign: 'right', color: colors.sub, lineHeight: 20 }}>{nl.map((line) => (line ? ++lineIteration : ' ')).join('\n')}</Text>
              </View>
              <Text
                selectable={true}
                style={[{ color: colors.header, lineHeight: 20, flex: 1 }, monospace && { fontFamily: constants.Fonts.CODE_NORMAL }]}
                onTextLayout={(e) => {
                  let lines = e.nativeEvent.lines;
                  const nextLines = lines.map((_line, i) => (i > 0 ? lines[i - 1].text.indexOf('\n') > -1 : true));
                  setnl((current) => (current.length === nextLines.length && current.every((line, i) => line === nextLines[i]) ? current : nextLines));
                }}>
                {state.content}
              </Text>
            </View>
          </ScrollView>
          {state.loadedBytes < totalBytes && (
            <LoadMore
              buttonColor={colors.bgBright}
              buttonTextColor={colors.header}
              textColor={colors.sub}
              remainingText={`+ ${filesize(totalBytes - state.loadedBytes)} ${translations.NOT_LOADED}.`}
              moreText={isLoadingMore ? translations.LOADING : translations.LOAD_MORE}
              disabled={isLoadingMore}
              onPress={onLoadMore}
            />
          )}
        </ScrollView>
        <Modal transparent={true} animationType="none" visible={visibleModal != null} onRequestClose={() => setVisibleModal(null)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                backgroundColor: colors.bgBrighter,
                padding: 20,
                borderRadius: 10,
                width: '90%',
              }}>
              {visibleModal != null && <ModalComponent {...visibleModal.props} />}
            </View>
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
