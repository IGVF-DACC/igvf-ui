import { ReferenceType } from "@floating-ui/react";

export type tooltipAttr = {
  id: string;
  refEl: (node: ReferenceType) => void;
  refProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
  tooltipEl: ((node: HTMLElement | null) => void) &
    ((node: HTMLElement | null) => void);
  context: FloatingContext;
  arrowRef: MutableRefObject<any>;
  styles: CSSProperties;
  isVisible: boolean;
};

export function useTooltip(id: string): tooltipAttr;

export function TooltipRef({
  tooltipAttr,
  children,
}: {
  tooltipAttr: tooltipAttr;
  children: React.ReactNode;
}): JSX.Element;

export function Tooltip({
  tooltipAttr,
  children,
}: {
  tooltipAttr: tooltipAttr;
  children: React.ReactNode;
}): JSX.Element;
