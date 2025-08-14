export const hasPermission = (requiredPermissions) => {
  const permissionsString = localStorage.getItem('permissions');
  if (!permissionsString) return false;

  let userPermissions = [];

  try {
    userPermissions = JSON.parse(permissionsString);
    if (!Array.isArray(userPermissions)) {
      userPermissions = permissionsString.split(',').map(p => p.trim());
    }
  } catch {
    userPermissions = permissionsString.split(',').map(p => p.trim());
  }

  // Normaliser les permissions utilisateur
  userPermissions = userPermissions.map(p => p.trim());

  // ✅ Si l'utilisateur a uniquement 'user_admin_full_acces_control', il a tous les droits
  if (
    userPermissions.length === 1 &&
    userPermissions[0] === 'user_admin_full_acces_control'
  ) {
    return true;
  }

  // Normaliser les permissions requises
  if (typeof requiredPermissions === 'string') {
    return userPermissions.includes(requiredPermissions.trim());
  }

  if (Array.isArray(requiredPermissions)) {
    return requiredPermissions.some(p => userPermissions.includes(p.trim()));
  }

  return false;
};
