export interface SelectUser {
  key: string;
  label: string;
}

interface DepartmentUser {
  user_id: number;
  name: string;
  department: string;
}

export const getDepartmentUsers = async (): Promise<SelectUser[]> => {
  try {
    const res = await fetch("/api/kra/user");
    if (!res.ok) throw new Error("Failed to fetch users");

    const users: DepartmentUser[] = await res.json();

    return users.map((u) => ({
      key: String(u.user_id),
      label: u.name,
    }));
  } catch (err) {
    console.error("Error fetching department users:", err);
    return [];
  }
};
