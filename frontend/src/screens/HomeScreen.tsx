// HomeScreen.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MoodStoryHeader from '../components/MoodStoryHeader'; //
import AsyncStorage from '@react-native-async-storage/async-storage';
import IdSearchInput from '../components/IdSearchInput';
import { Easing } from 'react-native';

const API_URL = 'https://mycarering.loca.lt';
const WEBSOCKET_URL = "wss://carering.loca.lt/ws"; // Go WebSocket 서버 주소

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 40;


const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  // stories와 loadingStories 상태 제거
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOffset = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isSearchModalVisible) {
      setIsMounted(true);
      Animated.timing(translateY, {
        toValue: height * 0.2,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 600,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
      });
    }
  }, [isSearchModalVisible]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      const sortedPosts = res.data.sort((a, b) => b.id - a.id);
      setPosts(sortedPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log("✅ WebSocket Connected to Go server");
        ws.send(JSON.stringify({ type: "join", room: "feed" }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case "new_post":
              setPosts(prev => {
                if (prev.some(p => p.id === message.post.id)) return prev;
                return [message.post, ...prev].sort((a, b) => b.id - a.id);
              });
              break;
            case "delete_post":
              setPosts(prev => prev.filter(p => p.id !== message.post_id));
              break;
            case "update_post_likes":
              setPosts(prev =>
                prev.map(p =>
                  p.id === message.post_id ? { ...p, likes: message.likes } : p
                )
              );
              break;
            case "new_comment":
              setPosts(prev =>
                prev.map(p => {
                  if (p.id === message.comment.post_id) {
                    const updatedComments = p.comments ? [...p.comments] : [];
                    if (!updatedComments.some(c => c.id === message.comment.id)) {
                      updatedComments.push(message.comment);
                    }
                    return { ...p, comments: updatedComments };
                  }
                  return p;
                })
              );
              break;
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket Disconnected from Go server. Code:", event.code, "Reason:", event.reason);
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[styles.header, {
          paddingTop: insets.top + 6,
          height: HEADER_HEIGHT + insets.top,
          transform: [{ translateY: headerOffset }],
          opacity: headerOpacity,
        }]}
      >
        <View style={styles.leftSection}>
          <View style={styles.brandContainer}>
            <Image source={require('../../assets/logotext.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
            <Image source={require('../../assets/search.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Image source={require('../../assets/bell.png')} style={styles.icon} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + 10, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} progressViewOffset={HEADER_HEIGHT} />}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* MoodStoryHeader를 조건 없이 바로 렌더링 */}
        <View style={{ paddingHorizontal: 5, marginBottom: 0 }}>
          <MoodStoryHeader />
        </View>

        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={require('../../assets/empty-box.png')} style={styles.emptyImage} />
            <Text style={styles.emptyText}>There are no posts yet.</Text>
          </View>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...post}
            />
          ))
        )}
      </Animated.ScrollView>

      {isMounted && (
        <Modal transparent visible>
          <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>

          <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
            <View style={styles.modalHandle} />
            <IdSearchInput
              onSearch={query => console.log('검색:', query)}
              onCloseModal={() => setSearchModalVisible(false)}
            />
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 0, zIndex: 100, elevation: 0,
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingRight: 15 },
  brandContainer: { flexDirection: 'row', alignItems: 'center' },
  logoImage: { width: 120, height: 30 },
  icon: { width: 24, height: 24, tintColor: '#4387E5', marginHorizontal: 5 },
  notificationDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', position: 'absolute', top: -2, right: -2
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 250 },
  emptyImage: { width: 120, height: 120, marginBottom: 20, opacity: 0.6 },
  emptyText: { fontSize: 18, color: '#9CA3AF', fontWeight: '600' },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },
});

export default HomeScreen;