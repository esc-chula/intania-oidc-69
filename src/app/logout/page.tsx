"use client";

import { logout } from "@/server/actions/auth";
import { useEffect } from "react";

export default function Logout() {
    useEffect(() => {
        logout().catch(console.error);
    }, []);

    return null;
}