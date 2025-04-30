import Post from "../models/post.model.js"
import Community from "../models/community.model.js"
import Notification from "../models/notification.model.js"

// @desc    Get all posts in a community
// @route   GET /api/community/:communityId/posts
// @access  Public/Private (depends on community privacy)
export const getCommunityPosts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    const community = await Community.findById(req.params.communityId)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if community is private and user is not a member
    if (community.isPrivate) {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: "This community is private",
        })
      }

      const isMember = community.members.some((member) => member.user.toString() === req.user._id.toString())

      if (!isMember && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "This community is private and you are not a member",
        })
      }
    }

    // Build filter object
    const filter = { community: req.params.communityId }

    if (req.query.tag) {
      filter.tags = { $in: [req.query.tag] }
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search }
    }

    // Build sort object
    let sort = {}
    if (req.query.sort === "newest") {
      sort = { createdAt: -1 }
    } else if (req.query.sort === "oldest") {
      sort = { createdAt: 1 }
    } else if (req.query.sort === "popular") {
      sort = { "likes.length": -1 }
    } else {
      sort = { createdAt: -1 }
    }

    const count = await Post.countDocuments(filter)

    const posts = await Post.find(filter)
      .populate("author", "name profilePicture")
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      success: true,
      posts,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private (now protected)
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profilePicture")
      .populate("comments.user", "name profilePicture")

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if post's community is private
    const community = await Community.findById(post.community)

    if (community.isPrivate) {
      const isMember = community.members.some((member) => member.user.toString() === req.user._id.toString())

      if (!isMember && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "This post belongs to a private community and you are not a member",
        })
      }
    }

    res.json({
      success: true,
      post,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Create a post
// @route   POST /api/community/:communityId/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, tags, attachments } = req.body

    const community = await Community.findById(req.params.communityId)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if user is a member of the community
    const isMember = community.members.some((member) => member.user.toString() === req.user._id.toString())

    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You must be a member of the community to create a post",
      })
    }

    const post = new Post({
      title,
      content,
      author: req.user._id,
      community: req.params.communityId,
      tags: tags || [],
      attachments: attachments || [],
    })

    const createdPost = await post.save()

    // Add post to community's posts
    community.posts.push(createdPost._id)
    await community.save()

    // Notify community members about new post
    const communityMembers = community.members
      .filter((member) => member.user.toString() !== req.user._id.toString())
      .map((member) => member.user)

    for (const memberId of communityMembers) {
      await Notification.create({
        recipient: memberId,
        type: "new_post",
        title: "New Post in Community",
        message: `${req.user.name} posted "${title}" in the community "${community.name}"`,
        relatedTo: {
          model: "Post",
          id: createdPost._id,
        },
      })
    }

    res.status(201).json({
      success: true,
      post: createdPost,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user is the author or admin/moderator
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      // Check if user is a community moderator
      const community = await Community.findById(post.community)

      const isModerator = community.members.some(
        (member) =>
          member.user.toString() === req.user._id.toString() &&
          (member.role === "moderator" || member.role === "admin"),
      )

      if (!isModerator) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this post",
        })
      }
    }

    // Update post fields
    if (req.body.title) post.title = req.body.title
    if (req.body.content) post.content = req.body.content
    if (req.body.tags) post.tags = req.body.tags
    if (req.body.attachments) post.attachments = req.body.attachments

    post.isEdited = true

    const updatedPost = await post.save()

    res.json({
      success: true,
      post: updatedPost,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user is the author or admin/moderator
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      // Check if user is a community moderator
      const community = await Community.findById(post.community)

      const isModerator = community.members.some(
        (member) =>
          member.user.toString() === req.user._id.toString() &&
          (member.role === "moderator" || member.role === "admin"),
      )

      if (!isModerator) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this post",
        })
      }
    }

    // Remove post from community's posts
    await Community.findByIdAndUpdate(post.community, {
      $pull: { posts: post._id },
    })

    // Delete the post
    await post.deleteOne()

    res.json({
      success: true,
      message: "Post removed",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Like/unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if post's community is private
    const community = await Community.findById(post.community)

    if (community.isPrivate) {
      const isMember = community.members.some((member) => member.user.toString() === req.user._id.toString())

      if (!isMember && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "This post belongs to a private community and you are not a member",
        })
      }
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(req.user._id)

    if (alreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter((userId) => userId.toString() !== req.user._id.toString())
    } else {
      // Like the post
      post.likes.push(req.user._id)

      // Notify post author about the like
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.author,
          type: "like",
          title: "Someone Liked Your Post",
          message: `${req.user.name} liked your post "${post.title}"`,
          relatedTo: {
            model: "Post",
            id: post._id,
          },
        })
      }
    }

    await post.save()

    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if post's community is private
    const community = await Community.findById(post.community)

    if (community.isPrivate) {
      const isMember = community.members.some((member) => member.user.toString() === req.user._id.toString())

      if (!isMember && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "This post belongs to a private community and you are not a member",
        })
      }
    }

    const comment = {
      user: req.user._id,
      content,
      createdAt: new Date(),
    }

    post.comments.push(comment)

    await post.save()

    // Notify post author about the comment
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        type: "new_comment",
        title: "New Comment on Your Post",
        message: `${req.user.name} commented on your post "${post.title}"`,
        relatedTo: {
          model: "Post",
          id: post._id,
        },
      })
    }

    res.status(201).json({
      success: true,
      comment,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Update a comment
// @route   PUT /api/posts/:id/comments/:commentId
// @access  Private
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Find the comment
    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user is the comment author or admin/moderator
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      // Check if user is a community moderator
      const community = await Community.findById(post.community)

      const isModerator = community.members.some(
        (member) =>
          member.user.toString() === req.user._id.toString() &&
          (member.role === "moderator" || member.role === "admin"),
      )

      if (!isModerator) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this comment",
        })
      }
    }

    // Update comment
    comment.content = content
    comment.isEdited = true
    comment.updatedAt = new Date()

    await post.save()

    res.json({
      success: true,
      comment,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Find the comment
    const comment = post.comments.id(req.params.commentId)

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    // Check if user is the comment author or admin/moderator
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      // Check if user is a community moderator
      const community = await Community.findById(post.community)

      const isModerator = community.members.some(
        (member) =>
          member.user.toString() === req.user._id.toString() &&
          (member.role === "moderator" || member.role === "admin"),
      )

      if (!isModerator) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this comment",
        })
      }
    }

    // Remove comment
    post.comments.pull(req.params.commentId)

    await post.save()

    res.json({
      success: true,
      message: "Comment removed",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// @desc    Report a post
// @route   POST /api/posts/:id/report
// @access  Private
export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      })
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      })
    }

    // Check if user already reported this post
    const alreadyReported = post.reports.some((report) => report.user.toString() === req.user._id.toString())

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this post",
      })
    }

    // Add report
    post.reports.push({
      user: req.user._id,
      reason,
      date: new Date(),
    })

    await post.save()

    // Notify community moderators
    const community = await Community.findById(post.community)
    const moderators = community.members.filter((member) => member.role === "moderator" || member.role === "admin")

    for (const mod of moderators) {
      await Notification.create({
        recipient: mod.user,
        type: "system",
        title: "Post Reported",
        message: `A post "${post.title}" has been reported in the community "${community.name}"`,
        relatedTo: {
          model: "Post",
          id: post._id,
        },
      })
    }

    res.json({
      success: true,
      message: "Post reported successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

