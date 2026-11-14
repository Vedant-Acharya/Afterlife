"use client";

import React from 'react';
import Link from 'next/link';

const NOTEBOOKS_CONFIG = [
  {
    id: 1,
    url: "/apollo11",
    imgSrc: "/images/Apollo11bookcover.png",
  },
  {
    id: 2,
    url: "/extra", //not built
    imgSrc: "/images/Apollo15bookcover.png",
  },
  {
    id: 3,
    url: "/extra",//not built
    imgSrc: "/images/Apollo17bookcover.png",
  },
  {
    id: 4,
    url: "/extra",//not built
    imgSrc: "/images/Pathfinderbookcover.png",
  },
  {
    id: 5,
    url: "/spirit",
    imgSrc: "/images/spiritbookcover.png",
  },
  {
    id: 6,
    url: "/extra",
    imgSrc: "/images/Apollo16bookcover.png",
  },
  {
    id: 7,
    url: "/extra",
    imgSrc: "/images/Apollo17bookcover.png",
  },
  {
    id: 8,
    url: "/extra",//not built
    imgSrc: "/images/vikingbookcover.png",
  },
  {
    id: 9,
    url: "/extra",
    imgSrc: "",
  },
  {
    id: 10,
    url: "/extra",
    imgSrc: "",
  },
  {
    id: 11,
    url: "/extra",
    imgSrc: "",
  },
  {
    id: 12,
    url: "/extra",
    imgSrc: "",
  },
];

