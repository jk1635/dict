import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "JK",
    tagline: "Dinosaurs are cool",
    favicon: "img/logo.svg",

    // Set the production url of your site here
    url: "https://jk-devlog.vercel.app",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",

    i18n: {
        defaultLocale: "en",
        locales: ["ko", "en"],
    },

    presets: [
        [
            "classic",
            {
                docs: false,
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    // editUrl:
                    //     "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
                    // Useful options to enforce blogging best practices
                    onUntruncatedBlogPosts: "warn",
                    path: "./blog",
                    routeBasePath: "/",
                    archiveBasePath: "/",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        colorMode: {
            defaultMode: "light",
            disableSwitch: false,
        },
        navbar: {
            title: "JK",
            items: [
                { to: "/archive", label: "Archive", position: "left" },
                {
                    href: "https://github.com/jk1635",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [],
            copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with JK.`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
