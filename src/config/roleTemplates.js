export const ROLE_TEMPLATES = {
  manager: {
    label: 'Менеджер',
    rights: {
      invite: true,
      deleteTasks: false,
      manageRoles: true,
    },
    inherits: ['member']
  },
  observer: {
    label: 'Наблюдатель',
    rights: {
      invite: false,
      deleteTasks: false,
      manageRoles: false,
    },
    inherits: []
  },
  analyst: {
    label: 'Аналитик',
    rights: {
      invite: false,
      deleteTasks: false,
      manageRoles: false,
      viewReports: true,
    },
    inherits: []
  }
};
