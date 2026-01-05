import { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Bookmark,
  Camera,
  Flame,
  CheckCircle,
  Trophy,
  Star,
  Calendar,
  Target,
  Zap,
  X,
  Send
} from 'lucide-react';
import '../styles/Community.css';

const Community = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'workout',
      user: {
        name: "운동하는개발자",
        username: "fit_developer",
        avatar: null,
        badge: "🏋️"
      },
      title: "오운완! 🔥",
      content: "오늘도 하체 데이 완료했습니다. 스쿼트 5세트 데드리프트 3세트!",
      image: "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Workout",
      likes: 124,
      comments: 18,
      category: "운동 인증",
      isHot: true,
      commentList: []
    },
    {
      id: 2,
      type: 'diet',
      user: {
        name: "헬시푸드",
        username: "healthy_food",
        avatar: null,
        badge: "🥗"
      },
      title: "다이어트 식단 추천",
      content: "저칼로리 고단백 닭가슴살 샐러드 레시피 공유합니다!",
      image: "https://via.placeholder.com/400x500/ec4899/ffffff?text=Diet",
      likes: 89,
      comments: 12,
      category: "식단",
      commentList: []
    },
    {
      id: 3,
      type: 'qna',
      user: {
        name: "초보헬린이",
        username: "beginner_gym",
        avatar: null
      },
      title: "초보자 루틴 질문입니다",
      content: "헬스 시작한지 2주차인데요, 어떤 순서로 운동하는게 좋을까요?",
      image: null,
      likes: 45,
      comments: 28,
      category: "질문",
      commentList: []
    },
    {
      id: 4,
      type: 'routine',
      user: {
        name: "PT트레이너",
        username: "pt_trainer",
        avatar: null,
        badge: "👑"
      },
      title: "상체 루틴 공유",
      content: "가슴+삼두 루틴입니다. 초중급자 추천드려요!",
      image: "https://via.placeholder.com/400x400/a78bfa/ffffff?text=Routine",
      likes: 203,
      comments: 34,
      category: "루틴 공유",
      isHot: true,
      commentList: []
    },
    {
      id: 5,
      type: 'free',
      user: {
        name: "운동러버",
        username: "workout_lover",
        avatar: null,
        badge: "🔥"
      },
      title: "운동 3개월 변화",
      content: "꾸준히 하니까 정말 달라지네요! 여러분도 포기하지 마세요!",
      image: "https://via.placeholder.com/400x600/f472b6/ffffff?text=Progress",
      likes: 567,
      comments: 89,
      category: "자유",
      isHot: true,
      commentList: []
    },
    {
      id: 6,
      type: 'workout',
      user: {
        name: "아침운동",
        username: "morning_workout",
        avatar: null
      },
      title: "새벽 러닝 완료",
      content: "오늘 10km 달렸어요! 날씨 좋아서 기분 최고 🏃‍♂️",
      image: "https://via.placeholder.com/400x350/60a5fa/ffffff?text=Running",
      likes: 156,
      comments: 23,
      category: "운동 인증",
      commentList: []
    }
  ]);

  // 사용자 데이터
  const userData = {
    streak: 7,
    todayWorkouts: 2,
    totalPoints: 1240,
    badges: [
      { id: 1, name: "루틴 마스터", icon: "🏋️", unlocked: true },
      { id: 2, name: "식단 왕초보 탈출", icon: "🥗", unlocked: true },
      { id: 3, name: "7일 연속 출석", icon: "🔥", unlocked: true },
      { id: 4, name: "커뮤니티 리더", icon: "👑", unlocked: false }
    ]
  };

  // 오늘 운동 인증 현황
  const todayStats = {
    totalCheckins: 1247,
    trendingWorkouts: ['스쿼트', '벤치프레스', '데드리프트']
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
  };

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCreatePost = () => {
    if (newPost.title && newPost.content) {
      const post = {
        id: Date.now(),
        type: 'free',
        user: {
          name: "나",
          username: "me",
          avatar: null,
          badge: "🔥"
        },
        title: newPost.title,
        content: newPost.content,
        image: null,
        likes: 0,
        comments: 0,
        category: "자유",
        isHot: false,
        commentList: []
      };
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowCreatePost(false);
    }
  };

  const handleAddComment = (postId) => {
    if (newComment.trim()) {
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments + 1,
            commentList: [...(post.commentList || []), {
              id: Date.now(),
              user: "나",
              content: newComment,
              time: "방금"
            }]
          };
        }
        return post;
      }));
      setNewComment('');
    }
  };

  return (
    <div className="community-dashboard" style={{ gridTemplateColumns: '1fr 320px' }}>
      {/* Main Feed - 왼쪽 */}
      <main className="community-main">
        <div className="feed-header">
          <div>
            <h2 className="feed-title">커뮤니티</h2>
            <p className="feed-subtitle">함께 성장하는 피트니스 여정 🚀</p>
          </div>
          <button className="btn-create-post" onClick={() => setShowCreatePost(true)}>
            <Camera size={18} />
            게시글 작성
          </button>
        </div>

        {/* 실시간 활동 배너 */}
        <div className="activity-banner">
          <Zap size={20} className="zap-icon" />
          <span className="activity-text">
            지금 <strong>{todayStats.totalCheckins}명</strong>이 운동 중! 
            🔥 인기: {todayStats.trendingWorkouts.join(', ')}
          </span>
        </div>

        <div className="masonry-grid">
          {posts.map(post => (
            <div key={post.id} className="post-card-pinterest">
              {post.isHot && (
                <div className="hot-badge">
                  <Flame size={14} />
                  HOT
                </div>
              )}
              
              {post.image && (
                <div className="card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="category-badge">{post.category}</div>
                </div>
              )}
              
              <div className="card-content">
                <div className="card-user">
                  <div className="user-avatar-small">
                    {post.user.avatar ? (
                      <img src={post.user.avatar} alt={post.user.name} />
                    ) : (
                      <span>{post.user.name[0]}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name-row">
                      <span className="user-name-small">{post.user.name}</span>
                      {post.user.badge && <span className="user-badge">{post.user.badge}</span>}
                    </div>
                  </div>
                </div>

                <h3 className="card-title">{post.title}</h3>
                <p className="card-text">{post.content}</p>

                <div className="card-actions">
                  <button 
                    className={`card-action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart size={16} fill={likedPosts.has(post.id) ? '#ec4899' : 'none'} />
                    <span>{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                  </button>
                  <button className="card-action-btn" onClick={() => setShowComments(post.id)}>
                    <MessageCircle size={16} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="card-action-btn ml-auto">
                    <Bookmark size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="community-right-sidebar">
        {/* 출석 체크 카드 */}
        <div className="sidebar-section">
          <div className="checkin-card">
            <div className="checkin-header">
              <Calendar size={20} className="checkin-icon" />
              <h3 className="checkin-title">출석 체크</h3>
            </div>
            
            <div className="streak-display">
              <Flame size={32} className="flame-icon" />
              <div>
                <div className="streak-number">{userData.streak}일 연속</div>
                <div className="streak-label">운동 인증</div>
              </div>
            </div>

            {!checkedIn ? (
              <button className="checkin-btn" onClick={handleCheckIn}>
                <CheckCircle size={18} />
                오늘 운동 인증하기
              </button>
            ) : (
              <div className="checked-in-badge">
                <CheckCircle size={18} />
                오늘 인증 완료! 🎉
              </div>
            )}

            <div className="today-stats">
              <div className="stat-item">
                <Target size={16} className="stat-icon" />
                <span className="stat-text">오늘 {todayStats.totalCheckins}명 인증</span>
              </div>
            </div>
          </div>
        </div>

        {/* 내 활동 요약 */}
        <div className="sidebar-section">
          <h3 className="sidebar-title">내 활동</h3>
          <div className="my-activity-card">
            <div className="activity-row">
              <Trophy size={18} className="activity-icon trophy" />
              <div className="activity-info">
                <span className="activity-label">포인트</span>
                <span className="activity-value">{userData.totalPoints}P</span>
              </div>
            </div>
            <div className="activity-row">
              <Flame size={18} className="activity-icon flame" />
              <div className="activity-info">
                <span className="activity-label">연속 출석</span>
                <span className="activity-value">{userData.streak}일</span>
              </div>
            </div>
            <div className="activity-row">
              <Star size={18} className="activity-icon star" />
              <div className="activity-info">
                <span className="activity-label">획득 배지</span>
                <span className="activity-value">{userData.badges.filter(b => b.unlocked).length}개</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 게시글 작성 모달 */}
      {showCreatePost && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setShowCreatePost(false)}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            animation: 'slideIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#fff',
                margin: 0
              }}>게시글 작성</h3>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '0.5rem',
                transition: 'color 0.2s'
              }} onClick={() => setShowCreatePost(false)}>
                <X size={24} />
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem'
                }}
                placeholder="제목"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <textarea
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '0.875rem 1rem',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              />
            </div>
            <button style={{
              width: '100%',
              padding: '0.875rem',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }} onClick={handleCreatePost}>
              작성하기
            </button>
          </div>
        </div>
      )}

      {/* 댓글 모달 */}
      {showComments && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }} onClick={() => setShowComments(null)}>
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#fff',
                margin: 0
              }}>댓글</h3>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '0.5rem'
              }} onClick={() => setShowComments(null)}>
                <X size={24} />
              </button>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '1rem',
              paddingRight: '0.5rem'
            }}>
              {posts.find(p => p.id === showComments)?.commentList?.map(comment => (
                <div key={comment.id} style={{
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>{comment.user[0]}</div>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#d1d5db'
                    }}>{comment.user}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginLeft: 'auto'
                    }}>{comment.time}</span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#9ca3af',
                    lineHeight: '1.5',
                    margin: 0
                  }}>{comment.content}</p>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <input
                type="text"
                style={{
                  flex: 1,
                  padding: '0.875rem 1rem',
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9375rem'
                }}
                placeholder="댓글을 입력하세요"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(showComments)}
              />
              <button style={{
                padding: '0.875rem 1.25rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onClick={() => handleAddComment(showComments)}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;