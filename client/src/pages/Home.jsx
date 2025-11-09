import React from 'react';
import '../styles/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <header className="hero-section">
                <h1>Hello</h1>
                <h1>Welcome to Academic Research Library</h1>
                <p>Discover, Learn, and Advance Your Research</p>
            </header>

            <section className="features-section">
                <div className="feature-card">
                    <h2>Research Collection</h2>
                    <p>Access thousands of peer-reviewed academic papers and scholarly articles</p>
                </div>
                <div className="feature-card">
                    <h2>Digital Archives</h2>
                    <p>Explore our extensive collection of digital manuscripts and historical documents</p>
                </div>
                <div className="feature-card">
                    <h2>Academic Resources</h2>
                    <p>Find comprehensive research materials across multiple disciplines</p>
                </div>
            </section>

            <section className="search-section">
                <h2>Search Our Repository</h2>
                <div className="search-box">
                    <input type="text" placeholder="Search for research papers, articles, and more..." />
                    <button>Search</button>
                </div>
            </section>

            <section className="recent-additions">
                <h2>Recent Additions</h2>
                <div className="publications-grid">
                    <div className="publication-card">
                        <h3>Machine Learning Advances</h3>
                        <p>Published: 2023</p>
                    </div>
                    <div className="publication-card">
                        <h3>Climate Change Studies</h3>
                        <p>Published: 2023</p>
                    </div>
                    <div className="publication-card">
                        <h3>Economic Theory Review</h3>
                        <p>Published: 2023</p>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <p>© 2023 Academic Research Library. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;