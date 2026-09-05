'use client'

import * as React from "react";
import "@/shaders/threeui.css";
import { LandingPageFrame, type LandingPageProps } from "@/shaders/landing-pages/LandingPageFrame";
import {
  splitTypographyProps,
  usePageTypography,
  type PageTypographyProps,
} from "@/shaders/landing-pages/pageTypography";
import { COMPLETE_SHELF_TYPOGRAPHY } from "@/shaders/landing-pages/pageRecipes";

export type CompleteShelfProps = LandingPageProps & PageTypographyProps;

export function CompleteShelfLandingPage(props: CompleteShelfProps) {
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(COMPLETE_SHELF_TYPOGRAPHY, type);

  return (
    <LandingPageFrame
      {...frame}
      customization={customization}
      title="Working Volumes: Seven Tools for Making"
      sourceUrl="/landing-pages/complete-shelf-v2.html"
    />
  );
}
