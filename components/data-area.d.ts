/**
 * Typescript declarations for data-area.js components, until we rewrite data-area.js in Typescript.
 */

// node_modules
import React from "react";
// components
import { PagePanelStates } from "./page-panels";

export function DataPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactElement | null;

export function DataArea({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null;

export function DataAreaTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}): React.ReactElement | null;

export declare namespace DataAreaTitle {
  export function Expander({
    pagePanels,
    pagePanelId,
    label,
    children,
  }: {
    pagePanels: PagePanelStates;
    pagePanelId: string;
    label: string;
    children?: React.ReactNode;
  }): React.ReactElement | null;
}

export function DataAreaTitleLink({
  href,
  label,
  isExternal,
  children,
}: {
  href: string;
  label: string;
  isExternal?: boolean;
  children: React.ReactNode;
}): React.ReactElement | null;

export function DataItemLabel({
  className,
  children,
}: {
  className?: string; // Additional Tailwind CSS classes
  children: React.ReactNode; // Label to display
}): React.ReactElement | null;

export function DataItemValue({
  className,
  children,
}: {
  className?: string; // Additional Tailwind CSS classes
  children: React.ReactNode; // Value to display
}): React.ReactElement | null;

export function DataItemValueBoolean({
  className,
  children,
}: {
  className?: string; // Additional Tailwind CSS classes
  children?: boolean; // Boolean value to display
}): React.ReactElement | null;

export function DataItemValueUrl({
  className,
  children,
}: {
  className?: string; // Additional Tailwind CSS classes
  children: string; // URL to display
}): React.ReactElement | null;

export function DataItemList({
  isCollapsible,
  maxItemsBeforeCollapse,
  isUrlList,
  children,
}: {
  isCollapsible?: boolean;
  maxItemsBeforeCollapse?: number;
  isUrlList?: boolean;
  children: React.ReactNode;
}): React.ReactElement | null;
