import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { apiClient } from '../api/axios';
import { Loader2, Plus, MoreHorizontal, Trash2, Edit2, X, Check, UserPlus, Copy } from 'lucide-react';

export default function Board() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI State for adding
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [addingTicketTo, setAddingTicketTo] = useState(null);
  const [newTicketName, setNewTicketName] = useState('');

  // UI State for editing
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionName, setEditSectionName] = useState('');

  const [editingTicketId, setEditingTicketId] = useState(null);
  const [editTicketName, setEditTicketName] = useState('');

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBoard = async () => {
    try {
      const response = await apiClient.get(`/boards/${boardId}`);
      setBoard(response.data);
    } catch (error) {
      console.error('Failed to fetch board', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) fetchBoard();
  }, [boardId]);

  const handleDragEnd = async (result) => {
    if (!result.destination || !board) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceSectionIndex = board.sections.findIndex(s => s.id.toString() === source.droppableId);
    const destSectionIndex = board.sections.findIndex(s => s.id.toString() === destination.droppableId);

    if (sourceSectionIndex === -1 || destSectionIndex === -1) return;

    const sourceSection = board.sections[sourceSectionIndex];
    const destSection = board.sections[destSectionIndex];

    const newSourceTickets = Array.from(sourceSection.tickets);
    const newDestTickets = source.droppableId === destination.droppableId ? newSourceTickets : Array.from(destSection.tickets);

    const [movedTicket] = newSourceTickets.splice(source.index, 1);
    newDestTickets.splice(destination.index, 0, { ...movedTicket, section_id: parseInt(destination.droppableId) });

    const newSections = [...board.sections];
    newSections[sourceSectionIndex] = { ...sourceSection, tickets: newSourceTickets };
    if (source.droppableId !== destination.droppableId) {
      newSections[destSectionIndex] = { ...destSection, tickets: newDestTickets };
    }

    setBoard({ ...board, sections: newSections });

    try {
      if (source.droppableId !== destination.droppableId) {
        await apiClient.put(`/tickets/${draggableId}`, {
          section_id: parseInt(destination.droppableId)
        });
      }
    } catch (error) {
      console.error('Failed to move ticket on server', error);
      fetchBoard();
    }
  };

  // --- SECTION ACTIONS ---
  const handleAddSection = async () => {
    if (!newSectionName.trim() || !board) return;
    try {
      const res = await apiClient.post(`/boards/${board.id}/sections`, { name: newSectionName });
      setBoard({ ...board, sections: [...board.sections, { ...res.data, tickets: [] }] });
      setNewSectionName('');
      setAddingSection(false);
    } catch (error) {
      console.error('Failed to create section', error);
    }
  };

  const handleUpdateSection = async (sectionId) => {
    if (!editSectionName.trim() || !board) return;
    try {
      const res = await apiClient.put(`/sections/${sectionId}`, { name: editSectionName });
      const newSections = board.sections.map(s => s.id === sectionId ? { ...s, name: res.data.name } : s);
      setBoard({ ...board, sections: newSections });
      setEditingSectionId(null);
    } catch (error) {
      console.error('Failed to update section', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure you want to delete this section and all its tickets?')) return;
    try {
      await apiClient.delete(`/sections/${sectionId}`);
      setBoard({ ...board, sections: board.sections.filter(s => s.id !== sectionId) });
    } catch (error) {
      console.error('Failed to delete section', error);
    }
  };

  // --- TICKET ACTIONS ---
  const handleAddTicket = async (sectionId) => {
    if (!newTicketName.trim() || !board) return;
    try {
      const res = await apiClient.post(`/sections/${sectionId}/tickets`, { name: newTicketName });
      const newSections = board.sections.map(s => {
        if (s.id === sectionId) return { ...s, tickets: [...s.tickets, res.data] };
        return s;
      });
      setBoard({ ...board, sections: newSections });
      setNewTicketName('');
      setAddingTicketTo(null);
    } catch (error) {
      console.error('Failed to create ticket', error);
    }
  };

  const handleUpdateTicket = async (sectionId, ticketId) => {
    if (!editTicketName.trim() || !board) return;
    try {
      const res = await apiClient.put(`/tickets/${ticketId}`, { name: editTicketName });
      const newSections = board.sections.map(s => {
        if (s.id === sectionId) {
          return { ...s, tickets: s.tickets.map(t => t.id === ticketId ? { ...t, name: res.data.name } : t) };
        }
        return s;
      });
      setBoard({ ...board, sections: newSections });
      setEditingTicketId(null);
    } catch (error) {
      console.error('Failed to update ticket', error);
    }
  };

  const handleDeleteTicket = async (sectionId, ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await apiClient.delete(`/tickets/${ticketId}`);
      const newSections = board.sections.map(s => {
        if (s.id === sectionId) return { ...s, tickets: s.tickets.filter(t => t.id !== ticketId) };
        return s;
      });
      setBoard({ ...board, sections: newSections });
    } catch (error) {
      console.error('Failed to delete ticket', error);
    }
  };

  // --- INVITE LOGIC ---
  const handleGenerateInvite = async () => {
    setInviteModalOpen(true);
    setGeneratingInvite(true);
    setCopied(false);
    try {
      const res = await apiClient.post(`/boards/${boardId}/invites`);
      const link = `${window.location.origin}/b/${boardId}/join?token=${res.data.token_uuid}`;
      setInviteLink(link);
    } catch (error) {
      console.error('Failed to generate invite', error);
      setInviteLink('Failed to generate invite link.');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!board) {
    return <div className="p-6 text-white text-center">Board not found</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#111827]">
      <div className="px-6 py-4 border-b border-surfaceHover bg-surface/50 backdrop-blur shrink-0 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{board.name}</h1>
        <button
          onClick={handleGenerateInvite}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex items-start gap-6 h-full">
            {board.sections.map((section) => (
              <div key={section.id} className="bg-surface shrink-0 w-80 rounded-xl max-h-full flex flex-col border border-surfaceHover shadow-xl">

                {/* SECTION HEADER */}
                <div className="p-4 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing group">
                  {editingSectionId === section.id ? (
                    <div className="flex w-full items-center gap-2">
                      <input
                        autoFocus
                        value={editSectionName}
                        onChange={(e) => setEditSectionName(e.target.value)}
                        className="bg-background border border-primary-500 rounded px-2 py-1 text-sm text-white w-full focus:outline-none"
                      />
                      <button onClick={() => handleUpdateSection(section.id)} className="text-green-400 hover:text-green-300">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingSectionId(null)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-white truncate pr-2">{section.name}</h3>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingSectionId(section.id); setEditSectionName(section.name); }}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-surfaceHover transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-surfaceHover transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* DROPPABLE AREA */}
                <Droppable droppableId={section.id.toString()}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto px-3 min-h-[10px] transition-colors ${snapshot.isDraggingOver ? 'bg-surfaceHover/30' : ''}`}
                    >
                      {section.tickets.map((ticket, index) => (
                        <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[#263248] border border-surfaceHover p-3 rounded-lg mb-3 group/ticket transition-shadow ${snapshot.isDragging ? 'shadow-2xl shadow-primary-500/20 rotate-2' : 'shadow-md hover:border-slate-500'}`}
                            >
                              {editingTicketId === ticket.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    autoFocus
                                    value={editTicketName}
                                    onChange={(e) => setEditTicketName(e.target.value)}
                                    className="w-full bg-background border border-primary-500 rounded p-2 text-sm text-white focus:outline-none resize-none"
                                    rows={2}
                                  />
                                  <div className="flex items-center gap-2 justify-end">
                                    <button onClick={() => handleUpdateTicket(section.id, ticket.id)} className="bg-green-600 hover:bg-green-500 text-white p-1 rounded">
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingTicketId(null)} className="bg-red-600 hover:bg-red-500 text-white p-1 rounded">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-sm text-slate-200 whitespace-pre-wrap break-words w-full">{ticket.name}</p>
                                  <div className="flex flex-col gap-1 opacity-0 group-hover/ticket:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => { setEditingTicketId(ticket.id); setEditTicketName(ticket.name); }}
                                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-surfaceHover"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTicket(section.id, ticket.id)}
                                      className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-surfaceHover"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* ADD TICKET FOOTER */}
                <div className="p-3 shrink-0 border-t border-surfaceHover/50">
                  {addingTicketTo === section.id ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        value={newTicketName}
                        onChange={(e) => setNewTicketName(e.target.value)}
                        className="w-full bg-background border border-primary-500 rounded-lg p-2 text-sm text-white focus:outline-none resize-none"
                        placeholder="Enter a title for this ticket..."
                        rows={2}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddTicket(section.id)}
                          className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          Add ticket
                        </button>
                        <button
                          onClick={() => { setAddingTicketTo(null); setNewTicketName(''); }}
                          className="text-slate-400 hover:text-white px-2 py-1 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingTicketTo(section.id)}
                      className="w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-surfaceHover p-2 rounded-lg transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add a ticket
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* ADD SECTION COLUMN */}
            <div className="shrink-0 w-80">
              {addingSection ? (
                <div className="bg-surface rounded-xl p-3 border border-primary-500">
                  <input
                    autoFocus
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="w-full bg-background border border-transparent rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
                    placeholder="Enter section title..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddSection}
                      className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    >
                      Add section
                    </button>
                    <button
                      onClick={() => { setAddingSection(false); setNewSectionName(''); }}
                      className="text-slate-400 hover:text-white px-2 py-1 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSection(true)}
                  className="w-full flex items-center gap-2 bg-surface/30 hover:bg-surface/60 text-white p-3 rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add another section
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-surfaceHover rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Invite to Board</h3>
            <p className="text-slate-400 text-sm mb-6">Share this link with anyone you want to join this board.</p>

            {generatingInvite ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-background border border-surfaceHover rounded-lg p-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="bg-transparent text-sm text-slate-300 w-full focus:outline-none px-2"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-surfaceHover rounded hover:bg-primary-600 transition-colors text-white flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-surfaceHover transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
