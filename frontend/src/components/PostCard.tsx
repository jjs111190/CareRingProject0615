// PostCard.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Alert,
  TouchableWithoutFeedback, Animated, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import MessageDetail from '../screens/MessageDetail';
import LinearGradient from 'react-native-linear-gradient';
import { Easing } from 'react-native';

interface PostCardProps {
  id: number;
  image_url?: string;
  phrase?: string;
  user_name?: string;
  user_id: number;
  created_at?: string;
  likes: number;
  comments: CommentType[];
  hashtags?: string[];
  // onDelete prop 제거
}

interface CommentType {
  id: number;
  user_name: string;
  content: string;
  user_id: number;
  created_at: string;
  user_profile_image?: string;
  likes?: number;
  liked_by_current_user?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  image_url,
  phrase,
  user_name,
  user_id,
  created_at,
  likes,
  comments,
  hashtags,
  // onDelete 제거
}) => {
  const processedHashtags = typeof hashtags === 'string'
    ? hashtags.split(',').map(tag => tag.trim())
    : Array.isArray(hashtags) ? hashtags : [];

  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const visibleHashtags = showAllHashtags
    ? processedHashtags
    : processedHashtags.slice(0, 5);

  const [currentNickname, setCurrentNickname] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes || 0);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const navigation = useNavigation();
  const [isLiking, setIsLiking] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [receiver, setReceiver] = useState<{ id: number; nickname: string; image_url?: string } | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLikeCount(likes);
  }, [likes]);

  useEffect(() => {
    if (showCommentsModal) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.exp), useNativeDriver: true, }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true, }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      opacityAnim.setValue(0);
    }
  }, [showCommentsModal]);

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 300, duration: 400, easing: Easing.in(Easing.exp), useNativeDriver: true, }),
      Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true, }),
    ]).start(() => setShowCommentsModal(false));
  };
  
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        const meRes = await axios.get('https://mycarering.loca.lt/users/me', { headers: { Authorization: `Bearer ${token}` } });
        setCurrentNickname(meRes.data.nickname);
        setCurrentUserId(meRes.data.id);
        
        const userRes = await axios.get(`https://mycarering.loca.lt/users/${user_id}`);
        const basicInfoRes = await axios.get(`https://mycarering.loca.lt/basic-info/${user_id}`);
        setReceiver({
          id: userRes.data.id,
          nickname: userRes.data.nickname,
          image_url: basicInfoRes.data.image_url,
        });

      } catch (e) {
        console.error('❌ 사용자 정보 로딩 실패:', e);
      }
    };

    fetchInitialData();
  }, [id, user_id]);
  
  const handleCommentPressIn = () => Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  const handleCommentPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 20, useNativeDriver: true }).start();

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.patch(`https://mycarering.loca.lt/posts/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('❌ Failed to update like', err);
      setLiked(prev => !prev);
      setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // 서버에 삭제 요청만 보냄. UI 업데이트는 WebSocket을 통해 이루어짐.
      await axios.delete(`https://mycarering.loca.lt/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Post deleted. The feed will update shortly.');
      // onDelete?.() 호출 제거
    } catch (err) {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const formatKoreanDateTime = (utcDateString?: string): string => {
    if (!utcDateString) return '';
    const date = new Date(utcDateString);
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // JSX 부분은 기존과 동일
  return (
    <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: user_id })}>
            <LinearGradient colors={['#7F7FD5', '#86A8E7', '#91EAE4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.userGradientRing}>
              <Image
                source={ receiver?.image_url ? { uri: `https://mycarering.loca.lt${receiver.image_url}` } : require('../../assets/user-icon.png') }
                style={styles.userIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user_name || 'Unknown'}</Text>
            <Text style={styles.userLocation}>Seoul</Text>
          </View>
          {currentUserId === user_id && (
            <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(!showMenu)}>
              <Text style={styles.moreText}>•••</Text>
            </TouchableOpacity>
          )}
          {showMenu && currentUserId === user_id && (
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('EditPost', { postId: id })}>
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={handleDelete}>
                <Text style={[styles.menuText, { color: '#e63946' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: id })} activeOpacity={0.9}>
          {phrase && <Text style={styles.postText}>{phrase}</Text>}
          {image_url && <Image source={{ uri: `https://mycarering.loca.lt${image_url}` }} style={styles.postImage} />}
        </TouchableOpacity>

        {processedHashtags.length > 0 && (
          <View style={styles.hashtagContainer}>
            <View style={styles.hashtagRow}>
              {visibleHashtags.map((tag, index) => <Text key={index} style={styles.hashtagText}>#{tag}</Text>)}
            </View>
            {processedHashtags.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllHashtags(prev => !prev)}>
                <Text style={styles.seeMoreHashtagText}>{showAllHashtags ? 'Hide hashtags' : 'See all hashtags'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {created_at && (<Text style={styles.createdAt}>{formatKoreanDateTime(created_at)}</Text>)}

        <View style={styles.reactionBar}>
          <TouchableOpacity style={styles.reactionItem} onPress={handleLike} disabled={isLiking}>
            <Image source={require('../../assets/heart.png')} style={[ styles.iconImage, { tintColor: liked ? '#e63946' : '#888', opacity: isLiking ? 0.5 : 1 }]} />
            <Text style={styles.reactionCount}>{likeCount}</Text>
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.reactionItem} onPress={() => setShowCommentsModal(true)} onPressIn={handleCommentPressIn} onPressOut={handleCommentPressOut} activeOpacity={0.9}>
              <Image source={require('../../assets/comment.png')} style={styles.iconImage} />
              <Text style={styles.reactionCount}>{comments?.length || 0}</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.reactionItem}>
            <Image source={require('../../assets/link.png')} style={styles.linkIcon} />
          </TouchableOpacity>
        </View>

        {comments && comments.length > 0 && (
          <View style={styles.commentsSection}>
            {(showAllComments ? comments.slice(0, 3) : comments.slice(0, 1)).map((comment) => (
              <View key={comment.id} style={styles.commentRow}>
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>
                    <Text style={[ styles.commentUserName, comment.user_id === currentUserId && styles.myCommentUserName ]}>
                      {comment.user_name}
                    </Text>{' '}{comment.content}
                  </Text>
                  <Text style={styles.createdAt}>{formatKoreanDateTime(comment.created_at)}</Text>
                </View>
                <TouchableOpacity style={styles.commentLikeButton} disabled={comment.liked_by_current_user}>
                  <Image source={require('../../assets/heart.png')} style={[ styles.commentLikeIcon, { tintColor: comment.liked_by_current_user ? '#e63946' : '#ccc' }]} />
                  <Text style={styles.commentLikeCount}>{comment.likes || 0}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {comments.length > 2 && (
              <TouchableOpacity onPress={() => setShowAllComments((prev) => !prev)}>
                <Text style={styles.seeMoreCommentsText}>{showAllComments ? 'Hide comments' : `See comments`}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {showCommentsModal && (
          <Modal animationType="none" transparent visible={showCommentsModal} onRequestClose={handleCloseModal}>
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <Animated.View style={[ styles.bottomSheet, { transform: [{ translateY: slideAnim }], opacity: opacityAnim, }]}>
              <MessageDetail postId={id} showCommentsOnly={true} />
            </Animated.View>
          </Modal>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 0,
    paddingVertical: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
    userGradientRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#212121',
  },
  userLocation: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  moreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#BDBDBD',
  },
  menuBox: {
    position: 'absolute',
    top: 55,
    right: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10,
  },
  menuButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 15,
    color: '#333333',
  },
  postText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createdAt: {
    fontSize: 11,
    color: '#9E9E9E',
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  postImage: {
    width: '100%',
    height: 450,
    resizeMode: 'cover',
    marginTop: 8,
  },
  hashtagContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  hashtagText: {
    color: '#4387E5',
    fontSize: 13,
    marginRight: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  seeMoreHashtagText: {
    color: '#42A5F5',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
    paddingHorizontal: 16,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  iconImage: {
    width: 22,
    height: 22,
    marginRight: 6,
    tintColor: '#616161',
  },
  linkIcon: {
    width: 22,
    height: 22,
    marginRight: 6,
    tintColor: '#616161',
    transform: [{ rotate: '-45deg' }],
  },
  reactionCount: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingTop: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    paddingVertical: 0,
  },
  commentContent: {
    flex: 1,
    marginRight: 10,
  },
  commentText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  commentUserName: {
    fontWeight: '600',
    color: '#212121',
  },
  myCommentUserName: {
    color: '#4387E5',
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  commentLikeIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  commentLikeCount: {
    fontSize: 12,
    color: '#757575',
  },
  seeMoreCommentsText: {
    color: '#4387E5',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    height: '65%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  postTimestamp: {
    fontSize: 11,
    color: '#BDBDBD',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
});

export default PostCard;