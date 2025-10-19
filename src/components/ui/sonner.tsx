import { Toaster as Sonner, toast } from "sonner";
import { useEffect, useState } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Detect system theme preference without next-themes
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    // Set initial theme based on system preference
    setTheme(mediaQuery.matches ? "dark" : "light");

    // Listen for system theme changes
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
