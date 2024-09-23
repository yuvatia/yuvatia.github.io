import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, Route, RouterProvider, createHashRouter as createRouter, createRoutesFromElements, useLoaderData, useParams } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { isMobile } from 'react-device-detect';
import EngineContext from './EngineContext';

const baseUrl = import.meta.env.BASE_URL;

const CustomHeading = ({ as, id, to, ...props }) => {
    return React.createElement(
        as,
        { id, ...props },
        (id || to) ? (
            <HashLink className='md-heading' to={id ? `#${id}` : `${baseUrl}${to}`} {...props} />) : (
            <span className='md-heading' {...props} />
        ));
};

import { Card } from 'react-bootstrap';
import { FaEnvelope, FaLinkedin } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa6';

const PostsList = ({ ...props }) => {
    const posts = useLoaderData().sort((a, b) => {
        const dateA = new Date(a.frontmatter.date || null);
        const dateB = new Date(b.frontmatter.date || null);

        // Compare dates first
        if (dateB - dateA !== 0) {
            return dateB - dateA; // Sort by date descending
        } else {
            // If dates are equal, sort by title in descending order
            return -a.frontmatter.title.localeCompare(b.frontmatter.title);
        }
    });
    return (
        <div className='posts-list' style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '80%', margin: 'auto', marginTop: '1vh' }}>
            {posts.map(({ frontmatter }, index) => (
                <Card style={{ flex: 1 }}>
                    <Card.Body>
                        <Card.Title>
                            <CustomHeading as="h2" to={`posts/${frontmatter.title}`}>{frontmatter.title}</CustomHeading>
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{new Date(frontmatter.date || null).toLocaleDateString()}</Card.Subtitle>
                        <Card.Text>{frontmatter.summary || frontmatter.title}</Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

const Home = ({ theme, setTheme }) => {
    const [isMenuOpen, setMenuOpen] = useState(true);
    return (
        <div className={`blog-container ${isMenuOpen ? 'open' : 'closed'}`}>
            <div className={`menu ${isMenuOpen ? 'open' : 'closed'}`} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: isMobile ? 'none' : '1px solid var(--border-bg)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexGrow: 1 }}>
                    <CustomHeading as="h2" to="about" style={{ fontSize: 'calc(10px + 2vmin)' }}>yuvatia</CustomHeading>
                </div>
                <div style={{ display: 'flex', marginBottom: '1vh', alignItems: 'center', justifyContent: 'flex-end', flexGrow: 1 }}>
                    {
                        Object.values({ "editor": "editor", "posts": "posts", "about": "about" }).map((name, index) => (
                            <>
                                <CustomHeading as="h2" to={name} style={{ marginLeft: '0.5rem', fontSize: 'calc(10px + 2vmin)' }}>{name}</CustomHeading>
                                <h2>/</h2>
                            </>
                        ))
                    }
                    <i className="bi bi-moon-fill theme-toggle"
                        style={{ fontSize: '20px', paddingLeft: '1vw' }}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    />
                </div>
            </div>
            <div className="content" style={{ width: '100%', height: '100%' }}>
                <Outlet />
            </div>
            <div className='footer' style={{ width: '100%', marginTop: 'auto', borderTop: '1px solid var(--border-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1 }}>
                    <div style={{ color: 'var(--border-bg)' }}>© Yuval Atia 2024</div>
                    <div>
                        <a style={{ marginLeft: '0.5vw' }} target='_blank' rel='noopener noreferrer' href='https://github.com/yuvatia'><FaGithub size={20} style={{ cursor: 'pointer' }} /></a>
                        <a style={{ marginLeft: '0.5vw' }} href='mailto:imyuvatia@gmail.com'><FaEnvelope size={20} style={{ cursor: 'pointer' }} /></a>
                        <a style={{ marginLeft: '0.5vw' }} target='_blank' rel='noopener noreferrer' href='https://www.linkedin.com/in/yuvatia'><FaLinkedin size={20} style={{ cursor: 'pointer' }} /></a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TocItem = ({ item, activeId }) => (
    <li key={item.id} style={{ listStyleType: 'none' }}>
        <HashLink className={`md-heading ${activeId === item.id ? 'active' : ''}`} to={`#${item.id}`}>{item.value}</HashLink>
        {item.children && <TocList items={item.children} activeId={activeId} />}
    </li>
);

const TocList = ({ items, activeId }) => (
    <ul style={{ listStyleType: 'none', paddingLeft: '1rem' }}>
        {items.map(item => (
            <TocItem key={item.id} item={item} activeId={activeId} />
        ))}
    </ul>
);

const Post = ({ post }) => {
    const { toc } = post;
    const [activeId, setActiveId] = useState();


    const initialized = useRef(false)

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true

            // Add callout type to callout title
            let index = 0;
            document.querySelectorAll('[data-callout="true"]').forEach(callout => {
                ++index;

                const type = callout.getAttribute('data-callout-type');
                const titleElement = callout.querySelector('[data-callout-title="true"]');

                if (titleElement) {
                    const typeId = `${type}-link-${index}`; // Unique ID for each type link
                    const typeLink = `
                    <div class="callout-type">
                            ${type} ${index}
                    </div>`;
                    
                    // Ugly hack for when title is just the type with first letter capitalized,
                    // which is a mistake in the markdown to html generator,
                    // in this case we just hide the title element
                    if (titleElement.textContent.trim().toLowerCase() === type.toLowerCase()) {
                        titleElement.style.display = 'none';
                    }

                    titleElement.insertAdjacentHTML('beforebegin', typeLink);
                    // Add an id to the title element for referencing
                    titleElement.setAttribute('id', typeId);
                }
            });
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0% -80% 0%' }
        );

        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            observer.observe(el);
        });

        const handleHashChange = () => {
            setActiveId(window.location.hash.slice(1));
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            observer.disconnect();
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    return (
        <div className='post-container'>
            <div className='post-container-inner'>
                <CustomHeading as="h1" to={`posts/${post.frontmatter.title}`} style={{ display: 'block', width: '100%', textAlign: 'center', margin: '0 auto' }}>{post.frontmatter.title}</CustomHeading>
                <post.Post components={components} />
            </div>
            <div className='post-toc'>
                <TocList items={toc} activeId={activeId} />
            </div>
        </div>
    );
};

const components = {
    h1: (props) => <CustomHeading as="h1" {...props} />,
    h2: (props) => <CustomHeading as="h2" {...props} />,
    h3: (props) => <CustomHeading as="h3" {...props} />,
    h4: (props) => <CustomHeading as="h4" {...props} />,
    h5: (props) => <CustomHeading as="h5" {...props} />,
    h6: (props) => <CustomHeading as="h6" {...props} />
};

const PostWrapper = ({ }) => {
    const { name } = useParams();
    const posts = useLoaderData();
    const post = posts.find(p => p.frontmatter.title === name);
    return (
        <div style={{ padding: '1% 0 0 5%' }}>
            <Post post={post} />
        </div>
    )
}

const About = () => {
    return (
        <div style={{ margin: '5%' }}>
            <CustomHeading as="h1">Hi!</CustomHeading>
            <p>
                I'm Yuval, a programmer who loves problems where math, engineering and programming all come together.
            </p>
            <p>
                Thank you for visiting my blog! I hope you find something interesting here.
            </p>
        </div>
    );
};

const importAllPosts = async () => {
    const postsImports = import.meta.glob('./posts/*.mdx');
    const postsModules = await Promise.all(
        Object.values(postsImports).map(importFn => importFn())
    );
    const postsWithFrontmatter = postsModules.map(module => {
        return { frontmatter: module.frontmatter, toc: module.tableOfContents, Post: module.default };
    });
    const nonWipPosts = postsWithFrontmatter.filter(post => !post.frontmatter.wip);
    return nonWipPosts;
};


const NotFound = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>404 - Not Found</h1>
    </div>
)

const App = () => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
    });

    const router = createRouter(
        createRoutesFromElements(
            <Route path={baseUrl} element={<Home theme={theme} setTheme={setTheme} errorElement={<NotFound />} />}>
                <Route index element={<About />}></Route>
                <Route path="about" element={<About />}></Route>
                <Route path='posts' element={<PostsList />} loader={importAllPosts}></Route>
                <Route path="editor" element={<EngineContext theme={theme} setTheme={setTheme} />}></Route>
                <Route path="posts/:name" element={<PostWrapper />} loader={importAllPosts}></Route>
            </Route>

        )
    )

    return (
        <div className='md-blog-container' data-bs-theme={theme || 'dark'}>
            <RouterProvider router={router} />
        </div>
    );
};

export default App;