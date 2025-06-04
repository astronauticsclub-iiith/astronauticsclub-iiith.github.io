'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Edit, Trash2, Eye, Heart, Upload, Settings, Plus, FileText } from 'lucide-react';
import Image from 'next/image';
import ProfileEditor from '@/components/features/ProfileEditor';
import ImageUploader from '@/components/features/ImageUploader';
import BlogPreview from '@/components/features/BlogPreview';
import CustomAlert from '@/components/ui/CustomAlert';
import CustomConfirm from '@/components/ui/CustomConfirm';
import { useAlert } from '@/hooks/useAlert';
import "@/components/ui/bg-patterns.css";

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
}

interface Blog {
  _id: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  readTime: number;
  tags: string[];
  images: string[];
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  roles: string[];
}

interface BlogStats {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
}

interface NewBlog {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  readTime: number;
  images?: string[];
}

export default function BlogAuthorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats>({ totalBlogs: 0, totalViews: 0, totalLikes: 0 });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'write' | 'edit'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [newBlog, setNewBlog] = useState<NewBlog>({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    readTime: 5,
    images: []
  });
  const { 
    showSuccess, showError, showConfirm, 
    closeAlert, closeConfirm, handleConfirm, alertState, confirmState 
  } = useAlert();

  useEffect(() => {
    if (status === 'loading') return;
    
    const user = session?.user as ExtendedUser;
    const userRoles = user?.roles || [];
    if (!userRoles.some(role => ['admin', 'writer'].includes(role))) {
      router.push('/stay-away-snooper');
      return;
    }

    fetchMyBlogs();
    fetchUserProfile();
  }, [session, status, router]);

  const fetchMyBlogs = async () => {
    try {
      const response = await fetch('/api/my-blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const publishBlog = async () => {
    if (!newBlog.title || !newBlog.content || !newBlog.excerpt) {
      showError('Please fill in all required fields');
      return;
    }

    if (!newBlog.images || newBlog.images.length === 0) {
      showError('Please upload at least one image for your blog');
      return;
    }

    const slug = createSlug(newBlog.title);
    const blogData = {
      id: `blog-${Date.now()}`,
      title: newBlog.title,
      slug,
      excerpt: newBlog.excerpt,
      content: newBlog.content,
      author: {
        email: session?.user?.email || '',
      },
      publishedAt: new Date().toISOString(),
      readTime: newBlog.readTime,
      tags: newBlog.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      images: newBlog.images || []
    };

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });


      if (response.ok) {
        setNewBlog({
          title: '',
          excerpt: '',
          content: '',
          tags: '',
          readTime: 5,
          images: []
        });
        setActiveTab('dashboard');
        fetchMyBlogs();
        showSuccess('Blog published successfully!');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to publish blog');
      }
    } catch (error) {
      console.error('Error publishing blog:', error);
      showError('Failed to publish blog');
    }
  };

  const deleteBlog = async (slug: string) => {
    showConfirm(
      'DELETE BLOG',
      'Are you sure you want to delete this blog? This action cannot be undone.',
      () => performDeleteBlog(slug),
      { type: 'danger', confirmText: 'DELETE BLOG' }
    );
  };

  const performDeleteBlog = async (slug: string) => {
    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMyBlogs();
        showSuccess('Blog deleted successfully');
      } else {
        showError('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showError('Failed to delete blog');
    }
  };

  const updateBlog = async () => {
    if (!editingBlog || !editingBlog.title || !editingBlog.content || !editingBlog.excerpt) {
      showError('Please fill in all required fields');
      return;
    }

    if (!editingBlog.images || editingBlog.images.length === 0) {
      showError('Please upload at least one image for your blog');
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${editingBlog.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingBlog.title,
          excerpt: editingBlog.excerpt,
          content: editingBlog.content,
          tags: editingBlog.tags,
          readTime: editingBlog.readTime,
          images: editingBlog.images
        })
      });


      if (response.ok) {
        setEditingBlog(null);
        setActiveTab('dashboard');
        fetchMyBlogs();
        showSuccess('Blog updated successfully!');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      showError('Failed to update blog');
    }
  };

  const addImageToBlog = (imagePath: string) => {
    if (activeTab === 'write') {
      const currentImages = newBlog.images || [];
      const updatedImages = currentImages.includes(imagePath) 
        ? currentImages 
        : [...currentImages, imagePath];
      
      setNewBlog({ 
        ...newBlog, 
        images: updatedImages
      });
    } else if (editingBlog) {
      const currentImages = editingBlog.images || [];
      const updatedImages = currentImages.includes(imagePath) 
        ? currentImages 
        : [...currentImages, imagePath];
      
      setEditingBlog({ 
        ...editingBlog, 
        images: updatedImages
      });
    }
    setShowImageUploader(false);
  };

  const removeImageFromBlog = (imagePath: string) => {
    if (activeTab === 'write') {
      const updatedImages = newBlog.images?.filter(img => img !== imagePath) || [];
      setNewBlog({ 
        ...newBlog, 
        images: updatedImages
      });
    } else if (editingBlog) {
      const updatedImages = editingBlog.images?.filter(img => img !== imagePath) || [];
      setEditingBlog({ 
        ...editingBlog, 
        images: updatedImages
      });
    }
  };

  const insertImageReference = (imagePath: string) => {
    const imageMarkdown = `\n![Image](${imagePath})\n`;
    if (activeTab === 'write') {
      setNewBlog({ 
        ...newBlog, 
        content: newBlog.content + imageMarkdown
      });
    } else if (editingBlog) {
      setEditingBlog({ 
        ...editingBlog, 
        content: editingBlog.content + imageMarkdown
      });
    }
  };

  const copyImageUrl = (imagePath: string) => {
    navigator.clipboard.writeText(imagePath);
    showSuccess('Image URL copied to clipboard!');
  };

  const UploadedImagesPanel = () => {
    const currentImages = activeTab === 'write' ? (newBlog.images || []) : (editingBlog?.images || []);
    
    return (
      <div className="border-2 border-white bg-background p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold uppercase">BLOG IMAGES ({currentImages.length})</h3>
          <button 
            onClick={() => setShowImageUploader(true)} 
            className="px-3 py-2 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-colors uppercase text-sm flex items-center gap-2"
          >
            <Upload size={16} />
            ADD IMAGE
          </button>
        </div>
        
        {currentImages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#e0e0e0] font-bold uppercase">NO IMAGES UPLOADED YET</p>
            <p className="text-[#e0e0e0] text-sm mt-2">AT LEAST ONE IMAGE IS REQUIRED FOR PUBLISHING</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentImages.map((imagePath, index) => (
              <div key={index} className="border-2 border-white bg-background p-3">
                <div className="aspect-video relative border-2 border-white overflow-hidden mb-3">
                  <Image
                    src={imagePath}
                    alt={`Blog image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-white text-xs font-bold truncate">
                    {imagePath.split('/').pop()}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => insertImageReference(imagePath)}
                      className="px-2 py-1 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-colors text-xs uppercase"
                      title="Insert into content"
                    >
                      INSERT
                    </button>
                    <button
                      onClick={() => copyImageUrl(imagePath)}
                      className="px-2 py-1 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors text-xs uppercase"
                      title="Copy URL"
                    >
                      COPY
                    </button>
                    <button
                      onClick={() => removeImageFromBlog(imagePath)}
                      className="px-2 py-1 border-2 border-white bg-[#d2042d] text-white font-bold hover:bg-white hover:text-[#d2042d] transition-colors text-xs uppercase"
                      title="Remove from blog"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-2xl font-bold uppercase">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-pattern-wiggle pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-white leading-tight">
            WRITER DASHBOARD
          </h1>
          <div className="h-1 bg-white w-32 mb-6"></div>
          
          {/* Profile Info */}
          {userProfile && (
            <div className="border-4 border-white p-6 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-white overflow-hidden bg-white">
                    {userProfile.avatar ? (
                      <Image
                        src={userProfile.avatar}
                        alt={userProfile.name || 'Profile'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-background flex items-center justify-center">
                        <User className="text-white" size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white uppercase">
                      {userProfile.name || 'ANONYMOUS WRITER'}
                    </h3>
                    <p className="text-[#e0e0e0] font-medium">{userProfile.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEditor(true)}
                  className="px-4 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors cursor-close flex items-center gap-2 uppercase"
                >
                  <Settings size={16} />
                  EDIT PROFILE
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full sm:w-auto px-4 sm:px-6 py-3 border-2 border-white font-bold transition-colors uppercase ${
                activeTab === 'dashboard'
                  ? 'bg-white text-background'
                  : 'text-white hover:bg-white hover:text-background'
              }`}
            >
              <FileText className="inline mr-2" size={16} />
              DASHBOARD
            </button>
            <button
              onClick={() => setActiveTab('write')}
              className={`w-full sm:w-auto px-4 sm:px-6 py-3 border-2 border-white font-bold transition-colors uppercase ${
                activeTab === 'write'
                  ? 'bg-white text-background'
                  : 'text-white hover:bg-white hover:text-background'
              }`}
            >
              <Plus className="inline mr-2" size={16} />
              WRITE NEW
            </button>
          </div>
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-4 border-white p-6 backdrop-blur-sm text-center">
                <h3 className="text-3xl font-bold text-white mb-2">{stats.totalBlogs}</h3>
                <p className="text-[#e0e0e0] font-bold uppercase">TOTAL BLOGS</p>
              </div>
              <div className="border-4 border-white p-6 backdrop-blur-sm text-center">
                <h3 className="text-3xl font-bold text-white mb-2">{formatCount(stats.totalViews)}</h3>
                <p className="text-[#e0e0e0] font-bold uppercase">TOTAL VIEWS</p>
              </div>
              <div className="border-4 border-white p-6 backdrop-blur-sm text-center">
                <h3 className="text-3xl font-bold text-white mb-2">{formatCount(stats.totalLikes)}</h3>
                <p className="text-[#e0e0e0] font-bold uppercase">TOTAL LIKES</p>
              </div>
            </div>

            {/* Blogs List */}
            <div className="border-4 border-white p-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-white uppercase">YOUR BLOGS</h2>
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-2 border-white p-4 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start"
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white uppercase mb-2">{blog.title}</h3>
                      <p className="text-[#e0e0e0] font-medium mb-3">{blog.excerpt}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white text-background font-bold text-xs uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex space-x-6 text-sm text-[#e0e0e0] font-medium">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {formatCount(blog.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {formatCount(blog.likes)}
                        </span>
                        <span>{new Date(blog.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mt-4 sm:mt-0 sm:ml-4">
                      <button
                        onClick={() => {
                          setEditingBlog(blog);
                          setActiveTab('edit');
                        }}
                        className="px-3 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors uppercase text-sm flex items-center justify-center gap-1"
                      >
                        <Edit size={14} />
                        EDIT
                      </button>
                      <button
                        onClick={() => deleteBlog(blog.slug)}
                        className="px-3 py-2 border-2 border-white bg-[#d2042d] text-white font-bold hover:bg-white hover:text-[#d2042d] transition-colors uppercase text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        DELETE
                      </button>
                    </div>
                  </motion.div>
                ))}
                {blogs.length === 0 && (
                  <div className="text-[#e0e0e0] text-center py-8 font-bold uppercase">
                    NO BLOGS YET. START WRITING YOUR FIRST BLOG!
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Write/Edit Tab */}
        {(activeTab === 'write' || activeTab === 'edit') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase">
                {activeTab === 'write' ? 'WRITE NEW BLOG' : 'EDIT BLOG'}
              </h2>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className="w-full sm:w-auto px-4 py-2 border-2 border-white text-white font-bold hover:bg-white hover:text-background transition-colors uppercase"
                >
                  {isPreview ? 'EDIT' : 'PREVIEW'}
                </button>
                <button
                  onClick={activeTab === 'write' ? publishBlog : updateBlog}
                  className="w-full sm:w-auto px-4 py-2 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-colors uppercase"
                >
                  {activeTab === 'write' ? 'PUBLISH' : 'UPDATE'}
                </button>
              </div>
            </div>

            {!isPreview ? (
              <div className="border-4 border-white p-6 backdrop-blur-sm space-y-4">
                <input
                  type="text"
                  placeholder="BLOG TITLE"
                  value={activeTab === 'write' ? newBlog.title : editingBlog?.title || ''}
                  onChange={(e) => 
                    activeTab === 'write' 
                      ? setNewBlog({ ...newBlog, title: e.target.value })
                      : setEditingBlog(editingBlog ? { ...editingBlog, title: e.target.value } : null)
                  }
                  className="w-full bg-background border-2 border-white p-4 text-white text-xl font-bold placeholder-[#666] uppercase"
                />

                <textarea
                  placeholder="BLOG EXCERPT"
                  value={activeTab === 'write' ? newBlog.excerpt : editingBlog?.excerpt || ''}
                  onChange={(e) => 
                    activeTab === 'write' 
                      ? setNewBlog({ ...newBlog, excerpt: e.target.value })
                      : setEditingBlog(editingBlog ? { ...editingBlog, excerpt: e.target.value } : null)
                  }
                  className="w-full bg-background border-2 border-white p-4 text-white h-24 font-medium placeholder-[#666]"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="TAGS (COMMA SEPARATED)"
                    value={activeTab === 'write' ? newBlog.tags : editingBlog?.tags.join(', ') || ''}
                    onChange={(e) => 
                      activeTab === 'write' 
                        ? setNewBlog({ ...newBlog, tags: e.target.value })
                        : setEditingBlog(editingBlog ? { ...editingBlog, tags: e.target.value.split(',').map(t => t.trim()) } : null)
                    }
                    className="bg-background border-2 border-white p-4 text-white font-medium placeholder-[#666]"
                  />
                  <input
                    type="number"
                    placeholder="READ TIME (MINUTES)"
                    value={activeTab === 'write' ? newBlog.readTime : editingBlog?.readTime || ''}
                    onChange={(e) => 
                      activeTab === 'write' 
                        ? setNewBlog({ ...newBlog, readTime: parseInt(e.target.value) || 5 })
                        : setEditingBlog(editingBlog ? { ...editingBlog, readTime: parseInt(e.target.value) || 5 } : null)
                    }
                    className="bg-background border-2 border-white p-4 text-white font-medium placeholder-[#666]"
                  />
                </div>

                <UploadedImagesPanel />

                <textarea
                  placeholder="WRITE YOUR BLOG CONTENT IN MARKDOWN..."
                  value={activeTab === 'write' ? newBlog.content : editingBlog?.content || ''}
                  onChange={(e) => 
                    activeTab === 'write' 
                      ? setNewBlog({ ...newBlog, content: e.target.value })
                      : setEditingBlog(editingBlog ? { ...editingBlog, content: e.target.value } : null)
                  }
                  className="w-full bg-background border-2 border-white p-4 text-white h-96 font-mono placeholder-[#666]"
                />
              </div>
            ) : (
              <BlogPreview
                title={activeTab === 'write' ? newBlog.title : editingBlog?.title || ''}
                excerpt={activeTab === 'write' ? newBlog.excerpt : editingBlog?.excerpt || ''}
                content={activeTab === 'write' ? newBlog.content : editingBlog?.content || ''}
                tags={activeTab === 'write' 
                  ? newBlog.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                  : editingBlog?.tags || []
                }
                readTime={activeTab === 'write' ? newBlog.readTime : editingBlog?.readTime || 5}
                author={{
                  name: userProfile?.name || session?.user?.name || 'Anonymous',
                  email: session?.user?.email || '',
                  avatar: userProfile?.avatar,
                  bio: userProfile?.bio || 'Blog Author'
                }}
                images={editingBlog?.images || []}
              />
            )}
          </motion.div>
        )}

        {/* Profile Editor Modal */}
        {showProfileEditor && userProfile && (
          <ProfileEditor
            user={userProfile}
            onProfileUpdate={(updatedUser) => {
              setUserProfile(updatedUser);
              fetchUserProfile();
            }}
            onClose={() => setShowProfileEditor(false)}
          />
        )}

        {/* Image Uploader Modal */}
        {showImageUploader && (
          <ImageUploader
            onImageUpload={addImageToBlog}
            onClose={() => setShowImageUploader(false)}
          />
        )}

        {/* Custom Alert */}
        <CustomAlert
          isOpen={alertState.isOpen}
          message={alertState.message}
          type={alertState.type}
          onClose={closeAlert}
        />

        {/* Custom Confirm */}
        <CustomConfirm
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          onConfirm={handleConfirm}
          onCancel={closeConfirm}
        />
      </div>
    </div>
  );
}