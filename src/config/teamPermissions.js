const teamPermissions = {
  team123: {
    owner: {
      canManageTasks: true,
      canInvite: true,
      canDelete: true,
    },
    manager: {
      canManageTasks: true,
      canInvite: true,
      canDelete: false,
    },
    member: {
      canManageTasks: false,
      canInvite: false,
      canDelete: false,
    },
    observer: {
      canManageTasks: false,
      canInvite: false,
      canDelete: false,
    },
  },
};

export default teamPermissions;
