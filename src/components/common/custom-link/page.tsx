"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface CustomLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    disabled?: boolean;
    target?: string;
    rel?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    ariaLabel?: string;
    title?: string;
    tabIndex?: number;
    id?: string;
    prefetch?: boolean;
}

/**
 * CustomLink - A wrapper around Next.js Link component with disabled functionality
 *
 * This component extends the functionality of Next.js Link component by adding
 * a disabled state. When disabled, it renders a span element instead of a link
 * and applies appropriate aria attributes for accessibility.
 *
 * @param href - The URL to navigate to
 * @param children - The content to be rendered inside the link
 * @param className - Additional CSS classes
 * @param disabled - When true, renders a span instead of a link
 * @param target - Target attribute for the anchor element
 * @param rel - Rel attribute for the anchor element
 * @param onClick - Click event handler
 * @param ariaLabel - Accessibility label
 * @param title - Title attribute for the element
 * @param tabIndex - Tab index for keyboard navigation
 * @param id - ID attribute for the element
 * @param prefetch - Whether to prefetch the linked page (passed to Next.js Link)
 */
const CustomLink = ({
    href,
    children,
    className = "",
    disabled = false,
    target,
    rel,
    onClick,
    ariaLabel,
    title,
    tabIndex,
    id,
    prefetch,
}: CustomLinkProps) => {
    // Base classes that will be applied to both link and disabled span
    const baseClasses = `custom-link ${className}`;

    // Additional classes for the disabled state
    const disabledClasses = disabled ? "custom-link-disabled" : "";

    // Combined classes
    const combinedClasses = `${baseClasses} ${disabledClasses}`.trim();

    // Set up appropriate rel attribute for external links
    const isExternal = href && href.startsWith("http");
    const finalRel = isExternal && !rel ? "noopener noreferrer" : rel;

    // If disabled, render a span with appropriate aria attributes
    if (disabled) {
        return (
            <span
                className={combinedClasses}
                aria-disabled="true"
                aria-label={ariaLabel}
                title={title || (typeof children === "string" ? children : undefined)}
                tabIndex={tabIndex ?? -1}
                id={id}
            >
                {children}
            </span>
        );
    }

    // Otherwise, render the Next.js Link component
    return (
        <Link
            href={href}
            className={combinedClasses}
            target={target}
            rel={finalRel}
            onClick={onClick}
            aria-label={ariaLabel}
            title={title}
            tabIndex={tabIndex}
            id={id}
            prefetch={prefetch}
        >
            {children}
        </Link>
    );
};

export default CustomLink;
