import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db, getUserTeams } from "../firebaseConfig";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [teamRoles, setTeamRoles] = useState({});
  const [teamPermissions, setTeamPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((err) => {
        console.error("Не удалось установить persistence:", err);
      })
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          setLoading(true);

          if (user) {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            const savedRole = docSnap.exists() ? docSnap.data().role : "user";

            setCurrentUser(user);
            setRole(savedRole);

            try {
              const teams = await getUserTeams(user.uid);
              const rolesMap = {};
              const permsMap = {};

              teams.forEach(({ id, data }) => {
                const member = data.members.find(m => m.userId === user.uid);
                rolesMap[id] = member?.role ?? null;

                const rawRoles = data.settings?.roles || {};

                const roleList = Object.entries(rawRoles).map(([key, role]) => ({
                  id: key,
                  name: role.label,
                  rights: role.rights || {},
                  inherits: role.inherits || []
                }));

                const byId = Object.fromEntries(roleList.map(r => [r.id, r]));
                const getRights = (role, visited = new Set()) => {
                  if (visited.has(role.id)) return {};
                  visited.add(role.id);
                  let rights = { ...(role.rights || {}) };
                  (role.inherits || []).forEach(parentId => {
                    const parent = byId[parentId];
                    if (parent) {
                      rights = { ...getRights(parent, visited), ...rights };
                    }
                  });
                  return rights;
                };

                const perms = {};
                for (const role of roleList) {
                  perms[role.id] = getRights(role);
                }

                permsMap[id] = perms;
              });

              setTeamRoles(rolesMap);
              setTeamPermissions(permsMap);
            } catch (err) {
              console.error("Ошибка при получении ролей/permissions команд:", err);
              setTeamRoles({});
              setTeamPermissions({});
            }
          } else {
            setCurrentUser(null);
            setRole(null);
            setTeamRoles({});
            setTeamPermissions({});
          }

          setLoading(false);
        });

        return unsubscribe;
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        teamRoles,
        teamPermissions,
        setRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

