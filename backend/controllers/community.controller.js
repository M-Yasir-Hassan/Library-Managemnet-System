import Community from "../models/community.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"

// @desc    Get all communities with pagination and filters
// @route   GET /api/community
// @access  Private (now protected)
export const getCommunities = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10
    const page = Number(req.query.page) || 1

    // Build filter object
    const filter = {}

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ]
    }

    // Only show private communities to members
    if (req.user.role !== "admin") {
      filter.$or = [
        { isPrivate: false },
        {
          isPrivate: true,
          "members.user": req.user._id,
        },
      ]
    }

    const count = await Community.countDocuments(filter)

    const communities = await Community.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))

    res.json({
      success: true,
      communities,
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

// @desc    Get community by ID
// @route   GET /api/community/:id
// @access  Private (now protected)
export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("members.user", "name profilePicture")

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if community is private and user is not a member
    if (community.isPrivate) {
      const isMember = community.members.some((member) => member.user._id.toString() === req.user._id.toString())

      if (!isMember && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "This community is private and you are not a member",
        })
      }
    }

    res.json({
      success: true,
      community,
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

// @desc    Create a community
// @route   POST /api/community
// @access  Private
export const createCommunity = async (req, res) => {
  try {
    const { name, description, type, coverImage, rules, isPrivate } = req.body

    // Check if community with this name already exists
    const communityExists = await Community.findOne({ name })

    if (communityExists) {
      return res.status(400).json({
        success: false,
        message: "Community with this name already exists",
      })
    }

    const community = new Community({
      name,
      description,
      type,
      coverImage,
      rules: rules || [],
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "admin",
          joinedAt: new Date(),
        },
      ],
    })

    const createdCommunity = await community.save()

    // Add community to user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedCommunities: createdCommunity._id },
    })

    res.status(201).json({
      success: true,
      community: createdCommunity,
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

// @desc    Update a community
// @route   PUT /api/community/:id
// @access  Private/Admin/Moderator
export const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if user is admin or community admin/moderator
    const isCommunityAdmin = community.members.some(
      (member) => member.user.toString() === req.user._id.toString() && member.role === "admin",
    )

    const isCommunityModerator = community.members.some(
      (member) => member.user.toString() === req.user._id.toString() && member.role === "moderator",
    )

    if (req.user.role !== "admin" && !isCommunityAdmin && !isCommunityModerator) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this community",
      })
    }

    // Update community fields
    if (req.body.name) community.name = req.body.name
    if (req.body.description) community.description = req.body.description
    if (req.body.coverImage) community.coverImage = req.body.coverImage
    if (req.body.rules) community.rules = req.body.rules
    if (req.body.isPrivate !== undefined) community.isPrivate = req.body.isPrivate

    const updatedCommunity = await community.save()

    res.json({
      success: true,
      community: updatedCommunity,
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

// @desc    Delete a community
// @route   DELETE /api/community/:id
// @access  Private/Admin/Community Admin
export const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if user is admin or community admin
    const isCommunityAdmin = community.members.some(
      (member) => member.user.toString() === req.user._id.toString() && member.role === "admin",
    )

    if (req.user.role !== "admin" && !isCommunityAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this community",
      })
    }

    // Delete all posts in the community
    await Post.deleteMany({ community: community._id })

    // Remove community from users' joined communities
    await User.updateMany({ joinedCommunities: community._id }, { $pull: { joinedCommunities: community._id } })

    // Delete the community
    await community.deleteOne()

    res.json({
      success: true,
      message: "Community removed",
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

// @desc    Join a community
// @route   POST /api/community/:id/join
// @access  Private
export const joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if user is already a member
    const isMember = community.members.some((member) => member.user.toString() === req.user._id.toString())

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community",
      })
    }

    // Add user to community members
    community.members.push({
      user: req.user._id,
      role: "member",
      joinedAt: new Date(),
    })

    await community.save()

    // Add community to user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedCommunities: community._id },
    })

    // Notify community admin
    await Notification.create({
      recipient: community.createdBy,
      type: "community_invite",
      title: "New Community Member",
      message: `${req.user.name} has joined your community "${community.name}"`,
      relatedTo: {
        model: "Community",
        id: community._id,
      },
    })

    res.json({
      success: true,
      message: "Successfully joined the community",
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

// @desc    Leave a community
// @route   POST /api/community/:id/leave
// @access  Private
export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if user is a member
    const memberIndex = community.members.findIndex((member) => member.user.toString() === req.user._id.toString())

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this community",
      })
    }

    // Check if user is the only admin
    const isAdmin = community.members[memberIndex].role === "admin"
    const adminCount = community.members.filter((member) => member.role === "admin").length

    if (isAdmin && adminCount === 1 && community.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: "You are the only admin. Please assign another admin before leaving",
      })
    }

    // Remove user from community members
    community.members.splice(memberIndex, 1)

    await community.save()

    // Remove community from user's joined communities
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedCommunities: community._id },
    })

    res.json({
      success: true,
      message: "Successfully left the community",
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

// @desc    Update member role in community
// @route   PUT /api/community/:id/members/:userId
// @access  Private/Admin/Community Admin
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body

    if (!["member", "moderator", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      })
    }

    const community = await Community.findById(req.params.id)

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      })
    }

    // Check if user is admin or community admin
    const isCommunityAdmin = community.members.some(
      (member) => member.user.toString() === req.user._id.toString() && member.role === "admin",
    )

    if (req.user.role !== "admin" && !isCommunityAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update member roles",
      })
    }

    // Check if target user is a member
    const memberIndex = community.members.findIndex((member) => member.user.toString() === req.params.userId)

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User is not a member of this community",
      })
    }

    // Update member role
    community.members[memberIndex].role = role

    await community.save()

    // Notify user about role change
    await Notification.create({
      recipient: req.params.userId,
      type: "system",
      title: "Community Role Updated",
      message: `Your role in the community "${community.name}" has been updated to ${role}`,
      relatedTo: {
        model: "Community",
        id: community._id,
      },
    })

    res.json({
      success: true,
      message: `Member role updated to ${role}`,
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

