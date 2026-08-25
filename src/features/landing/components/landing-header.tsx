import React from "react";
import { HeaderScrollClient } from "./header-scroll-client";

interface LandingHeaderProps {
  isLoggedIn: boolean;
  activeOrganizationId?: string | null;
}

export function LandingHeader({
  isLoggedIn,
  activeOrganizationId,
}: LandingHeaderProps) {
  return (
    <HeaderScrollClient
      isLoggedIn={isLoggedIn}
      activeOrganizationId={activeOrganizationId}
    />
  );
}
