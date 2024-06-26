const { callbackify } = require('util')
const { Project } = require('../../models/Project')
const EmailHandler = require('../Email/EmailHandler')
const Settings = require('@overleaf/settings')

const CollaboratorsEmailHandler = {
  _buildInviteUrl(project, invite) {
    return (
      `${Settings.siteUrl}/project/${project._id}/invite/token/${invite.token}?` +
      [
        `project_name=${encodeURIComponent(project.name)}`,
        `user_first_name=${encodeURIComponent(project.owner_ref.first_name)}`,
      ].join('&')
    )
  },

  async notifyUserOfProjectInvite(projectId, email, invite, sendingUser) {
    // eslint-disable-next-line no-restricted-syntax
    const project = await Project.findOne({ _id: projectId })
      .select('name owner_ref')
      .populate('owner_ref')
      .exec()
    const emailOptions = {
      to: email,
      replyTo: project.owner_ref.email,
      project: {
        name: project.name,
      },
      inviteUrl: CollaboratorsEmailHandler._buildInviteUrl(project, invite),
      owner: project.owner_ref,
      sendingUser_id: sendingUser._id,
    }
    await EmailHandler.promises.sendEmail('projectInvite', emailOptions)
  },
}

module.exports = {
  promises: CollaboratorsEmailHandler,
  notifyUserOfProjectInvite: callbackify(
    CollaboratorsEmailHandler.notifyUserOfProjectInvite
  ),
  _buildInviteUrl: CollaboratorsEmailHandler._buildInviteUrl,
}
