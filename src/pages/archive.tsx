import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

/**
 * @typedef {Object} BlogPost
 * @property {string} date
 * @property {string} formattedDate
 * @property {string} title
 * @property {string} permalink
 */

/** @type {BlogPost[]} */
const allPosts = ((ctx) => {
    /** @type {string[]} */
    const blogpostNames = ctx.keys();

    return blogpostNames.reduce(
        (blogposts, blogpostName) => {
            const module = ctx(blogpostName);
            const { date, formattedDate, title, permalink } = module.metadata;
            return [
                ...blogposts,
                {
                    date,
                    formattedDate,
                    title,
                    permalink,
                },
            ];
        },
        /** @type {BlogPost[]}>} */ []
    );
    // @ts-expect-error 2339
})(require.context("../../blog", true, /\.(md|mdx)$/));

const postsByYear = allPosts.reduceRight((posts, post) => {
    const year = post.date.split("-")[0];
    const yearPosts = posts.get(year) || [];
    return posts.set(year, [post, ...yearPosts]);
}, /** @type {Map<string, BlogPost[]>} */ new Map());

const yearsOfPosts = Array.from(postsByYear, ([year, posts]) => ({
    year,
    posts,
}));

function Year(
    /** @type {{ year: string; posts: BlogPost[]; }} */ { year, posts }
) {
    return (
        <div className={clsx("col col--4", styles.feature)}>
            <h3>{year}</h3>
            <ul>
                {posts.map((post) => (
                    <li key={post.date}>
                        <Link to={post.permalink}>
                            {post.formattedDate} {post.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function Archive() {
    const { siteConfig } = useDocusaurusContext();

    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        name: "Blog breadcrumb",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteConfig.url,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData),
                }}
            />
            <Layout title="Archive">
                <header
                    className={clsx("hero hero--primary", styles.heroBanner)}
                >
                    <div className="container">
                        <h1 className="hero__title">Archive</h1>
                        {/* <p className="hero__subtitle">
                            All the posts I ever wrote.
                        </p> */}
                    </div>
                </header>
                <main>
                    {yearsOfPosts && yearsOfPosts.length > 0 && (
                        <section className={styles.features}>
                            <div className="container">
                                <div className="row">
                                    {yearsOfPosts.map((props, idx) => (
                                        <Year key={idx} {...props} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </Layout>
        </>
    );
}

export default Archive;
