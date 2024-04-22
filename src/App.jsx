import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'katex/dist/katex.min.css';

import './App.css';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Outlet } from 'react-router-dom';

import EngineContext from './EngineContext';

const Home = ({ posts }) => {
    const [isMenuOpen, setMenuOpen] = useState(true);

    return (
        <div className={`blog-container ${isMenuOpen ? 'open' : 'closed'}`}>
            <div className={`menu ${isMenuOpen ? 'open' : 'closed'}`}>
                <button onClick={() => setMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? '<<' : '>>'}
                </button>
                <Link key='engine' to='/editor'>
                    <h2>Editor</h2>
                </Link>
                {posts.map(({ frontmatter }, index) => (
                    <Link key={index} to={`/post/${frontmatter.title}`}>
                        <h2>{frontmatter.title}</h2>
                    </Link>
                ))}
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};

import { Container, Row, Col } from 'react-bootstrap';

const TocItem = ({ item }) => (
    <li key={item.id}>
        <a href={`#${item.id}`}>{item.value}</a>
        {item.children && <TocList items={item.children} />}
    </li>
);

const TocList = ({ items }) => (
    <ul>
        {items.map(item => (
            <TocItem key={item.id} item={item} />
        ))}
    </ul>
);

const Post = ({ post }) => {
    const { toc } = post;

    return (
        <Container>
            <Row>
                <Col md={8}>
                    <h1>{post.frontmatter.title}</h1>
                    <post.Post />
                </Col>
                <Col md={4}>
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <TocList items={toc} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};
const PostOld = ({ post }) => {
    /*
    toc = Array<id: str, text: str, children: Array<Toc> | null>
    */
    const toc = post.toc;
    return (
        <div className="responsive-post">
            <h1>{post.frontmatter.title}</h1>
            <post.Post />
        </div>
    )
};

const PostWrapper = ({ posts }) => {
    const { name } = useParams();
    const post = posts.find(p => p.frontmatter.title === name);
    return (
        <Post post={post} />
    )
}

const App = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const importAllPosts = async () => {
            const postsImports = import.meta.glob('./posts/*.mdx');
            const postsModules = await Promise.all(
                Object.values(postsImports).map(importFn => importFn())
            );
            const postsWithFrontmatter = postsModules.map(module => {
                return { frontmatter: module.frontmatter, toc: module.tableOfContents, Post: module.default };
            });
            setPosts(postsWithFrontmatter);
        };

        importAllPosts();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home posts={posts} />}>
                    <Route path="editor" element={<EngineContext theme='dark' />}></Route>
                    <Route path="post/:name" element={<PostWrapper posts={posts} />}>
                    </Route>
                    {/* <Route path="/gfx-editor" element={<Home posts={posts} />}>
                    </Route> */}
                </Route>
            </Routes>
        </Router>
    );
};

export default App;