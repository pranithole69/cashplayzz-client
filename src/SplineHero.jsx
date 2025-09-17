import React from "react";

const SplineHero = () => {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -1 }}>
      <iframe
        src="https://my.spline.design/thresholddarkambientui-oKjxhePACzfYQPftTbm4pdT4/"
        frameBorder="0"
        width="100%"
        height="100%"
        allowFullScreen
        style={{
          pointerEvents: "none", // lets user interact with buttons on top
          filter: "brightness(0.9)",
        }}
      ></iframe>
    </div>
  );
};

export default SplineHero;
