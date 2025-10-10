export const ModelsRelation = {
  Auth: {
    admin: 'Admin',
    user: 'User',
    company: 'Company',
  },
  Admin: {
    role: 'AdminRole',
    companies: 'AdminCompany',
    auths: 'Auth',
    logs: 'RequestLog',
    mediaFolders: 'MediaFolder',
    mediaFiles: 'MediaFile',
  },
  AdminRole: {
    admins: 'Admin',
  },
  AdminCompany: {
    admin: 'Admin',
    company: 'Company',
    role: 'CompanyRole',
  },
  User: {
    companies: 'CompanyUser',
    auths: 'Auth',
    logs: 'RequestLog',
    mediaFolders: 'MediaFolder',
    mediaFiles: 'MediaFile',
  },
  Company: {
    auths: 'Auth',
    admins: 'AdminCompany',
    roles: 'CompanyRole',
    users: 'CompanyUser',
    logs: 'RequestLog',
    mediaFolders: 'MediaFolder',
    mediaFiles: 'MediaFile',
  },
  CompanyRole: {
    company: 'Company',
    users: 'CompanyUser',
    admins: 'AdminCompany',
  },
  CompanyUser: {
    company: 'Company',
    user: 'User',
    role: 'CompanyRole',
  },
  RequestLog: {
    user: 'User',
    admin: 'Admin',
    company: 'Company',
  },
  MediaFolder: {
    parent: 'MediaFolder',
    children: 'MediaFolder',
    company: 'Company',
    admin: 'Admin',
    user: 'User',
    files: 'MediaFile',
  },
  MediaFile: {
    folder: 'MediaFolder',
    company: 'Company',
    admin: 'Admin',
    user: 'User',
  },
} as const;
