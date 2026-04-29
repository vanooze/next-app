export interface SelectUser {
  key: string;
  label: string;
  department: string;
}

interface DepartmentUser {
  user_id: number;
  name: string;
  department: string;
  department_clean?: string; // for getAllUsers where department might be messy
}

export const getDepartmentUsers = async (): Promise<SelectUser[]> => {
  try {
    const res = await fetch("/api/kra/user");
    if (!res.ok) throw new Error("Failed to fetch users");

    const users: DepartmentUser[] = await res.json();

    return users.map((u) => ({
      key: String(u.user_id),
      label: u.name,
      department: u.department?.trim() || "NO DEPARTMENT",
    }));
  } catch (err) {
    console.error("Error fetching department users:", err);
    return [];
  }
};

export const getAllUsers = async (): Promise<SelectUser[]> => {
  try {
    const res = await fetch("/api/ticketing/user");
    if (!res.ok) throw new Error("Failed to fetch users");

    const users: DepartmentUser[] = await res.json();

    return users.map((u) => ({
      key: String(u.user_id),
      label: u.name,
      department: u.department_clean?.trim() || "NO DEPARTMENT", // ✅ FIX HERE
    }));
  } catch (err) {
    console.error("Error fetching all users:", err);
    return [];
  }
};

export const getDepartments = (users: SelectUser[]) => {
  return Array.from(new Set(users.map((u) => u.department))).sort();
};

export const getUsersByDepartment = (
  users: SelectUser[],
  department: string | null,
) => {
  if (!department) return users;
  return users.filter((u) => u.department === department);
};
