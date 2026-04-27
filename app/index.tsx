import { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const SCHEDULE_URL = 'https://schedule.qiuzizhao.com/';

export default function ScheduleScreen() {
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const source = useMemo(() => ({ uri: SCHEDULE_URL }), []);

  if (hasError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.title}>WorkSchedule</Text>
        <Text style={styles.message}>页面暂时无法加载，请检查网络或稍后重试。</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            setHasError(false);
            setReloadKey((current) => current + 1);
          }}>
          <Text style={styles.primaryButtonText}>重新加载</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => Linking.openURL(SCHEDULE_URL)}>
          <Text style={styles.secondaryButtonText}>在浏览器中打开</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <WebView
        key={reloadKey}
        source={source}
        style={styles.webview}
        startInLoadingState
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        renderLoading={() => (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.message}>正在加载工作信息...</Text>
          </View>
        )}
        onError={() => setHasError(true)}
        onHttpError={() => setHasError(true)}
        onShouldStartLoadWithRequest={(request) => {
          if (/^https?:/i.test(request.url)) {
            return true;
          }

          Linking.openURL(request.url).catch(() => {});
          return false;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4b5563',
    textAlign: 'center',
  },
  primaryButton: {
    minWidth: 140,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    minWidth: 140,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
