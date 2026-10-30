import { Router } from 'express';
import { db } from '../db.js';
import { AuthRequest, requireAuth } from '../auth.js';

export const bookmarkRouter = Router();

// Get all bookmarked items for authenticated user
bookmarkRouter.get('/', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const bookmarkedVideoIds = user.bookmarks?.videos || [];
  const bookmarkedNoteIds = user.bookmarks?.notes || [];

  const allVideos = db.getVideos();
  const allNotes = db.getNotes();

  const videos = allVideos.filter((v) => bookmarkedVideoIds.includes(v.id));
  const notes = allNotes.filter((n) => bookmarkedNoteIds.includes(n.id));

  res.json({
    videos,
    notes,
    videoIds: bookmarkedVideoIds,
    noteIds: bookmarkedNoteIds,
  });
});

// Toggle video bookmark
bookmarkRouter.post('/toggle-video', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  const bookmarks = user.bookmarks || { videos: [], notes: [] };
  const exists = bookmarks.videos.includes(videoId);

  if (exists) {
    bookmarks.videos = bookmarks.videos.filter((id) => id !== videoId);
  } else {
    bookmarks.videos.push(videoId);
  }

  db.updateUser(user.id, { bookmarks });
  res.json({
    message: exists ? 'Removed from bookmarks' : 'Added to bookmarks',
    isBookmarked: !exists,
    bookmarks,
  });
});

// Toggle note bookmark
bookmarkRouter.post('/toggle-note', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const { noteId } = req.body;

  if (!noteId) {
    return res.status(400).json({ error: 'noteId is required' });
  }

  const bookmarks = user.bookmarks || { videos: [], notes: [] };
  const exists = bookmarks.notes.includes(noteId);

  if (exists) {
    bookmarks.notes = bookmarks.notes.filter((id) => id !== noteId);
  } else {
    bookmarks.notes.push(noteId);
  }

  db.updateUser(user.id, { bookmarks });
  res.json({
    message: exists ? 'Removed from bookmarks' : 'Saved note to bookmarks',
    isBookmarked: !exists,
    bookmarks,
  });
});
