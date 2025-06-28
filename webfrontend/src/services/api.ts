const API_BASE_URL = 'http://localhost:51235';

// API 클라이언트 설정
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  private getFormHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  async requestForm<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: 'POST',
      headers: this.getFormHeaders(),
      body: formData,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(nickname: string, email: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify({ nickname, email, password }),
    });
  }

  // User APIs
  async getCurrentUser() {
    return this.request<any>('/users/me');
  }

  async getUserById(userId: number) {
    return this.request<any>(`/users/${userId}`);
  }

  async updateUserAbout(about: string) {
    return this.request<any>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ about }),
    });
  }

  // Basic Info APIs
  async getBasicInfo() {
    return this.request<any>('/basic-info/me');
  }

  async getBasicInfoByUserId(userId: number) {
    return this.request<any>(`/basic-info/${userId}`);
  }

  async updateBasicInfo(formData: FormData) {
    return this.requestForm<any>('/basic-info', formData);
  }

  // Lifestyle APIs
  async getMyLifestyle() {
    return this.request<any>('/lifestyle/me');
  }

  async getLifestyleByUserId(userId: number) {
    return this.request<any>(`/lifestyle/${userId}`);
  }

  async saveLifestyle(lifestyleData: any) {
    return this.request<any>('/lifestyle', {
      method: 'POST',
      body: JSON.stringify(lifestyleData),
    });
  }

  // Post APIs
  async getPosts() {
    return this.request<any[]>('/posts');
  }

  async getMyPosts() {
    return this.request<any[]>('/posts/me');
  }

  async getPostsByUserId(userId: number) {
    return this.request<any[]>(`/posts/user/${userId}`);
  }

  async createPost(formData: FormData) {
    return this.requestForm<any>('/posts', formData);
  }

  async likePost(postId: number) {
    return this.request<any>(`/posts/${postId}/like`, {
      method: 'PATCH',
    });
  }

  async addComment(postId: number, content: string) {
    return this.request<any>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async deletePost(postId: number) {
    return this.request<any>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Follow APIs
  async getFollowData(userId?: number) {
    const endpoint = userId ? `/follow/${userId}` : '/follow/me';
    return this.request<any>(endpoint);
  }

  async toggleFollow(userId: number) {
    return this.request<any>(`/follow/${userId}`, {
      method: 'POST',
    });
  }

  // Message APIs
  async getMessageUsers() {
    return this.request<any[]>('/messages/users');
  }

  async sendMessage(receiverId: number, content: string) {
    return this.request<any>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, content }),
    });
  }

  async getConversationMessages(otherUserId: number) {
    return this.request<any[]>(`/messages/chat/${otherUserId}`);
  }

  async markMessagesAsRead(senderId: number) {
    return this.request<any>(`/messages/read/${senderId}`, {
      method: 'PATCH',
    });
  }

  // Mood APIs
  async getMoodStories() {
    return this.request<any[]>('/mood/stories');
  }

  async createMood(formData: FormData) {
    return this.requestForm<any>('/mood', formData);
  }

  // Profile Customization APIs
  async saveProfileCustomization(customizationData: any) {
    return this.request<any>('/profile/customization', {
      method: 'POST',
      body: JSON.stringify(customizationData),
    });
  }

  async getProfileCustomization(userId?: number) {
    const endpoint = userId ? `/profile/customization/${userId}` : '/profile/customization/me';
    return this.request<any>(endpoint);
  }

  async updateWidgetLayout(widgets: any[]) {
    return this.request<any>('/profile/widgets', {
      method: 'PUT',
      body: JSON.stringify(widgets),
    });
  }

  async resetProfileCustomization() {
    return this.request<any>('/profile/customization', {
      method: 'DELETE',
    });
  }

  async uploadBackgroundImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.requestForm<any>('/profile/background/upload', formData);
  }

  // Widget Layout APIs
  async saveWidgetLayout(widgets: any[]) {
    return this.request<any>('/widgets/layout', {
      method: 'POST',
      body: JSON.stringify({ widgets }),
    });
  }

  async getWidgetLayout(userId?: number) {
    const endpoint = userId ? `/widgets/layout/${userId}` : '/widgets/layout/me';
    return this.request<any>(endpoint);
  }

  // Upload APIs
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.requestForm<any>('/upload/image', formData);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);