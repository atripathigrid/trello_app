import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { Plus, Layout, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [creating, setCreating] = useState(false);
  
  const navigate = useNavigate();

  const fetchBoards = async () => {
    try {
      const response = await apiClient.get('/boards');
      setBoards(response.data);
    } catch (error) {
      console.error('Failed to fetch boards', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    
    setCreating(true);
    try {
      const response = await apiClient.post('/boards', {
        name: newBoardName,
        description: newBoardDesc
      });
      setBoards([...boards, response.data]);
      setIsModalOpen(false);
      setNewBoardName('');
      setNewBoardDesc('');
    } catch (error) {
      console.error('Failed to create board', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layout className="w-6 h-6 text-primary-400" />
          Your Workspaces
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="bg-surface border border-surfaceHover rounded-xl p-12 text-center">
          <div className="bg-surfaceHover w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layout className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No boards yet</h3>
          <p className="text-slate-400 mb-6">Create your first board to start organizing your projects.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create new board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards.map(board => (
            <div 
              key={board.id}
              onClick={() => navigate(`/b/${board.id}`)}
              className="bg-surface hover:bg-surfaceHover border border-surfaceHover rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-primary-500/10 group"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors">{board.name}</h3>
              {board.description && (
                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{board.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-surfaceHover rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create New Board</h3>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Board Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-background border border-surfaceHover rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Marketing Campaign"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full bg-background border border-surfaceHover rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-24 resize-none"
                  placeholder="What is this board for?"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-surfaceHover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBoardName.trim()}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
