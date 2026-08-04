import Notice from "../models/Notice.js";

// @desc   Publish a notice
// @route  POST /api/notices
export const createNotice = async (req, res, next) => {
  try {
    const { title, content, isPinned, priority, category, audience, publishDate, expiryDate, pinUntil } = req.body;
    if (!title || !content) {
      res.status(400);
      throw new Error("Title and content are required");
    }

    const normalizedPriority = priority ? String(priority).toUpperCase() : "LOW";

    const notice = await Notice.create({
      societyId: req.societyId,
      title,
      content,
      isPinned: !!isPinned,
      priority: normalizedPriority,
      category,
      audience,
      publishDate,
      expiryDate,
      pinUntil,
      createdBy: req.user._id,
    });

    res.status(201).json(notice);
  } catch (err) {
    next(err);
  }
};

// @desc   List notices (pinned first, archived excluded by default)
// @route  GET /api/notices
export const listNotices = async (req, res, next) => {
  try {
    const isArchived = req.query.archived === "true";
    const filter = { societyId: req.societyId, isArchived };

    const notices = await Notice.find(filter)
      .populate("createdBy", "name")
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(notices);
  } catch (err) {
    next(err);
  }
};

// @desc   Update a notice
// @route  PUT /api/notices/:id
export const updateNotice = async (req, res, next) => {
  try {
    const { title, content, isPinned, priority, category, audience, publishDate, expiryDate, pinUntil } = req.body;
    
    const updateData = { 
      title, content, isPinned, category, audience, 
      publishDate, expiryDate, pinUntil, updatedBy: req.user._id 
    };
    if (priority) {
      updateData.priority = String(priority).toUpperCase();
    }

    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, societyId: req.societyId },
      updateData,
      { new: true }
    );
    
    if (!notice) {
      res.status(404);
      throw new Error("Notice not found");
    }
    res.json(notice);
  } catch (err) {
    next(err);
  }
};

// @desc   Hard delete a notice
// @route  DELETE /api/notices/:id
export const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndDelete({ _id: req.params.id, societyId: req.societyId });
    if (!notice) {
      res.status(404);
      throw new Error("Notice not found");
    }
    res.json({ message: "Notice deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc   Archive a notice
// @route  PUT /api/notices/:id/archive
export const archiveNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, societyId: req.societyId },
      { isArchived: true, updatedBy: req.user._id },
      { new: true }
    );
    if (!notice) {
      res.status(404);
      throw new Error("Notice not found");
    }
    res.json(notice);
  } catch (err) {
    next(err);
  }
};

// @desc   Unarchive a notice
// @route  PUT /api/notices/:id/unarchive
export const unarchiveNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, societyId: req.societyId },
      { isArchived: false, updatedBy: req.user._id },
      { new: true }
    );
    if (!notice) {
      res.status(404);
      throw new Error("Notice not found");
    }
    res.json(notice);
  } catch (err) {
    next(err);
  }
};