export default function NotebookGallery() {
  return (

    <main className="notebook-wrapper">
      <h1 className="readme-heading">Read me!</h1>
      <p className="gallery-intro">
        <strong>Never limit your curiosity!</strong> Feel free to explore these notebooks.
      </p>
      <ul>
        {NOTEBOOKS_CONFIG.map((notebook) => (
          <li key={notebook.id}>
            <Link href={notebook.url} target="_blank" rel="noopener noreferrer">
              {[6,7, 9, 10,11,12].includes(notebook.id) ? null : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={notebook.imgSrc} />
              )}
            </Link>
          </li>
        ))}
      </ul>
      

      <style>{`
        .notebook-wrapper {
          --columns: 3;
          --yellow: rgba(238, 188, 31, 1);
          --pink: rgba(255, 82, 145, 1);
          --blue: rgba(64, 98, 187, 1);
          --green: rgba(6, 141, 126, 1);
          --white: rgba(248, 255, 229, 1);
          
          background-color: #182028;
          min-height: 100vh;
          padding: 1px;
          overflow: hidden;
        }

        .readme-heading {
          width: fit-content;
          margin: clamp(24px, 4vw, 48px) auto 0;
          color: var(--white);
          font-family: var(--font-geist-sans), sans-serif;
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 800;
          letter-spacing: 0.12em;
          line-height: 1;
          text-align: center;
          text-transform: uppercase;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.3);
        }

        .readme-heading::after {
          content: '';
          display: block;
          width: 42%;
          height: 3px;
          margin: 14px auto 0;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--yellow), var(--pink));
        }

        .gallery-intro {
          width: fit-content;
          max-width: min(90%, 560px);
          margin: 20px auto 0;
          padding: 12px 20px;
          border: 1px solid rgba(248, 255, 229, 0.14);
          border-radius: 999px;
          background: rgba(248, 255, 229, 0.05);
          color: rgba(248, 255, 229, 0.76);
          font-family: var(--font-geist-sans), sans-serif;
          font-size: clamp(0.9rem, 1.5vw, 1.05rem);
          font-weight: 400;
          line-height: 1.6;
          text-align: center;
          text-wrap: pretty;
        }

        .gallery-intro strong {
          color: var(--white);
          font-weight: 650;
        }

        .notebook-wrapper ul {
          display: grid;
          grid-template-columns: repeat(var(--columns), 1fr);
          margin: 200px -40px;
          list-style-type: none;
          padding: 0;
        }

        .notebook-wrapper li {
          grid-column-end: span 2;
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          margin-top: -50%;
        }

        .notebook-wrapper li:nth-child(2n) {
          grid-column-start: 2;
        }

        .notebook-wrapper li::before, 
        .notebook-wrapper li::after {
          content: '';
          position: absolute;
          display: block;
          width: 100%;
          height: 100%;
          background-size: 50% 100%, 100% 100%;
          background-position: left, right;
        }

        .notebook-wrapper li::before {
          z-index: 0;
          clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
          -webkit-clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
          background-repeat: no-repeat;
          background-image: 
            linear-gradient(-45deg, var(--yellow) 53.5%, var(--green) 53.5%, var(--green) 60%, var(--yellow) 60%), 
            linear-gradient(45deg, var(--yellow) 65.3%, var(--green) 65.3%, var(--green) 69.9%, var(--yellow) 69.9%);
        }

        .notebook-wrapper li::after {
          z-index: 0;
          clip-path: polygon(100% 50%, 50% 100%, 0 50%, 20% 50%, 50% 80%, 80% 50%);
          -webkit-clip-path: polygon(100% 50%, 50% 100%, 0 50%, 20% 50%, 50% 80%, 80% 50%);
          background-repeat: no-repeat;
          background-image: 
            linear-gradient(45deg, var(--yellow) 40%, var(--green) 40%), 
            linear-gradient(-45deg, var(--yellow) 30%, var(--green) 30%);
        }

        .notebook-wrapper li:nth-child(2n)::before {
          background-image: 
            linear-gradient(-45deg, var(--pink) 53.5%, var(--blue) 53.5%, var(--blue) 60%, var(--pink) 60%), 
            linear-gradient(45deg, var(--pink) 65.3%, var(--blue) 65.3%, var(--blue) 69.9%, var(--pink) 69.9%);
        }

        .notebook-wrapper li:nth-child(2n)::after {
          background-image: 
            linear-gradient(45deg, var(--pink) 40%, var(--blue) 40%), 
            linear-gradient(-45deg, var(--pink) 30%, var(--blue) 30%);
        }

        .notebook-wrapper li:nth-child(5n)::before {
          background-image: 
            linear-gradient(-45deg, var(--green) 53.5%, var(--pink) 53.5%, var(--pink) 60%, var(--green) 60%), 
            linear-gradient(45deg, var(--green) 65.3%, var(--pink) 65.3%, var(--pink) 69.9%, var(--green) 69.9%);
        }

        .notebook-wrapper li:nth-child(5n)::after {
          background-image: 
            linear-gradient(45deg, var(--green) 40%, var(--pink) 40%), 
            linear-gradient(-45deg, var(--green) 30%, var(--pink) 30%);
        }

        .notebook-wrapper li:nth-child(7n)::before,
        .notebook-wrapper li:nth-child(7n-4)::before {
          background-image: 
            linear-gradient(-45deg, var(--blue) 53.5%, var(--white) 53.5%, var(--white) 60%, var(--blue) 60%), 
            linear-gradient(45deg, var(--blue) 65.3%, var(--white) 65.3%, var(--white) 69.9%, var(--blue) 69.9%);
        }

        .notebook-wrapper li:nth-child(7n)::after,
        .notebook-wrapper li:nth-child(7n-4)::after {
          background-image: 
            linear-gradient(45deg, var(--blue) 40%, var(--white) 40%), 
            linear-gradient(-45deg, var(--blue) 30%, var(--white) 30%);
        }

        .notebook-wrapper li:nth-child(9n)::before,
        .notebook-wrapper li:nth-child(9n-5)::before {
          background-image: 
            linear-gradient(-45deg, var(--white) 53.5%, var(--green) 53.5%, var(--green) 60%, var(--white) 60%), 
            linear-gradient(45deg, var(--white) 65.3%, var(--green) 65.3%, var(--green) 69.9%, var(--white) 69.9%);
        }

        .notebook-wrapper li:nth-child(9n)::after,
        .notebook-wrapper li:nth-child(9n-5)::after {
          background-image: 
            linear-gradient(45deg, var(--white) 40%, var(--green) 40%), 
            linear-gradient(-45deg, var(--white) 30%, var(--green) 30%);
        }

        .notebook-wrapper img {
          position: absolute;
          z-index: 10;
          width: 43%;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-60%);
          box-shadow: 5px -5px 10px rgba(0, 0, 0, 0.3);
          transition-property: transform;
          transition-duration: .3s;
          cursor: pointer;
        }

        .notebook-wrapper img:hover {
          transform: translateX(-50%) translateY(-60%) scale(1.5);
        }

        @media (min-width: 450px) {
          .notebook-wrapper ul {
            margin: 190px 40px;
          }
        }
        @media (min-width: 600px) {
          .notebook-wrapper {
            --columns: 5;
          }
          .notebook-wrapper li:nth-child(2n) {
            grid-column-start: auto;
          }
          .notebook-wrapper li:nth-child(4n-1) {
            grid-column-start: 2;
          }
        }
        @media (min-width: 900px) {
          .notebook-wrapper {
            --columns: 7;
          }
          .notebook-wrapper li:nth-child(4n-1) {
            grid-column-start: auto;
          }
          .notebook-wrapper li:nth-child(6n-2) {
            grid-column-start: 2;
          }
        }
        @media (min-width: 1200px) {
          .notebook-wrapper {
            --columns: 9;
          }
          .notebook-wrapper li:nth-child(6n-2) {
            grid-column-start: auto;
          }
          .notebook-wrapper li:nth-child(8n-3) {
            grid-column-start: 2;
          }
        }
        @media (min-width: 1500px) {
          .notebook-wrapper {
            --columns: 11;
          }
          .notebook-wrapper li:nth-child(8n-3) {
            grid-column-start: auto;
          }
          .notebook-wrapper li:nth-child(10n-4) {
            grid-column-start: 2;
          }
        }
        @media (min-width: 1800px) {
          .notebook-wrapper {
            --columns: 13;
          }
          .notebook-wrapper li:nth-child(10n-4) {
            grid-column-start: auto;
          }
          .notebook-wrapper li:nth-child(12n-5) {
            grid-column-start: 2;
          }
        }
        @media (min-width: 2100px) {
          .notebook-wrapper {
            --columns: 15;
          }
          .notebook-wrapper li:nth-child(12n-5) {
            grid-column-start: auto;
          }
          .notebook-wrapper li:nth-child(14n-6) {
            grid-column-start: 2;
          }
        }
      `}</style>
    </main>
  );
}