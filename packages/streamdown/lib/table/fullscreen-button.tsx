import { Maximize2Icon, XIcon } from "lucide-react";
import { type ComponentProps, useContext, useEffect, useRef, useState } from "react";
import { StreamdownContext } from "../../index";
import { cn } from "../utils";

// Track the number of active fullscreen modals to manage body scroll lock correctly
let activeFullscreenCount = 0;

const lockBodyScroll = () => {
  activeFullscreenCount += 1;
  if (activeFullscreenCount === 1) {
    document.body.style.overflow = "hidden";
  }
};

const unlockBodyScroll = () => {
  activeFullscreenCount = Math.max(0, activeFullscreenCount - 1);
  if (activeFullscreenCount === 0) {
    document.body.style.overflow = "";
  }
};

type TableFullscreenButtonProps = ComponentProps<"button"> & {
  onFullscreen?: () => void;
  onExit?: () => void;
};

export const TableFullscreenButton = ({
  onFullscreen,
  onExit,
  className,
  ...props
}: TableFullscreenButtonProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isAnimating } = useContext(StreamdownContext);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Manage scroll lock and keyboard events
  useEffect(() => {
    if (isFullscreen) {
      lockBodyScroll();

      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      };

      document.addEventListener("keydown", handleEsc);
      return () => {
        document.removeEventListener("keydown", handleEsc);
        unlockBodyScroll();
      };
    }
  }, [isFullscreen]);

  // Handle callbacks separately to avoid scroll lock flickering
  useEffect(() => {
    if (isFullscreen) {
      onFullscreen?.();
    } else if (onExit) {
      onExit();
    }
  }, [isFullscreen, onFullscreen, onExit]);

  // Get the table element to display in fullscreen
  const getTableElement = () => {
    const tableWrapper = buttonRef.current?.closest('[data-streamdown="table-wrapper"]');
    return tableWrapper?.querySelector("table") as HTMLTableElement | null;
  };

  // Render fullscreen table content
  const renderFullscreenTable = () => {
    const tableElement = getTableElement();
    if (!tableElement) return null;
    
    return (
      <table
        className={cn(
          "w-full border-collapse border border-border bg-background"
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: "Table content is already sanitized by markdown parser before rendering"
        dangerouslySetInnerHTML={{
          __html: tableElement.innerHTML,
        }}
      />
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        className={cn(
          "cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        data-streamdown="table-fullscreen-button"
        disabled={isAnimating}
        onClick={handleToggle}
        title="View fullscreen"
        type="button"
        {...props}
      >
        <Maximize2Icon size={14} />
      </button>

      {isFullscreen && (
        // biome-ignore lint/a11y/useSemanticElements: "div is used as a backdrop overlay, not a button"
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              handleToggle();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <button
            className="absolute top-4 right-4 z-10 rounded-md p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            onClick={handleToggle}
            title="Exit fullscreen"
            type="button"
          >
            <XIcon size={20} />
          </button>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: "div with role=presentation is used for event propagation control" */}
          <div
            className="flex h-full w-full items-center justify-center overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="w-full max-w-full overflow-auto">
              {renderFullscreenTable()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
