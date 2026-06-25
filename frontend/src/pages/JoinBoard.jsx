import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function JoinBoard() {
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('joining'); // joining, success, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No invite token provided.');
      return;
    }

    const joinBoard = async () => {
      try {
        await apiClient.post(`/boards/${boardId}/join?token=${token}`);
        setStatus('success');
        // Redirect to board after brief delay
        setTimeout(() => {
          navigate(`/b/${boardId}`);
        }, 1500);
      } catch (error) {
        setStatus('error');
        setErrorMsg(error.response?.data?.detail || 'Failed to join the board. The link may be invalid or expired.');
      }
    };

    joinBoard();
  }, [boardId, token, navigate]);

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-background p-4">
      <div className="bg-surface border border-surfaceHover rounded-xl p-8 max-w-md w-full text-center shadow-xl">
        {status === 'joining' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-white">Joining Board...</h2>
            <p className="text-slate-400 mt-2">Please wait while we add you to the workspace.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-white">Successfully Joined!</h2>
            <p className="text-slate-400 mt-2">Redirecting you to the board...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Invite Failed</h2>
            <p className="text-slate-400 mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
