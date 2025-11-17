"use client";

import "./WhoWeAre.css";
import ClickableImage from "@/components/common/ClickableImage";
import "@/components/ui/bg-patterns.css";
import { withBasePath } from "@/components/common/HelperFunction";

const WhoWeAre = () => {
  const images = [
    {
      id: 1,
      src: `/landing/collage/1.jpeg`,
      alt: "Astronautics image 1",
      size: "large",
    },
    {
      id: 2,
      src: `/landing/collage/2.jpeg`,
      alt: "Astronautics image 2",
      size: "medium",
    },
    {
      id: 3,
      src: `/landing/collage/3.jpeg`,
      alt: "Astronautics image 3",
      size: "small",
    },
    {
      id: 4,
      src: `/landing/collage/4.jpeg`,
      alt: "Astronautics image 4",
      size: "medium",
    },
    {
      id: 5,
      src: `/landing/collage/5.jpeg`,
      alt: "Astronautics image 5",
      size: "large",
    },
    {
      id: 6,
      src: `/landing/collage/6.jpeg`,
      alt: "Astronautics image 6",
      size: "small",
    },
    {
      id: 7,
      src: `/landing/collage/7.jpg`,
      alt: "Astronautics image 7",
      size: "medium",
    },
    {
      id: 8,
      src: `/landing/collage/8.jpeg`,
      alt: "Astronautics image 8",
      size: "small",
    },
    {
      id: 9,
      src: `/landing/collage/9.jpeg`,
      alt: "Astronautics image 9",
      size: "small",
    },
    {
      id: 10,
      src: `/landing/collage/10.jpeg`,
      alt: "Astronautics image 10",
      size: "medium",
    },
  ];

  return (
    <section className="who-we-are">
      <div className="container">
        <h2 className="neumorphic-heading">Who We Are</h2>

        <div className="content-wrapper">
          <div className="image-collage">
            {images.map((image) => (
              <div key={image.id} className={`image-frame ${image.size}`}>
                <div className="image-container">
                  <ClickableImage
                    src={withBasePath(image.src)}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 752px) 100vw, (max-width: 1184px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-content">
            <div className="text-content-wrapper">
              <div className="text-content-inner bg-pattern-lines-in-motion">
                <h3 className="modern-heading">A Bunch of Astromaniacs!</h3>
                <div className="text-body">
                  <p>
                    We are the Astronomy and Space Technology Club at IIIT
                    Hyderabad, a vibrant community united by a shared passion
                    for exploring the universe. From stargazing sessions, star
                    parties to hands-on workshops and exciting projects, we
                    bring space science to life for enthusiasts of all levels.
                  </p>
                  <p>
                    We have undertaken exciting projects and participated in
                    numerous National and International competitions, gaining
                    experience and recognition along the way. Join along in our
                    journey into the fascinating world of Astronomy and
                    SpaceTech!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
