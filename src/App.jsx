import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Outlet, useLoaderData, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';

import EngineContext from './EngineContext';

const baseUrl = import.meta.env.BASE_URL;

const CustomHeading = ({ as, id, to, ...props }) => {
    return React.createElement(
        as,
        { id, ...props },
        (id || to) ? (
            <a className='md-heading' href={id ? `#${id}` : `${baseUrl}${to}`} {...props} />
        ) : (
            <span className='md-heading' {...props} />
        ));
};

import { Card } from 'react-bootstrap';
import { FaGithub } from 'react-icons/fa6';
import { BigIcon } from './SceneView';
import { FaEnvelope, FaLinkedin } from 'react-icons/fa';

const PostsList = ({ ...props }) => {
    const posts = useLoaderData().sort((a, b) => new Date(b.frontmatter.date || null) - new Date(a.frontmatter.date || null));
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
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-bg)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1 }}>
                    <CustomHeading as="h2" to="about">yuvatia</CustomHeading>
                    <a style={{ marginLeft: '0.5vw' }} target='_blank' rel='noopener noreferrer' href='https://github.com/yuvatia'><FaGithub size={20} style={{ cursor: 'pointer' }} /></a>
                    <a style={{ marginLeft: '0.5vw' }} href='mailto:yuvatia@gmail.com'><FaEnvelope size={20} style={{ cursor: 'pointer' }} /></a>
                    <a style={{ marginLeft: '0.5vw' }} target='_blank' rel='noopener noreferrer' href='https://www.linkedin.com/in/yuvatia'><FaLinkedin size={20} style={{ cursor: 'pointer' }} /></a>
                </div>
                <div style={{ display: 'flex', marginBottom: '1vh', alignItems: 'center', justifyContent: 'flex-end', flexGrow: 1 }}>
                    {
                        Object.values({ "editor": "editor", "posts": "posts", "about": "about" }).map((name, index) => (
                            <CustomHeading as="h2" to={name} style={{ marginLeft: '1vw' }}>{name}</CustomHeading>
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
        </div>
    );
};

const TocItem = ({ item, activeId }) => (
    <li key={item.id}>
        <a className={`md-heading ${activeId === item.id ? 'active' : ''}`} href={`#${item.id}`}>{item.value}</a>
        {item.children && <TocList items={item.children} activeId={activeId} />}
    </li>
);

const TocList = ({ items, activeId }) => (
    <ul>
        {items.map(item => (
            <TocItem key={item.id} item={item} activeId={activeId} />
        ))}
    </ul>
);

const Post = ({ post }) => {
    const { toc } = post;
    const [activeId, setActiveId] = useState();

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
            <div style={{ marginRight: '1vw', borderRight: '1px solid var(--border-bg)', maxWidth: '90vw' }}>
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
    return postsWithFrontmatter;
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

    const router = createBrowserRouter(
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