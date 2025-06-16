"use client";

import { Button, Input, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string>("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      setLoading(true);
      console.log("Token being set:", data.token);
      // Redirect after short delay
      setTimeout(() => {
        router.push("/");
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      setResponseMsg(`❌ Invalid Credentials`);
      console.error(`${err.message}`);
    }
  };

  return (
    <>
      <div className="text-center text-[25px] font-bold mb-6">Login</div>

      <div className="flex max-w-xs flex-col gap-4">
        <Input
          label="Username"
          placeholder="Enter your username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {responseMsg && (
        <div className="mt-3 text-sm text-center text-red-500">
          {responseMsg}
        </div>
      )}

      <div className="pt-4">
        {loading ? (
          <div className="w-full flex justify-center items-center min-h-[200px]">
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              size="lg"
              variant="wave"
              label="Logging in..."
            />
          </div>
        ) : (
          <Button
            onPress={handleLogin}
            variant="flat"
            color="primary"
            isDisabled={!username || !password}
          >
            Login
          </Button>
        )}
      </div>

      <div className="font-light text-slate-400 mt-4 text-sm text-center">
        Having problems logging in?{" "}
        <span className="font-bold text-black dark:text-white">
          Contact IT support
        </span>
      </div>
    </>
  );
};
